// app/watch/[animeId]/[episodeId]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import VideoPlayer from '@/components/VideoPlayer';
import { animeData } from '@/data/animeData';

// ──────────────────────────────────────────────────────────────
// Define the type at the very top (outside the component)
// This guarantees TypeScript sees it correctly during build
// ──────────────────────────────────────────────────────────────
interface EpisodeData {
  sources?: Array<{
    url: string;
    quality: string;
    isM3U8?: boolean;
  }>;
  iframe?: string;
  episodeTitle?: string;
  error?: string;        // This line was being ignored before
  [key: string]: any;    // Extra safety net for unknown fields
}

export default function WatchPage() {
  const params = useParams();
  const router = useRouter();
  const [iframeUrl, setIframeUrl] = useState('');
  const [animeTitle, setAnimeTitle] = useState('');
  const [episodeTitle, setEpisodeTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEpisodeData = async () => {
      const animeId = params.animeId as string;
      const episodeId = params.episodeId as string;

      if (!animeId || !episodeId) {
        setError('Invalid URL');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // 1. Mock data first (fast)
        const mockAnime = animeData.find(a => a.id === animeId);
        if (mockAnime) {
          const ep = mockAnime.episodes.find(e => e.id === episodeId);
          if (ep) {
            setAnimeTitle(mockAnime.title);
            setEpisodeTitle(ep.title);
            setIframeUrl(ep.videoUrl);
            setLoading(false);
            return;
          }
        }

        // 2. Real API
        const [animeRes, episodeRes] = await Promise.all([
          fetch(`/api/anime/${animeId}`),
          fetch(`/api/anime/${animeId}/episode/${episodeId}`)
        ]);

        if (animeRes.ok) {
          const data = await animeRes.json();
          setAnimeTitle(data.title || 'Unknown Anime');
        }

        if (!episodeRes.ok) throw new Error('Episode not found');

        // Critical fix: force the type + allow unknown properties
        const episodeData = (await episodeRes.json()) as EpisodeData & { error?: string };

        // Check for error property
        if (episodeData.error) {
          throw new Error(episodeData.error);
        }

        // ────── Domain blocking & source selection ──────
        const blocked = (url: string) =>
          /familynonstop/i.test(url);

        const isDirect = (url: string) =>
          /\.(mp4|webm|ogg|m3u8|mkv|avi|flv|mov|wmv)(\?|$)/i.test(url) ||
          /video|stream|cdn/i.test(url);

        let finalUrl = '';

        if (episodeData.sources?.length) {
          const valid = episodeData.sources.filter(s => s.url && !blocked(s.url));
          if (valid.length) {
            const direct = valid.find(s => isDirect(s.url));
            finalUrl = (direct ?? valid.find(s => !s.isM3U8) ?? valid[0]).url;
          }
        }

        if (!finalUrl && episodeData.iframe && !blocked(episodeData.iframe)) {
          finalUrl = episodeData.iframe;
        }

        if (!finalUrl) {
          throw new Error('This episode cannot be embedded (blocked by provider)');
        }

        setIframeUrl(finalUrl);
        if (episodeData.episodeTitle) setEpisodeTitle(episodeData.episodeTitle);

      } catch (err: any) {
        setError(err.message || 'Failed to load episode');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEpisodeData();
  }, [params]);

  // ────── Render ──────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-white text-xl">Loading episode...</div>
      </div>
    );
  }

  if (error || !iframeUrl) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Error Loading Episode</h2>
          <p className="text-gray-400 mb-6">{error || 'No video source available'}</p>
          <button
            onClick={() => router.back()}
            className="bg-red-600 px-6 py-3 rounded hover:bg-red-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen">
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
