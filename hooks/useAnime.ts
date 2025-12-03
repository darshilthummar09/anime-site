import { useState, useEffect } from 'react';

interface Anime {
  id: string;
  title: string;
  image: string;
  description?: string;
  releaseDate?: string;
  status?: string;
  type?: string;
  totalEpisodes?: number;
  genres?: string[];
}

interface UseAnimeResult {
  anime: Anime[];
  loading: boolean;
  error: string | null;
  fetchAnime: (query?: string) => Promise<void>;
}

export function useAnime(): UseAnimeResult {
  const [anime, setAnime] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnime = async (query?: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = query
        ? `/api/anime?q=${encodeURIComponent(query)}`
        : '/api/anime';
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      // Handle different response structures
      if (data.results && Array.isArray(data.results)) {
        setAnime(data.results);
      } else if (Array.isArray(data)) {
        setAnime(data);
      } else {
        setAnime([]);
        if (data.error) {
          setError(data.error);
        }
      }
    } catch (err: any) {
      console.error('Error fetching anime:', err);
      setError(err.message || 'Failed to fetch anime');
      setAnime([]);
    } finally {
      setLoading(false);
    }
  };

  return { anime, loading, error, fetchAnime };
}

