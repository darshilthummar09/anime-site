'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { FiPlay, FiClock, FiUser, FiStar, FiHeart, FiSettings, FiAward, FiTrendingUp } from 'react-icons/fi';
import { animeData } from '@/data/animeData';
import { usePremium } from '@/contexts/PremiumContext';
import { Anime } from '@/types';

export default function ProfilePage() {
  const { isPremium } = usePremium();
  const [watchHistory, setWatchHistory] = useState<Array<{
    anime: Anime;
    episodeId: string;
    progress: number;
    lastWatched: Date;
  }>>([]);
  const [stats, setStats] = useState({
    totalWatched: 0,
    totalEpisodes: 0,
    totalHours: 0,
    favoriteGenres: [] as string[],
  });

  useEffect(() => {
    const history: Array<{
      anime: Anime;
      episodeId: string;
      progress: number;
      lastWatched: Date;
    }> = [];
    const genreCount: { [key: string]: number } = {};

    animeData.forEach((anime) => {
      anime.episodes.forEach((episode) => {
        const progressKey = `progress-${anime.id}-${episode.id}`;
        const progress = localStorage.getItem(progressKey);
        if (progress && parseInt(progress, 10) > 0) {
          history.push({
            anime,
            episodeId: episode.id,
            progress: parseInt(progress, 10),
            lastWatched: new Date(),
          });
          
          // Count genres
          anime.genre.forEach((genre) => {
            genreCount[genre] = (genreCount[genre] || 0) + 1;
          });
        }
      });
    });

    // Sort by last watched (most recent first)
    history.sort((a, b) => b.lastWatched.getTime() - a.lastWatched.getTime());
    setWatchHistory(history);

    // Calculate stats
    const totalHours = history.reduce((sum, item) => {
      const episode = item.anime.episodes.find((e) => e.id === item.episodeId);
      return sum + (episode ? item.progress / 3600 : 0);
    }, 0);

    const favoriteGenres = Object.entries(genreCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([genre]) => genre);

    setStats({
      totalWatched: history.length,
      totalEpisodes: new Set(history.map((h) => h.anime.id)).size,
      totalHours: Math.round(totalHours * 10) / 10,
      favoriteGenres,
    });
  }, []);

  const continueWatching = watchHistory
    .filter((item) => {
      const episode = item.anime.episodes.find((e) => e.id === item.episodeId);
      return episode && item.progress < episode.duration * 0.9; // Not finished
    })
    .slice(0, 10);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const hours = Math.floor(mins / 60);
    if (hours > 0) {
      return `${hours}h ${mins % 60}m`;
    }
    return `${mins}m`;
  };

  const myList = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('myList') || '[]') : [];
  const myListAnime = animeData.filter((anime) => myList.includes(anime.id));

  return (
    <div className="min-h-screen bg-netflix-black">
      <Navbar />
      <div className="pt-24 px-4 md:px-12 pb-12">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">My Profile</h1>

          {/* User Info Card */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg p-8 mb-8 border border-gray-700">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
              <div className="relative">
                <div className="w-32 h-32 bg-gradient-to-br from-netflix-red to-red-800 rounded-full flex items-center justify-center shadow-2xl">
                  <FiUser className="text-white" size={48} />
                </div>
                {isPremium && (
                  <div className="absolute -top-2 -right-2 bg-yellow-500 rounded-full p-2">
                    <FiStar className="text-white" size={16} />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h2 className="text-3xl font-bold">AnimeFlix User</h2>
                  {isPremium && (
                    <span className="bg-netflix-red text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
                      <FiStar size={12} />
                      <span>Premium</span>
                    </span>
                  )}
                </div>
                <p className="text-gray-400 mb-4">Member since January 2024</p>
                <Link
                  href="/account"
                  className="inline-flex items-center space-x-2 text-gray-300 hover:text-white transition"
                >
                  <FiSettings size={18} />
                  <span>Account Settings</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-center space-x-3 mb-2">
                <FiPlay className="text-netflix-red" size={24} />
                <h3 className="text-gray-400 text-sm">Episodes Watched</h3>
              </div>
              <p className="text-3xl font-bold">{stats.totalWatched}</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-center space-x-3 mb-2">
                <FiTrendingUp className="text-green-500" size={24} />
                <h3 className="text-gray-400 text-sm">Series Watched</h3>
              </div>
              <p className="text-3xl font-bold">{stats.totalEpisodes}</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-center space-x-3 mb-2">
                <FiClock className="text-blue-500" size={24} />
                <h3 className="text-gray-400 text-sm">Hours Watched</h3>
              </div>
              <p className="text-3xl font-bold">{stats.totalHours}</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-center space-x-3 mb-2">
                <FiHeart className="text-pink-500" size={24} />
                <h3 className="text-gray-400 text-sm">My List</h3>
              </div>
              <p className="text-3xl font-bold">{myListAnime.length}</p>
            </div>
          </div>

          {/* Favorite Genres */}
          {stats.favoriteGenres.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 flex items-center space-x-2">
                <FiAward className="text-yellow-500" size={24} />
                <span>Favorite Genres</span>
              </h2>
              <div className="flex flex-wrap gap-3">
                {stats.favoriteGenres.map((genre) => (
                  <span
                    key={genre}
                    className="bg-netflix-red/20 border border-netflix-red/50 text-netflix-red px-4 py-2 rounded-full font-semibold"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* My List */}
          {myListAnime.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold flex items-center space-x-2">
                  <FiHeart className="text-pink-500" size={24} />
                  <span>My List</span>
                </h2>
                <Link
                  href="/my-list"
                  className="text-netflix-red hover:underline text-sm"
                >
                  View All
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {myListAnime.slice(0, 10).map((anime) => (
                  <Link
                    key={anime.id}
                    href={`/anime/${anime.id}`}
                    className="group relative"
                  >
                    <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-gray-800">
                      <img
                        src={anime.thumbnail}
                        alt={anime.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                          {anime.title}
                        </h3>
                        <div className="flex items-center space-x-2 text-xs text-gray-300">
                          <span>★ {anime.rating}</span>
                          <span>•</span>
                          <span>{anime.year}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Continue Watching */}
          {continueWatching.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-semibold mb-6 flex items-center space-x-2">
                <FiClock className="text-blue-500" size={24} />
                <span>Continue Watching</span>
              </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {continueWatching.map((item) => {
                const episode = item.anime.episodes.find((e) => e.id === item.episodeId);
                if (!episode) return null;
                const progressPercent = (item.progress / episode.duration) * 100;

                return (
                  <Link
                    key={`${item.anime.id}-${item.episodeId}`}
                    href={`/watch/${item.anime.id}/${item.episodeId}`}
                    className="group relative"
                  >
                    <div className="relative aspect-video overflow-hidden rounded-lg bg-gray-800">
                      <img
                        src={episode.thumbnail}
                        alt={episode.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                        <div
                          className="h-full bg-netflix-red"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <FiPlay className="text-white ml-1" size={20} />
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <h3 className="font-semibold text-sm mb-1 line-clamp-1">
                          {item.anime.title}
                        </h3>
                        <p className="text-xs text-gray-300 line-clamp-1">
                          Episode {episode.episodeNumber}: {episode.title}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Watch History */}
        {watchHistory.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-6">Watch History</h2>
            <div className="space-y-4">
              {watchHistory.slice(0, 20).map((item) => {
                const episode = item.anime.episodes.find((e) => e.id === item.episodeId);
                if (!episode) return null;

                return (
                  <div
                    key={`${item.anime.id}-${item.episodeId}`}
                    className="flex items-center space-x-4 bg-gray-900 rounded-lg p-4 hover:bg-gray-800 transition"
                  >
                    <Link
                      href={`/watch/${item.anime.id}/${item.episodeId}`}
                      className="relative w-32 h-20 flex-shrink-0 overflow-hidden rounded"
                    >
                      <img
                        src={episode.thumbnail}
                        alt={episode.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                        <FiPlay className="text-white" size={24} />
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/anime/${item.anime.id}`}
                        className="text-lg font-semibold hover:text-netflix-red transition"
                      >
                        {item.anime.title}
                      </Link>
                      <p className="text-gray-400 text-sm">
                        Episode {episode.episodeNumber}: {episode.title}
                      </p>
                      <p className="text-gray-500 text-xs mt-1">
                        Watched {formatTime(item.progress)} of {formatTime(episode.duration)}
                      </p>
                    </div>
                    <Link
                      href={`/watch/${item.anime.id}/${item.episodeId}`}
                      className="flex items-center space-x-2 bg-white text-black px-4 py-2 rounded font-semibold hover:bg-opacity-80 transition"
                    >
                      <FiPlay size={18} />
                      <span>Continue</span>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {watchHistory.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-xl mb-4">No watch history yet</p>
            <Link
              href="/browse"
              className="text-netflix-red hover:underline"
            >
              Start watching anime
            </Link>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}

