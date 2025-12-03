import { NextResponse } from 'next/server';
import { ANIME_APIS } from '@/lib/animeApis';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const animeId = params.id;
    
    // Use AniList API (GraphQL) - Real anime data
    const queryConfig = ANIME_APIS.ANILIST.getById(animeId);
    
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
        if (data.data && data.data.Media) {
          const item = data.data.Media;
          const result = {
            id: item.id.toString(),
            title: item.title.english || item.title.romaji || item.title.native,
            image: item.coverImage?.extraLarge || item.coverImage?.large || item.bannerImage || '',
            description: item.description ? item.description.replace(/<[^>]*>/g, '') : '',
            releaseDate: item.startDate?.year?.toString() || '',
            status: item.status || 'RELEASING',
            type: item.format || 'TV',
            totalEpisodes: item.episodes || 0,
            genres: item.genres || [],
            rating: item.averageScore ? (item.averageScore / 10).toFixed(1) : '0',
            popularity: item.popularity || 0,
            studios: item.studios?.nodes?.map((s: any) => s.name) || [],
            // Generate episodes array based on total episodes
            episodes: item.episodes ? Array.from({ length: item.episodes }, (_, i) => ({
              id: `${item.id}-${i + 1}`,
              number: i + 1,
              title: `Episode ${i + 1}`,
              image: item.coverImage?.large || '',
              description: '',
            })) : [],
          };
          return NextResponse.json(result);
        }
      }
    }

    // If not found, return error
    return NextResponse.json(
      { error: 'Anime not found' },
      { status: 404 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Anime not found' },
      { status: 404 }
    );
  }
}

