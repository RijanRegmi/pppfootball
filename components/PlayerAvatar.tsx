'use client';

import { useState, useEffect } from 'react';

interface PlayerAvatarProps {
  name: string;
  team?: string;
  position?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  avatarUrl?: string | null;
}

const photoCache = new Map<string, string>();

async function fetchWikiImage(query: string): Promise<string | null> {
  try {
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`);
    if (!res.ok) return null;
    const data = await res.json();
    
    // Strict Validation: Ensure the article is about a football player!
    const text = ((data.description || '') + ' ' + (data.extract || '')).toLowerCase();
    const isFootballer = /footballer|football|soccer|player|midfielder|defender|forward|striker|goalkeeper|winger|premier league|la liga|madrid|barcelona|bayern|juventus|psg|arsenal|chelsea|liverpool|manchester|tottenham/i.test(text);

    if (data && data.type !== 'disambiguation' && isFootballer && data.thumbnail && data.thumbnail.source) {
      return data.thumbnail.source;
    }
  } catch (e) {
    // ignore
  }
  return null;
}

export default function PlayerAvatar({ name, team, position, size = 'hero', avatarUrl }: PlayerAvatarProps) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(avatarUrl || photoCache.get(name) || null);
  const [imgError, setImgError] = useState(false);
  const [loading, setLoading] = useState(!avatarUrl && !photoCache.has(name));

  useEffect(() => {
    if (!name) return;

    if (avatarUrl) {
      setPhotoUrl(avatarUrl);
      setLoading(false);
      setImgError(false);
      return;
    }

    if (photoCache.has(name)) {
      setPhotoUrl(photoCache.get(name)!);
      setLoading(false);
      setImgError(false);
      return;
    }

    setLoading(true);
    setImgError(false);

    const formattedName = name.trim().replace(/ /g, '_');

    async function loadPlayerPhoto() {
      let src = await fetchWikiImage(formattedName);
      
      if (!src) {
        src = await fetchWikiImage(`${formattedName}_(footballer)`);
      }

      if (!src) {
        src = await fetchWikiImage(`${formattedName}_(association_footballer)`);
      }

      if (src) {
        photoCache.set(name, src);
        setPhotoUrl(src);
      } else {
        const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0F172A&color=10B981&bold=true&size=256`;
        photoCache.set(name, fallback);
        setPhotoUrl(fallback);
      }
      setLoading(false);
    }

    loadPlayerPhoto();
  }, [name, avatarUrl]);

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const sizeClasses = {
    sm: 'w-14 h-14 text-sm',
    md: 'w-24 h-24 text-2xl',
    lg: 'w-32 h-32 text-3xl',
    xl: 'w-40 h-40 text-4xl',
    hero: 'w-44 h-44 sm:w-52 sm:h-52 text-5xl',
  };

  return (
    <div className="relative inline-block shrink-0">
      <div
        className={`${sizeClasses[size]} rounded-3xl overflow-hidden shadow-2xl border-4 border-pitch-500/40 dark:border-pitch-500/50 flex items-center justify-center bg-carbon-800 text-white font-extrabold tracking-wider relative group shadow-pitch-500/20`}
      >
        {photoUrl && !imgError ? (
          <img
            src={photoUrl}
            alt={name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-pitch-600 to-pitch-800 flex items-center justify-center text-white font-bold">
            {initials}
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 bg-carbon-900/60 backdrop-blur-xs flex items-center justify-center">
            <div className="w-6 h-6 rounded-full border-2 border-pitch-500 border-t-transparent animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}
