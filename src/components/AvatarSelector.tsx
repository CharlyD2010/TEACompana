
'use client';

import React from 'react';
import { APP_AVATARS } from '@/lib/avatars';
import { cn } from '@/lib/utils';

interface AvatarSelectorProps {
  selectedKey?: string;
  onSelect: (key: string) => void;
}

export const AvatarSelector = ({ selectedKey, onSelect }: AvatarSelectorProps) => {
  return (
    <div className="grid grid-cols-5 gap-3">
      {APP_AVATARS.map((avatar) => (
        <button
          key={avatar.key}
          type="button"
          onClick={() => onSelect(avatar.key)}
          className={cn(
            "w-12 h-12 flex items-center justify-center text-2xl rounded-2xl transition-all border-2",
            selectedKey === avatar.key
              ? "border-primary bg-primary/10 scale-110 shadow-lg shadow-primary/20"
              : "border-muted bg-white hover:border-primary/30"
          )}
          title={avatar.label}
        >
          {avatar.emoji}
        </button>
      ))}
    </div>
  );
};
