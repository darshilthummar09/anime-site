'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { Anime } from '@/types';

interface RowProps {
  title: string;
  animes: Anime[];
}

export default function Row({ title, animes }: RowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [isMoved, setIsMoved] = useState(false);

  const handleClick = (direction: 'left' | 'right') => {
    setIsMoved(true);
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo =
        direction === 'left'
          ? scrollLeft - clientWidth
          : scrollLeft + clientWidth;
      rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (animes.length === 0) return null;

  return (
    <div className="space-y-0.5 md:space-y-2 px-4 md:px-12">
      <h2 className="w-56 cursor-pointer text-sm font-semibold text-[#e5e5e5] transition duration-200 hover:text-white md:text-2xl">
        {title}
      </h2>
      <div className="group relative md:-ml-2">
        <FiChevronLeft
          className={`absolute top-0 bottom-0 left-2 z-40 m-auto h-9 w-9 cursor-pointer opacity-0 transition hover:scale-125 group-hover:opacity-100 ${
            !isMoved && 'hidden'
          }`}
          onClick={() => handleClick('left')}
        />
        <div
          ref={rowRef}
          className="flex items-center space-x-0.5 overflow-x-scroll scrollbar-hide md:space-x-2.5 md:p-2"
        >
          {animes.map((anime) => (
            <Link
              key={anime.id}
              href={`/anime/${anime.id}`}
              className="relative min-w-[180px] cursor-pointer transition duration-200 ease-out md:min-w-[240px] md:hover:scale-105"
            >
              <div className="relative aspect-video overflow-hidden rounded bg-gray-800">
                <img
                  src={anime.thumbnail || '/placeholder-anime.jpg'}
                  alt={anime.title}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    // Fallback to a default image if API image fails
                    const target = e.target as HTMLImageElement;
                    if (!target.src.includes('placeholder')) {
                      target.src = 'https://picsum.photos/300/450?random=' + anime.id;
                    }
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-200 hover:opacity-100" />
                <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 transition-opacity duration-200 hover:opacity-100">
                  <p className="text-sm font-semibold line-clamp-2">
                    {anime.title}
                  </p>
                  <div className="mt-2 flex items-center space-x-2 text-xs">
                    <span className="text-green-500">★ {anime.rating}</span>
                    <span className="text-gray-400">{anime.year}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <FiChevronRight
          className="absolute top-0 bottom-0 right-2 z-40 m-auto h-9 w-9 cursor-pointer opacity-0 transition hover:scale-125 group-hover:opacity-100"
          onClick={() => handleClick('right')}
        />
      </div>
    </div>
  );
}

