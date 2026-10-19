import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { requireSession, logAuthDiagnostic, ServerConfigError } from '@/lib/auth';
import { supabaseAdmin, DEFAULT_STORAGE_BUCKET, CANDIDATE_BUCKETS } from '@/lib/supabase';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB real byte limit

interface SniffResult {
  ext: string;
  mime: string;
}

/**
 * Sniffs binary magic bytes and allows strictly JPEG, PNG, and WebP.
 * Strictly rejects SVG, HTML, scripts, and malformed files.
 */
function sniffImageMagicBytes(buffer: Buffer): SniffResult | null {
  if (!buffer || buffer.length < 12) return null;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { ext: '.jpg', mime: 'image/jpeg' };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { ext: '.png', mime: 'image/png' };
  }

  // WebP: RIFF at 0..3 and WEBP at 8..11
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return { ext: '.webp', mime: 'image/webp' };
  }

  return null;
}

export async function POST(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID().slice(0, 8);
  try {
    // 1. Enforce authenticated session
    let session;
    try {
      session = await requireSession();
      logAuthDiagnostic(requestId, request.method, '/api/upload', 'AUTHORIZED_SESSION');
    } catch (authErr: any) {
      if (
        authErr instanceof ServerConfigError ||
        authErr?.statusCode === 500 ||
        authErr?.code === 'SERVER_CONFIGURATION_ERROR'
      ) {
        logAuthDiagnostic(requestId, request.method, '/api/upload', 'SERVER_CONFIG_ERROR');
        return NextResponse.json(
          {
            error: 'Server configuration error: Authentication is misconfigured in production.',
            code: 'SERVER_CONFIGURATION_ERROR'
          },
          { status: 500 }
        );
      }
      logAuthDiagnostic(requestId, request.method, '/api/upload', 'DENIED_UNAUTHORIZED');
      return NextResponse.json(
        {
          error: 'Unauthorized: You must be signed in to upload assets.',
          code: 'UNAUTHORIZED'
        },
        { status: 401 }
      );
    }

    let buffer: Buffer | null = null;
    let requestedBucket = DEFAULT_STORAGE_BUCKET;

    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const jsonBody = await request.json().catch(() => ({}));
      const rawData = jsonBody.file || jsonBody.image || jsonBody.dataUrl || jsonBody.avatar || jsonBody.cover;
      const jBucket = jsonBody.bucket || jsonBody.category || jsonBody.type;
      if (jBucket === 'links' || jBucket === 'link' || jBucket === 'social') {
        requestedBucket = 'links';
      }

      if (!rawData || typeof rawData !== 'string') {
        return NextResponse.json(
          { error: 'No image data provided.' },
          { status: 400 }
        );
      }

      // Reject user-supplied external URLs: must be uploaded directly
      if (rawData.startsWith('http://') || rawData.startsWith('https://')) {
        return NextResponse.json(
          { error: 'External image URLs cannot be passed directly. Please upload the raw image file.' },
          { status: 400 }
        );
      }

      // Base64 data URI
      if (rawData.startsWith('data:')) {
        const matches = rawData.match(/^data:([a-zA-Z0-9/+.-]+);base64,(.+)$/);
        if (!matches || !matches[2]) {
          return NextResponse.json(
            { error: 'Invalid base64 image data.' },
            { status: 400 }
          );
        }
        buffer = Buffer.from(matches[2], 'base64');
      } else {
        buffer = Buffer.from(rawData, 'base64');
      }
    } else {
      // Multipart form data
      let formData: FormData;
      try {
        formData = await request.formData();
      } catch {
        return NextResponse.json(
          { error: 'Invalid form data. Please upload a valid image file.' },
          { status: 400 }
        );
      }

      const formBucket = (formData.get('bucket') || formData.get('category') || formData.get('type')) as string | null;
      if (formBucket === 'links' || formBucket === 'link' || formBucket === 'social') {
        requestedBucket = 'links';
      }

      const file = (formData.get('file') || formData.get('image') || formData.get('avatar')) as File | string | null;

      if (!file) {
        return NextResponse.json(
          { error: 'No file provided.' },
          { status: 400 }
        );
      }

      if (typeof file === 'string') {
        return NextResponse.json(
          { error: 'Invalid image format. Direct string URLs are rejected.' },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      buffer = Buffer.from(bytes);
    }

    if (!buffer || buffer.length === 0) {
      return NextResponse.json(
        { error: 'Empty file received.' },
        { status: 400 }
      );
    }

    // 2. Enforce 5 MB maximum real byte size
    if (buffer.length > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds the 5MB limit. Please upload a smaller image.' },
        { status: 400 }
      );
    }

    // 3. Sniff magic bytes (Allow only JPEG, PNG, WebP; reject SVG and malformed data)
    const detected = sniffImageMagicBytes(buffer);
    if (!detected) {
      return NextResponse.json(
        { error: 'Invalid or unsupported image format. Only JPEG, PNG, and WebP images are allowed (SVG and other file formats are rejected).' },
        { status: 400 }
      );
    }

    // 4. Secure path isolation: {userId}/{randomUUID}.{ext} with upsert: false
    const uniqueFileId = crypto.randomUUID();
    const filePath = `${session.id}/${uniqueFileId}${detected.ext}`;

    // 5. Upload via server using service key to Supabase Storage
    const bucket = CANDIDATE_BUCKETS.includes(requestedBucket) ? requestedBucket : DEFAULT_STORAGE_BUCKET;

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(bucket)
      .upload(filePath, buffer, {
        contentType: detected.mime,
        upsert: false // Prevent overwriting any existing files
      });

    if (uploadError || !uploadData?.path) {
      console.error('Supabase Storage Upload Error:', uploadError?.message || 'Unknown upload failure');
      return NextResponse.json(
        { error: 'Failed to upload asset to storage service. Please try again.' },
        { status: 500 }
      );
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(uploadData.path);

    return NextResponse.json({
      success: true,
      url: publicUrlData.publicUrl,
      filename: filePath,
      bucket,
      storage: 'supabase',
      size: buffer.length,
      mimeType: detected.mime
    }, { status: 200 });

  } catch (error: any) {
    console.error('File Upload API Error:', error?.message || 'Unknown error');
    return NextResponse.json(
      { error: 'An unexpected error occurred during file upload.' },
      { status: 500 }
    );
  }
}
