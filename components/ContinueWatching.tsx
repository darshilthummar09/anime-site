'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiPlay, FiClock } from 'react-icons/fi';
import { animeData } from '@/data/animeData';
import { Anime } from '@/types';

export default function ContinueWatching() {
  const [continueWatching, setContinueWatching] = useState<Array<{
    anime: Anime;
    episodeId: string;
    progress: number;
  }>>([]);

  useEffect(() => {
    const history: Array<{
      anime: Anime;
      episodeId: string;
      progress: number;
    }> = [];

    animeData.forEach((anime) => {
      anime.episodes.forEach((episode) => {
        const progressKey = `progress-${anime.id}-${episode.id}`;
        const progress = localStorage.getItem(progressKey);
        if (progress && parseInt(progress, 10) > 0) {
          const episodeData = anime.episodes.find((e) => e.id === episode.id);
          if (episodeData && parseInt(progress, 10) < episodeData.duration * 0.9) {
            history.push({
              anime,
              episodeId: episode.id,
              progress: parseInt(progress, 10),
            });
          }
        }
      });
    });

    // Sort by most recent (in a real app, use actual timestamps)
    setContinueWatching(history.slice(0, 10));
  }, []);

  if (continueWatching.length === 0) return null;

  return (
    <div className="space-y-0.5 md:space-y-2 px-4 md:px-12">
      <h2 className="w-56 cursor-pointer text-sm font-semibold text-[#e5e5e5] transition duration-200 hover:text-white md:text-2xl flex items-center space-x-2">
        <FiClock size={20} />
        <span>Continue Watching</span>
      </h2>
      <div className="flex items-center space-x-0.5 overflow-x-scroll scrollbar-hide md:space-x-2.5 md:p-2">
        {continueWatching.map((item) => {
          const episode = item.anime.episodes.find((e) => e.id === item.episodeId);
          if (!episode) return null;
          const progressPercent = (item.progress / episode.duration) * 100;

          return (
            <Link
              key={`${item.anime.id}-${item.episodeId}`}
              href={`/watch/${item.anime.id}/${item.episodeId}`}
              className="relative min-w-[180px] cursor-pointer transition duration-200 ease-out md:min-w-[240px] md:hover:scale-105"
            >
              <div className="relative aspect-video overflow-hidden rounded bg-gray-800">
                <img
                  src={episode.thumbnail}
                  alt={episode.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                  <div
                    className="h-full bg-netflix-red"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <FiPlay className="text-white ml-1" size={20} />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 hover:opacity-100 transition">
                  <p className="text-sm font-semibold line-clamp-1">
                    {item.anime.title}
                  </p>
                  <p className="text-xs text-gray-300 mt-1 line-clamp-1">
                    Episode {episode.episodeNumber}: {episode.title}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

