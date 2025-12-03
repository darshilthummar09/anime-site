'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { FiSearch, FiBell, FiChevronDown, FiStar, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { usePremium } from '@/contexts/PremiumContext';
import { useAuth } from '@/contexts/AuthContext';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { isPremium } = usePremium();
  const { user, userData, signOut, loading: authLoading } = useAuth();

  // Sync search query with URL params
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const query = params.get('q') || '';
      if (query !== searchQuery) {
        setSearchQuery(query);
      }
    }
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showSearch && !(e.target as HTMLElement).closest('.search-container')) {
        setShowSearch(false);
        setSearchSuggestions([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSearch]);

  // Real-time search suggestions
  useEffect(() => {
    const trimmedQuery = searchQuery.trim();
    
    if (trimmedQuery.length > 0) {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      // Only search if query is at least 2 characters
      if (trimmedQuery.length >= 2) {
        searchTimeoutRef.current = setTimeout(async () => {
          setIsSearching(true);
          try {
            const response = await fetch(`/api/anime?q=${encodeURIComponent(trimmedQuery)}`);
            if (response.ok) {
              const data = await response.json();
              const results = data.results || [];
              setSearchSuggestions(results.slice(0, 5)); // Show top 5 suggestions
            } else {
              setSearchSuggestions([]);
            }
          } catch (error) {
            console.error('Search error:', error);
            setSearchSuggestions([]);
          } finally {
            setIsSearching(false);
          }
        }, 300); // Debounce 300ms
      } else {
        setSearchSuggestions([]);
        setIsSearching(false);
      }
    } else {
      setSearchSuggestions([]);
      setIsSearching(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/browse?q=${encodeURIComponent(searchQuery)}`);
      setShowSearch(false);
      setSearchSuggestions([]);
    }
  };

  const handleSearchClick = () => {
    setShowSearch(true);
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  };

  const handleSuggestionClick = (animeId: string) => {
    router.push(`/anime/${animeId}`);
    setShowSearch(false);
    setSearchQuery('');
    setSearchSuggestions([]);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchSuggestions([]);
    searchInputRef.current?.focus();
  };

  // Keyboard navigation for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showSearch || searchSuggestions.length === 0) return;
      
      // Allow typing in search input
      if (e.target === searchInputRef.current) {
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showSearch, searchSuggestions]);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-netflix-black' : 'bg-transparent'
      }`}
    >
      <div className="flex items-center justify-between px-4 md:px-12 py-4">
        <div className="flex items-center space-x-8">
          <Link href="/" className="text-2xl font-bold text-netflix-red">
            AnimeFlix
          </Link>
          <div className="hidden md:flex space-x-6">
            <Link href="/" className="hover:text-gray-300 transition">
              Home
            </Link>
            <Link href="/browse" className="hover:text-gray-300 transition">
              Browse
            </Link>
            <Link href="/my-list" className="hover:text-gray-300 transition">
              My List
            </Link>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Desktop Search */}
          <div className="hidden md:block search-container relative">
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search anime..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSearch(true)}
                  className="bg-black/50 border border-gray-700 rounded px-10 py-2 w-64 text-white placeholder-gray-400 focus:outline-none focus:border-gray-500 transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition"
                  >
                    <FiX size={18} />
                  </button>
                )}
              </div>
            </form>

            {/* Search Suggestions Dropdown */}
            <AnimatePresence>
              {showSearch && searchQuery.trim().length > 0 && (searchSuggestions.length > 0 || isSearching) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 mt-2 w-96 bg-netflix-dark rounded-lg shadow-2xl border border-gray-700 max-h-96 overflow-y-auto z-50"
                >
                  {isSearching ? (
                    <div className="p-4 text-center text-gray-400">
                      <div className="inline-block w-5 h-5 border-2 border-netflix-red border-t-transparent rounded-full animate-spin" />
                      <span className="ml-2">Searching...</span>
                    </div>
                  ) : searchSuggestions.length > 0 ? (
                    <>
                      <div className="p-2 border-b border-gray-700">
                        <div className="text-xs text-gray-400 px-2">Suggestions</div>
                      </div>
                      {searchSuggestions.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleSuggestionClick(item.id)}
                          className="w-full flex items-center space-x-3 p-3 hover:bg-gray-800 transition text-left"
                        >
                          <div className="w-16 h-24 flex-shrink-0 rounded overflow-hidden bg-gray-800">
                            <img
                              src={item.image || 'https://picsum.photos/300/450?random=' + item.id}
                              alt={item.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'https://picsum.photos/300/450?random=' + item.id;
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-white font-semibold truncate">{item.title}</h3>
                            {item.description && (
                              <p className="text-gray-400 text-sm line-clamp-2 mt-1">
                                {item.description.replace(/<[^>]*>/g, '').substring(0, 60)}...
                              </p>
                            )}
                            <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                              {item.releaseDate && <span>{item.releaseDate}</span>}
                              {item.type && <span>• {item.type}</span>}
                            </div>
                          </div>
                        </button>
                      ))}
                      <div className="p-2 border-t border-gray-700">
                        <button
                          onClick={handleSearch}
                          className="w-full text-left px-3 py-2 text-sm text-netflix-red hover:bg-gray-800 rounded transition"
                        >
                          View all results for "{searchQuery}"
                        </button>
                      </div>
                    </>
                  ) : null}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Search Button */}
          <button
            onClick={handleSearchClick}
            className="md:hidden text-white hover:text-gray-300 transition"
          >
            <FiSearch size={24} />
          </button>

          {/* Mobile Search Modal */}
          <AnimatePresence>
            {showSearch && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="md:hidden fixed inset-0 bg-black z-50"
              >
                <div className="p-4 border-b border-gray-700">
                  <form onSubmit={handleSearch} className="relative">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search anime..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-10 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-gray-500"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={clearSearch}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition"
                      >
                        <FiX size={20} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setShowSearch(false);
                        setSearchSuggestions([]);
                      }}
                      className="absolute right-12 top-1/2 transform -translate-y-1/2 text-white"
                    >
                      Cancel
                    </button>
                  </form>
                </div>
                <div className="overflow-y-auto max-h-[calc(100vh-80px)]">
                  {isSearching ? (
                    <div className="p-8 text-center text-gray-400">
                      <div className="inline-block w-6 h-6 border-2 border-netflix-red border-t-transparent rounded-full animate-spin" />
                      <p className="mt-2">Searching...</p>
                    </div>
                  ) : searchSuggestions.length > 0 ? (
                    <div className="p-4 space-y-3">
                      {searchSuggestions.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleSuggestionClick(item.id)}
                          className="w-full flex items-center space-x-3 p-3 hover:bg-gray-800 rounded-lg transition text-left"
                        >
                          <div className="w-20 h-28 flex-shrink-0 rounded overflow-hidden bg-gray-800">
                            <img
                              src={item.image || 'https://picsum.photos/300/450?random=' + item.id}
                              alt={item.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'https://picsum.photos/300/450?random=' + item.id;
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-white font-semibold truncate">{item.title}</h3>
                            {item.description && (
                              <p className="text-gray-400 text-sm line-clamp-2 mt-1">
                                {item.description.replace(/<[^>]*>/g, '').substring(0, 80)}...
                              </p>
                            )}
                          </div>
                        </button>
                      ))}
                      <button
                        onClick={handleSearch}
                        className="w-full bg-netflix-red text-white py-3 rounded-lg font-semibold hover:bg-opacity-80 transition"
                      >
                        View all results
                      </button>
                    </div>
                  ) : searchQuery.trim().length >= 2 ? (
                    <div className="p-8 text-center text-gray-400">
                      <p>No results found</p>
                      <button
                        onClick={handleSearch}
                        className="mt-4 text-netflix-red hover:underline"
                      >
                        Search anyway
                      </button>
                    </div>
                  ) : searchQuery.trim().length > 0 ? (
                    <div className="p-8 text-center text-gray-400">
                      <p>Type at least 2 characters to search</p>
                    </div>
                  ) : null}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {!isPremium && (
            <Link
              href="/subscription"
              className="hidden md:flex items-center space-x-1 bg-netflix-red text-white px-4 py-2 rounded font-semibold hover:bg-opacity-80 transition"
            >
              <FiStar size={16} />
              <span>Premium</span>
            </Link>
          )}
          {isPremium && (
            <div className="hidden md:flex items-center space-x-1 text-yellow-400">
              <FiStar size={16} />
              <span className="text-sm font-semibold">Premium</span>
            </div>
          )}
          <button className="text-white hover:text-gray-300 transition">
            <FiBell size={24} />
          </button>
          {!authLoading && (
            <>
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center space-x-2 hover:opacity-80 transition"
                  >
                    <div className="w-8 h-8 bg-netflix-red rounded flex items-center justify-center">
                      <span className="text-sm font-semibold">
                        {userData?.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <FiChevronDown className="hidden md:block" />
                  </button>
                  <AnimatePresence>
                    {showProfileMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-48 bg-netflix-dark rounded shadow-lg border border-gray-700 z-50"
                      >
                        <div className="px-4 py-3 border-b border-gray-700">
                          <p className="text-white font-semibold truncate">
                            {userData?.displayName || 'User'}
                          </p>
                          <p className="text-gray-400 text-sm truncate">
                            {user.email}
                          </p>
                        </div>
                        <Link
                          href="/profile"
                          className="block px-4 py-3 hover:bg-gray-800 transition"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          Profile
                        </Link>
                        <Link
                          href="/account"
                          className="block px-4 py-3 hover:bg-gray-800 transition"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          Account
                        </Link>
                        {!isPremium && (
                          <Link
                            href="/subscription"
                            className="block px-4 py-3 hover:bg-gray-800 transition text-netflix-red"
                            onClick={() => setShowProfileMenu(false)}
                          >
                            Upgrade to Premium
                          </Link>
                        )}
                        <button
                          className="block w-full text-left px-4 py-3 hover:bg-gray-800 transition"
                          onClick={async () => {
                            setShowProfileMenu(false);
                            try {
                              await signOut();
                            } catch (error) {
                              console.error('Error signing out:', error);
                            }
                          }}
                        >
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="bg-netflix-red text-white px-4 py-2 rounded font-semibold hover:bg-opacity-80 transition"
                >
                  Sign In
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

