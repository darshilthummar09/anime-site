'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiPlay, FiInfo } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { Anime } from '@/types';

interface HeroProps {
  featured: Anime;
}

export default function Hero({ featured }: HeroProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="relative h-[80vh] md:h-[90vh] w-full overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${featured.banner || featured.thumbnail})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-netflix-black via-netflix-black/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-netflix-black via-transparent to-transparent" />
      </div>

      <div className="relative z-10 h-full flex items-center px-4 md:px-12">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-2xl">
            {featured.title}
          </h1>
          <p className="text-lg md:text-xl mb-6 text-gray-300 line-clamp-3 drop-shadow-lg">
            {featured.description}
          </p>
          <div className="flex space-x-4">
            <Link
              href={`/watch/${featured.id}/${featured.episodes[0]?.id || ''}`}
              className="flex items-center space-x-2 bg-white text-black px-8 py-3 rounded font-semibold hover:bg-opacity-80 transition"
            >
              <FiPlay size={24} />
              <span>Play</span>
            </Link>
            <Link
              href={`/anime/${featured.id}`}
              className="flex items-center space-x-2 bg-gray-600/70 text-white px-8 py-3 rounded font-semibold hover:bg-gray-600 transition"
            >
              <FiInfo size={24} />
              <span>More Info</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

