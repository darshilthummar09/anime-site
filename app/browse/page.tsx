'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { FiSearch, FiPlay, FiLock } from 'react-icons/fi';
import { useAnime } from '@/hooks/useAnime';
import { usePremium } from '@/contexts/PremiumContext';

export default function BrowsePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  const [searchTerm, setSearchTerm] = useState(query);
  const { anime, loading, fetchAnime } = useAnime();
  const { isPremium } = usePremium();

  useEffect(() => {
    if (query) {
      fetchAnime(query);
    } else {
      fetchAnime();
    }
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/browse?q=${encodeURIComponent(searchTerm)}`);
      fetchAnime(searchTerm);
    } else {
      router.push('/browse');
      fetchAnime();
    }
  };

  return (
    <div className="min-h-screen bg-netflix-black">
      <Navbar />
      <div className="pt-24 px-4 md:px-12 pb-12">
        <h1 className="text-4xl font-bold mb-8">Browse</h1>

        {/* Search */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="relative max-w-2xl">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search for anime..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-12 py-3 text-white focus:outline-none focus:border-gray-500"
            />
          </form>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-20">
            <div className="text-white text-xl">Loading...</div>
          </div>
        ) : anime.length > 0 ? (
          <>
            <p className="text-gray-400 mb-6">
              Found {anime.length} {anime.length === 1 ? 'result' : 'results'}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {anime.map((item) => (
                <Link
                  key={item.id}
                  href={`/anime/${item.id}`}
                  className="group relative"
                >
                  <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-gray-800">
                    <img
                      src={item.image || 'https://picsum.photos/300/450?random=' + item.id}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (!target.src.includes('picsum')) {
                          target.src = 'https://picsum.photos/300/450?random=' + item.id;
                        }
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    {!isPremium && (
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition">
                        <div className="bg-netflix-red/90 text-white px-2 py-1 rounded text-xs font-semibold flex items-center space-x-1">
                          <FiLock size={12} />
                          <span>Premium</span>
                        </div>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <h3 className="font-semibold mb-2 line-clamp-2">{item.title}</h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-300">
                        {item.releaseDate && <span>{item.releaseDate}</span>}
                        {item.type && <span>• {item.type}</span>}
                      </div>
                      <div className="mt-2 flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            if (isPremium) {
                              router.push(`/anime/${item.id}`);
                            } else {
                              router.push('/subscription');
                            }
                          }}
                          className="flex items-center space-x-1 bg-white text-black px-3 py-1 rounded text-sm font-semibold hover:bg-opacity-80 transition"
                        >
                          <FiPlay size={14} />
                          <span>Play</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-400 text-xl">No results found</p>
            <p className="text-gray-500 mt-2">Try adjusting your search</p>
          </div>
        )}
      </div>
    </div>
  );
}
