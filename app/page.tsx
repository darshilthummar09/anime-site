'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Row from '@/components/Row';
import ContinueWatching from '@/components/ContinueWatching';
import { useAnime } from '@/hooks/useAnime';
import { animeData } from '@/data/animeData';

interface AnimeItem {
  id: string;
  title: string;
  image: string;
  description?: string;
  releaseDate?: string;
  type?: string;
}

export default function Home() {
  const { anime, loading, fetchAnime } = useAnime();
  const [featured, setFeatured] = useState<AnimeItem | null>(null);

  useEffect(() => {
    fetchAnime();
  }, []);

  useEffect(() => {
    if (anime.length > 0) {
      setFeatured(anime[0]);
    } else {
      // Use first mock anime as featured if API fails
      setFeatured({
        id: animeData[0].id,
        title: animeData[0].title,
        image: animeData[0].thumbnail,
        description: animeData[0].description,
        releaseDate: animeData[0].year.toString(),
        type: animeData[0].type.toUpperCase(),
      });
    }
  }, [anime]);

  if (loading && anime.length === 0) {
    return (
      <div className="min-h-screen bg-netflix-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-2">Loading anime...</div>
          <div className="text-gray-400 text-sm">Preparing your content</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-netflix-black">
      <Navbar />
      {featured && (() => {
        // Get full anime data from mock data if available
        const fullAnime = animeData.find(a => a.id === featured.id);
        return (
          <Hero
            featured={{
              id: featured.id,
              title: featured.title,
              description: featured.description || '',
              thumbnail: featured.image,
              banner: fullAnime?.banner || featured.image,
              genre: fullAnime?.genre || [],
              year: featured.releaseDate ? parseInt(featured.releaseDate) : 2024,
              rating: fullAnime?.rating || 8.5,
              type: (fullAnime?.type || (featured.type === 'MOVIE' ? 'movie' : 'series')) as 'movie' | 'series',
              episodes: fullAnime?.episodes || [],
            }}
          />
        );
      })()}
      <div className="relative -mt-32 space-y-8 pb-20">
        <ContinueWatching />
        {anime.length > 0 ? (
          <>
            <Row title="Trending Now" animes={anime.slice(0, 10).map(convertToAnime)} />
            <Row title="Popular Anime" animes={anime.slice(10, 20).map(convertToAnime)} />
            <Row title="New Releases" animes={anime.slice(20, 30).map(convertToAnime)} />
            <Row title="Top Rated" animes={anime.slice(30, 40).map(convertToAnime)} />
            <Row title="Action & Adventure" animes={anime.slice(40, 50).map(convertToAnime)} />
            <Row title="Drama Series" animes={anime.slice(50, 60).map(convertToAnime)} />
          </>
        ) : (
          <>
            {/* Fallback to mock data with more variety */}
            <Row title="Trending Now" animes={animeData.slice(0, 8).map(convertMockToAnime)} />
            <Row title="Popular Anime" animes={animeData.slice(0, 8).map(convertMockToAnime)} />
            <Row title="New Releases" animes={animeData.slice(0, 8).map(convertMockToAnime)} />
            <Row title="Top Rated" animes={animeData.slice(0, 8).map(convertMockToAnime)} />
            <Row title="Action & Adventure" animes={animeData.filter(a => a.genre.includes('Action')).slice(0, 8).map(convertMockToAnime)} />
            <Row title="Drama Series" animes={animeData.filter(a => a.genre.includes('Drama')).slice(0, 8).map(convertMockToAnime)} />
            <Row title="Supernatural" animes={animeData.filter(a => a.genre.includes('Supernatural')).slice(0, 8).map(convertMockToAnime)} />
            <Row title="Comedy" animes={animeData.filter(a => a.genre.includes('Comedy')).slice(0, 8).map(convertMockToAnime)} />
          </>
        )}
      </div>
    </div>
  );
}

function convertToAnime(item: AnimeItem) {
  // Use API image if available, otherwise check mock data
  const mockAnime = animeData.find(a => a.id === item.id);
  return {
    id: item.id,
    title: item.title,
    description: item.description || '',
    thumbnail: item.image || mockAnime?.thumbnail || '',
    banner: item.image || mockAnime?.banner || item.image || '',
    genre: mockAnime?.genre || [],
    year: item.releaseDate ? parseInt(item.releaseDate) : (mockAnime?.year || 2024),
    rating: mockAnime?.rating || 8.5,
    type: (item.type === 'MOVIE' ? 'movie' : (item.type === 'TV' ? 'series' : (mockAnime?.type || 'series'))) as 'movie' | 'series',
    episodes: mockAnime?.episodes || [],
  };
}

function convertMockToAnime(anime: typeof animeData[0]) {
  return {
    id: anime.id,
    title: anime.title,
    description: anime.description,
    thumbnail: anime.thumbnail,
    banner: anime.banner,
    genre: anime.genre,
    year: anime.year,
    rating: anime.rating,
    type: anime.type,
    episodes: anime.episodes,
  };
}
