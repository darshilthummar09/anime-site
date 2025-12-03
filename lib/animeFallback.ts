import { animeData } from '@/data/animeData';

// Convert mock anime data to API response format
export function getFallbackAnimeData(query?: string) {
  let filteredData = animeData;

  // If there's a search query, filter the data
  if (query) {
    const searchLower = query.toLowerCase();
    filteredData = animeData.filter(
      (anime) =>
        anime.title.toLowerCase().includes(searchLower) ||
        anime.description.toLowerCase().includes(searchLower) ||
        anime.genre.some((g) => g.toLowerCase().includes(searchLower))
    );
  }

  // Convert to API response format
  return {
    results: filteredData.map((anime) => ({
      id: anime.id,
      title: anime.title,
      image: anime.thumbnail,
      description: anime.description,
      releaseDate: anime.year.toString(),
      type: anime.type.toUpperCase(),
      status: 'RELEASING',
      totalEpisodes: anime.episodes.length,
      genres: anime.genre,
      rating: anime.rating,
    })),
    currentPage: 1,
    hasNextPage: false,
    totalPages: 1,
  };
}

