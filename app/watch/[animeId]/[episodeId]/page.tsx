'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import VideoPlayer from '@/components/VideoPlayer';
import { animeData } from '@/data/animeData';

// Define the interface globally in this file (ensures it's in scope)
interface EpisodeData {
  sources?: Array<{
    url: string;
    quality: string;
    isM3U8?: boolean;
  }>;
  iframe?: string;
  episodeTitle?: string;
  error?: string; // This must be recognized!
}

export default function WatchPage() {
  const params = useParams();
  const router = useRouter();
  const [iframeUrl, setIframeUrl] = useState<string>('');
  const [animeTitle, setAnimeTitle] = useState<string>('');
  const [episodeTitle, setEpisodeTitle] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEpisodeData = async () => {
      const animeId = params.animeId as string;
      const episodeId = params.episodeId as string;

      if (!animeId || !episodeId) {
        setError('Invalid anime or episode ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Check mock data first
        const mockAnime = animeData.find((a) => a.id === animeId);
        if (mockAnime) {
          const mockEpisode = mockAnime.episodes.find((e) => e.id === episodeId);
          if (mockEpisode) {
            setAnimeTitle(mockAnime.title);
            setEpisodeTitle(mockEpisode.title);
            setIframeUrl(mockEpisode.videoUrl);
            setLoading(false);
            return;
          }
        }

        // Fetch from API
        const animeResponse = await fetch(`/api/anime/${animeId}`);
        if (animeResponse.ok) {
          const animeDataResponse = await animeResponse.json();
          setAnimeTitle(animeDataResponse.title || 'Anime');
        }

        const episodeResponse = await fetch(`/api/anime/${animeId}/episode/${episodeId}`);
        if (!episodeResponse.ok) {
          throw new Error('Episode not found');
        }

        // Fix: Explicitly type with possible error field
        const episodeData = await episodeResponse.json() as EpisodeData;

        // Now TypeScript knows .error can exist
        if (episodeData.error) {
          throw new Error(episodeData.error);
        }

        const isBlockedDomain = (url: string): boolean => {
          if (!url) return true;
          const blockedDomains = ['familynonstop.com', 'familynonstop'];
          const urlLower = url.toLowerCase();
          return blockedDomains.some(domain => urlLower.includes(domain));
        };

        const isDirectVideo = (url: string): boolean => {
          if (!url) return false;
          return /\.(mp4|webm|ogg|m3u8|mkv|avi|flv|mov|wmv)(\?|$)/i.test(url) ||
                 url.includes('video') ||
                 url.includes('stream') ||
                 url.includes('cdn');
        };

        let validUrl = '';

        if (episodeData.sources && episodeData.sources.length > 0) {
          const validSources = episodeData.sources.filter(s => s.url && !isBlockedDomain(s.url));
          
          if (validSources.length > 0) {
            const directVideo = validSources.find(s => isDirectVideo(s.url));
            if (directVideo?.url) {
              validUrl = directVideo.url;
            } else {
              const best = validSources.find(s => !s.isM3U8) || validSources[0];
              validUrl = best.url;
            }
          }
        }

        if (!validUrl && episodeData.iframe && !isBlockedDomain(episodeData.iframe)) {
          validUrl = episodeData.iframe;
        }

        if (validUrl) {
          setIframeUrl(validUrl);
        } else {
          setError('Video source is not available. The streaming provider blocks embedding. Please try a different episode.');
          setLoading(false);
          return;
        }

        if (episodeData.episodeTitle) {
          setEpisodeTitle(episodeData.episodeTitle);
        }

        if (!episodeData.iframe && (!episodeData.sources || episodeData.sources.length === 0)) {
          setError('Episode found but video streaming is not available yet.');
          setLoading(false);
          return;
        }

      } catch (err: any) {
        setError(err.message || 'Failed to load episode');
        console.error('Error fetching episode:', err);
      } finally {
        setLoading(false);
      }
    };

    if (params.animeId && params.episodeId) {
      fetchEpisodeData();
    }
  }, [params]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-netflix-black">
        <div className="text-white text-xl">Loading episode...</div>
      </div>
    );
  }

  if (error || !iframeUrl) {
    return (
      <div className="flex items-center justify-center h-screen bg-netflix-black">
        <div className="text-center px-4">
          <h2 className="text-2xl font-bold mb-4 text-white">Error Loading Episode</h2>
          <p className="text-gray-400 mb-6">{error || 'Episode not available'}</p>
          <button
            onClick={() => router.back()}
            className="bg-netflix-red text-white px-6 py-3 rounded font-semibold hover:bg-opacity-80 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-netflix-black">
      <VideoPlayer
        iframeUrl={iframeUrl}
        animeTitle={animeTitle}
        episodeTitle={episodeTitle}
        animeId={params.animeId as string}
        episodeId={params.episodeId as string}
      />
    </div>
  );
}
