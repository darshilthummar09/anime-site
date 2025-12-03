import { NextResponse } from 'next/server';
import { ANIME_APIS } from '@/lib/animeApis';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const page = parseInt(searchParams.get('page') || '1');
  const perPage = 50;

  try {
    // Use AniList API (GraphQL) - Real anime data with thumbnails
    let queryConfig: { url: string; method: string; body: string };
    
    if (query) {
      // Search anime
      queryConfig = ANIME_APIS.ANILIST.search(query, page, perPage);
    } else {
      // Get trending anime (default)
      queryConfig = ANIME_APIS.ANILIST.getTrending(page, perPage);
    }

    const response = await fetch(queryConfig.url, {
      method: queryConfig.method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: queryConfig.body,
      next: { revalidate: 3600 },
    });

    if (response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        
        // Transform AniList GraphQL response
        if (data.data && data.data.Page && data.data.Page.media) {
          const media = data.data.Page.media;
          if (Array.isArray(media) && media.length > 0) {
            const result = {
              results: media.map((item: any) => ({
                id: item.id.toString(),
                title: item.title.english || item.title.romaji || item.title.native,
                image: item.coverImage?.extraLarge || item.coverImage?.large || item.bannerImage || '',
                description: item.description ? item.description.replace(/<[^>]*>/g, '').substring(0, 200) : '',
                releaseDate: item.startDate?.year?.toString() || '',
                type: item.format || 'TV',
                status: item.status || 'RELEASING',
                totalEpisodes: item.episodes || 0,
                genres: item.genres || [],
                rating: item.averageScore ? (item.averageScore / 10).toFixed(1) : '0',
                popularity: item.popularity || 0,
                studios: item.studios?.nodes?.map((s: any) => s.name) || [],
              })),
            };
            return NextResponse.json(result);
          }
        }
      }
    }

    // If API fails, return empty results instead of fallback data
    return NextResponse.json({ results: [] });
  } catch (error: any) {
    // Return empty results on error
    return NextResponse.json({ results: [] });
  }
}

