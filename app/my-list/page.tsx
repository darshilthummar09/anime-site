'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { FiPlay, FiX } from 'react-icons/fi';
import { animeData } from '@/data/animeData';
import { Anime } from '@/types';

export default function MyListPage() {
  const [myList, setMyList] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMyList = async () => {
    try {
      setLoading(true);
      
      // Get stored anime data (new format with full objects)
      const storedData = JSON.parse(localStorage.getItem('myListData') || '[]');
      const listIds = JSON.parse(localStorage.getItem('myList') || '[]');
      
      let list: Anime[] = [];
      
      // Process stored data
      for (const item of storedData) {
        if (typeof item === 'string') {
          // Old format: just ID, try to find in mock data
          const mockAnime = animeData.find((a) => a.id === item);
          if (mockAnime) {
            list.push(mockAnime);
          } else {
            // Try to fetch from API
            try {
              const response = await fetch(`/api/anime/${item}`);
              if (response.ok) {
                const apiData = await response.json();
                // Convert API format to Anime format
                const anime: Anime = {
                  id: apiData.id,
                  title: apiData.title,
                  description: apiData.description || '',
                  thumbnail: apiData.image || 'https://picsum.photos/300/450?random=' + apiData.id,
                  banner: apiData.image || 'https://picsum.photos/1920/1080?random=' + apiData.id,
                  genre: apiData.genres || [],
                  year: apiData.releaseDate ? parseInt(apiData.releaseDate) : new Date().getFullYear(),
                  rating: parseFloat(apiData.rating || '0'),
                  type: apiData.type === 'MOVIE' ? 'movie' : 'series',
                  episodes: apiData.episodes?.map((ep: any) => ({
                    id: ep.id,
                    title: ep.title || `Episode ${ep.number}`,
                    episodeNumber: ep.number,
                    duration: 0,
                    videoUrl: '',
                    thumbnail: ep.image || '',
                    description: '',
                  })) || [],
                };
                list.push(anime);
              }
            } catch (error) {
              console.error('Error fetching anime:', error);
            }
          }
        } else {
          // New format: full anime object
          list.push(item as Anime);
        }
      }
      
      // Also check IDs list for backward compatibility (items not yet in storedData)
      for (const id of listIds) {
        if (!list.find((a) => a.id === id)) {
          // Not already in list, try to find it
          const mockAnime = animeData.find((a) => a.id === id);
          if (mockAnime) {
            list.push(mockAnime);
          }
        }
      }
      
      setMyList(list);
    } catch (error) {
      console.error('Error loading my list:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyList();
    
    // Listen for storage changes (when items are added from other tabs/pages)
    const handleStorageChange = () => {
      loadMyList();
    };
    
    // Listen for custom event (same tab updates)
    const handleCustomStorageChange = () => {
      loadMyList();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('myListUpdated', handleCustomStorageChange);
    
    // Listen for visibility change (when tab becomes visible)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadMyList();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('myListUpdated', handleCustomStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const removeFromList = (animeId: string) => {
    // Remove from both old and new format
    const listIds = JSON.parse(localStorage.getItem('myList') || '[]');
    const storedData = JSON.parse(localStorage.getItem('myListData') || '[]');
    
    const newListIds = listIds.filter((id: string) => id !== animeId);
    const newStoredData = storedData.filter((item: any) => {
      const itemId = typeof item === 'string' ? item : item.id;
      return itemId !== animeId;
    });
    
    localStorage.setItem('myList', JSON.stringify(newListIds));
    localStorage.setItem('myListData', JSON.stringify(newStoredData));
    
    // Update state immediately
    setMyList(myList.filter((anime) => anime.id !== animeId));
    
    // Dispatch custom event for same tab updates
    window.dispatchEvent(new Event('myListUpdated'));
    // Also dispatch storage event for other tabs
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <div className="min-h-screen bg-netflix-black">
      <Navbar />
      <div className="pt-24 px-4 md:px-12 pb-12">
        <h1 className="text-4xl font-bold mb-8">My List</h1>

        {loading ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-xl">Loading your list...</p>
          </div>
        ) : myList.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {myList.map((anime) => (
              <div key={anime.id} className="group relative">
                <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-gray-800">
                  <img
                    src={anime.thumbnail}
                    alt={anime.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => removeFromList(anime.id)}
                      className="w-8 h-8 rounded-full bg-black/70 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/90 transition"
                    >
                      <FiX size={18} />
                    </button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <h3 className="font-semibold mb-2 line-clamp-2">{anime.title}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-300">
                      <span className="text-green-500">★ {anime.rating}</span>
                      <span>{anime.year}</span>
                    </div>
                    <Link
                      href={`/watch/${anime.id}/${anime.episodes[0]?.id || ''}`}
                      className="mt-2 flex items-center space-x-1 bg-white text-black px-3 py-1 rounded text-sm font-semibold hover:bg-opacity-80 transition w-fit"
                    >
                      <FiPlay size={14} />
                      <span>Play</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-400 text-xl mb-4">Your list is empty</p>
            <Link
              href="/browse"
              className="text-netflix-red hover:underline"
            >
              Browse anime to add to your list
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

