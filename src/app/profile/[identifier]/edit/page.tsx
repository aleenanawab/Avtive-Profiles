import { redirect } from 'next/navigation';

interface ProfileIdentifierEditProps {
  params: Promise<{ identifier: string }>;
}

export default async function ProfileIdentifierEditPage({ params }: ProfileIdentifierEditProps) {
  const { identifier } = await params;
  redirect(`/profile/${encodeURIComponent(identifier)}?edit=true`);
}
