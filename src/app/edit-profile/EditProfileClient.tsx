'use client';

import React from 'react';
import { ProfileData } from '@/types/profile';
import { ProfileBuilderClient } from '@/components/builder/ProfileBuilderClient';

interface EditProfileClientProps {
  initialProfile: ProfileData;
  userProfiles?: ProfileData[];
}

export function EditProfileClient({ initialProfile, userProfiles }: EditProfileClientProps) {
  return (
    <ProfileBuilderClient 
      initialProfile={initialProfile} 
      userProfiles={userProfiles} 
    />
  );
}
