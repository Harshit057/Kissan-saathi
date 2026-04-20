'use client';

import { LANGUAGES } from '@/lib/constants';
import { useAuthStore } from '@/store/auth';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

export function LanguagePill() {
  const { user, setLanguage } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = user?.language || 'hi';
  const currentLangName = LANGUAGES.find((l) => l.code === currentLanguage)?.name || 'हिंदी';

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium hover:bg-primary/20 transition"
      >
        {currentLangName}
        <ChevronDown size={16} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-white border border-border rounded-lg shadow-lg z-50 min-w-40">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-3 text-base font-medium transition ${
                currentLanguage === lang.code
                  ? 'bg-primary/10 text-primary'
                  : 'hover:bg-muted text-foreground'
              }`}
            >
              {lang.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
