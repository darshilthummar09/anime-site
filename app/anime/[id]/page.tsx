'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { FiPlay, FiPlus, FiCheck, FiThumbsUp, FiThumbsDown, FiShare2, FiLock } from 'react-icons/fi';
import { usePremium } from '@/contexts/PremiumContext';
import { animeData } from '@/data/animeData';

interface AnimeInfo {
  id: string;
  title: string;
  image: string;
  description: string;
  releaseDate: string;
  status: string;
  type: string;
  totalEpisodes: number;
  genres: string[];
  episodes: Array<{
    id: string;
    number: number;
    title?: string;
    image?: string;
  }>;
}

export default function AnimeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isPremium } = usePremium();
  const [anime, setAnime] = useState<AnimeInfo | null>(null);
  const [isInList, setIsInList] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedEpisode, setSelectedEpisode] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnimeInfo = async () => {
      const id = params.id as string;
      try {
        setLoading(true);
        
        // First check mock data (always works)
        const mockAnime = animeData.find((a) => a.id === id);
        if (mockAnime) {
          const apiFormat: AnimeInfo = {
            id: mockAnime.id,
            title: mockAnime.title,
            image: mockAnime.banner,
            description: mockAnime.description,
            releaseDate: mockAnime.year.toString(),
            status: 'RELEASING',
            type: mockAnime.type.toUpperCase(),
            totalEpisodes: mockAnime.episodes.length,
            genres: mockAnime.genre,
            episodes: mockAnime.episodes.map((ep) => ({
              id: ep.id,
              number: ep.episodeNumber,
              title: ep.title,
              image: ep.thumbnail,
            })),
          };
          setAnime(apiFormat);
          if (apiFormat.episodes && apiFormat.episodes.length > 0) {
            setSelectedEpisode(apiFormat.episodes[0].id);
          }
          // Check if in list (check both old and new format)
          const myListIds = JSON.parse(localStorage.getItem('myList') || '[]');
          const myListData = JSON.parse(localStorage.getItem('myListData') || '[]');
          const inList = myListIds.includes(id) || myListData.some((item: any) => {
            const itemId = typeof item === 'string' ? item : item.id;
            return itemId === id;
          });
          setIsInList(inList);
          setLoading(false);
          return;
        }
        
        // Try API if not in mock data
        const response = await fetch(`/api/anime/${id}`);
        if (response.ok) {
          const data: AnimeInfo = await response.json();
          setAnime(data);
          if (data.episodes && data.episodes.length > 0) {
            setSelectedEpisode(data.episodes[0].id);
          }
          // Check if in list (check both old and new format)
          const myListIds = JSON.parse(localStorage.getItem('myList') || '[]');
          const myListData = JSON.parse(localStorage.getItem('myListData') || '[]');
          const inList = myListIds.includes(id) || myListData.some((item: any) => {
            const itemId = typeof item === 'string' ? item : item.id;
            return itemId === id;
          });
          setIsInList(inList);
        }
      } catch (error) {
        // Silently handle - mock data already checked
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchAnimeInfo();
    }
  }, [params]);

  const toggleMyList = () => {
    if (!anime) return;
    
    // Get current list (stored as full anime objects or IDs for backward compatibility)
    const myListData = JSON.parse(localStorage.getItem('myListData') || '[]');
    const myListIds = JSON.parse(localStorage.getItem('myList') || '[]');
    
    if (isInList) {
      // Remove from list
      const newListData = myListData.filter((item: any) => {
        // Handle both old format (just ID string) and new format (anime object)
        const itemId = typeof item === 'string' ? item : item.id;
        return itemId !== anime.id;
      });
      const newListIds = myListIds.filter((id: string) => id !== anime.id);
      
      localStorage.setItem('myListData', JSON.stringify(newListData));
      localStorage.setItem('myList', JSON.stringify(newListIds)); // Keep for backward compatibility
      setIsInList(false);
    } else {
      // Add to list - store full anime data
      const animeData = {
        id: anime.id,
        title: anime.title,
        description: anime.description || '',
        thumbnail: anime.image || '',
        banner: anime.image || '',
        genre: anime.genres || [],
        year: anime.releaseDate ? parseInt(anime.releaseDate) : new Date().getFullYear(),
        rating: 0, // Will be updated if available
        type: anime.type === 'MOVIE' ? 'movie' : 'series',
        episodes: anime.episodes?.map((ep) => ({
          id: ep.id,
          title: ep.title || `Episode ${ep.number}`,
          episodeNumber: ep.number,
          duration: 0,
          videoUrl: '',
          thumbnail: ep.image || '',
          description: '',
        })) || [],
      };
      
      // Check if already exists (backward compatibility)
      const exists = myListData.some((item: any) => {
        const itemId = typeof item === 'string' ? item : item.id;
        return itemId === anime.id;
      });
      
      if (!exists) {
        myListData.push(animeData);
        myListIds.push(anime.id);
        localStorage.setItem('myListData', JSON.stringify(myListData));
        localStorage.setItem('myList', JSON.stringify(myListIds)); // Keep for backward compatibility
      }
      setIsInList(true);
    }
    
    // Dispatch custom event so same tab can update
    window.dispatchEvent(new Event('myListUpdated'));
    // Also dispatch storage event for other tabs
    window.dispatchEvent(new Event('storage'));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-netflix-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!anime) {
    return (
      <div className="min-h-screen bg-netflix-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-white">Anime not found</h2>
          <Link
            href="/browse"
            className="text-netflix-red hover:underline"
          >
            Browse anime
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-netflix-black">
      <Navbar />
      <div className="relative">
        {/* Banner */}
        <div
          className="relative h-[60vh] bg-cover bg-center"
          style={{ 
            backgroundImage: `url(${anime.image || 'https://picsum.photos/1920/1080?random=' + anime.id})`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-netflix-black via-netflix-black/90 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-netflix-black via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="relative -mt-32 px-4 md:px-12 pb-12">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">{anime.title}</h1>
            <div className="flex items-center space-x-4 mb-4">
              <span className="text-gray-400">{anime.releaseDate}</span>
              <span className="text-gray-400">{anime.type}</span>
              <span className="text-gray-400">{anime.totalEpisodes} Episodes</span>
              <span className="text-gray-400">{anime.status}</span>
            </div>
            <p className="text-lg text-gray-300 mb-6 max-w-2xl">{anime.description}</p>
            {anime.genres && anime.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {anime.genres.map((g) => (
                  <span
                    key={g}
                    className="px-3 py-1 bg-gray-800 rounded-full text-sm text-gray-300"
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 mb-8">
              {selectedEpisode && (
                <Link
                  href={`/watch/${anime.id}/${selectedEpisode}`}
                  className="flex items-center space-x-2 bg-white text-black px-6 py-3 rounded font-semibold hover:bg-opacity-80 transition"
                >
                  <FiPlay size={20} />
                  <span>Play</span>
                </Link>
              )}
              <button
                onClick={toggleMyList}
                className={`flex items-center space-x-2 px-6 py-3 rounded font-semibold transition ${
                  isInList
                    ? 'bg-gray-600 text-white hover:bg-gray-700'
                    : 'bg-gray-600/70 text-white hover:bg-gray-600'
                }`}
              >
                {isInList ? <FiCheck size={20} /> : <FiPlus size={20} />}
                <span>My List</span>
              </button>
              <button className="flex items-center space-x-2 bg-gray-600/70 text-white px-6 py-3 rounded font-semibold hover:bg-gray-600 transition">
                <FiThumbsUp size={20} />
              </button>
              <button className="flex items-center space-x-2 bg-gray-600/70 text-white px-6 py-3 rounded font-semibold hover:bg-gray-600 transition">
                <FiThumbsDown size={20} />
              </button>
              <button className="flex items-center space-x-2 bg-gray-600/70 text-white px-6 py-3 rounded font-semibold hover:bg-gray-600 transition">
                <FiShare2 size={20} />
              </button>
            </div>

            {/* Episodes */}
            {anime.episodes && anime.episodes.length > 0 && (
              <div className="mt-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Episodes</h2>
                  {!isPremium && (
                    <Link
                      href="/subscription"
                      className="flex items-center space-x-2 text-netflix-red hover:underline"
                    >
                      <FiLock size={18} />
                      <span>Upgrade to Premium to watch</span>
                    </Link>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {anime.episodes.map((ep) => (
                    <Link
                      key={ep.id}
                      href={isPremium ? `/watch/${anime.id}/${ep.id}` : '/subscription'}
                      className={`relative aspect-video overflow-hidden rounded-lg bg-gray-800 ${
                        !isPremium ? 'opacity-60' : 'hover:scale-105 transition'
                      }`}
                    >
                      {ep.image ? (
                        <img
                          src={ep.image}
                          alt={ep.title || `Episode ${ep.number}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-700">
                          <span className="text-gray-400">{ep.number}</span>
                        </div>
                      )}
                      {!isPremium && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                          <FiLock className="text-white" size={24} />
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                        <p className="text-white text-xs font-semibold line-clamp-1">
                          {ep.title || `Episode ${ep.number}`}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
