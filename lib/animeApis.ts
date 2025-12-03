// AniList API (GraphQL) - Most reliable free anime API
// Documentation: https://anilist.gitbook.io/anilist-apiv2-docs/
// Provides real anime data with thumbnails, descriptions, episodes, etc.

export const ANIME_APIS = {
  ANILIST: {
    baseUrl: 'https://graphql.anilist.co',
    // GraphQL query for trending anime
    getTrending: (page: number = 1, perPage: number = 50) => ({
      url: 'https://graphql.anilist.co',
      method: 'POST',
      body: JSON.stringify({
        query: `
          query ($page: Int, $perPage: Int) {
            Page(page: $page, perPage: $perPage) {
              media(type: ANIME, sort: TRENDING_DESC, status: RELEASING) {
                id
                idMal
                title {
                  romaji
                  english
                  native
                }
                description
                coverImage {
                  large
                  extraLarge
                }
                bannerImage
                startDate {
                  year
                  month
                  day
                }
                endDate {
                  year
                }
                status
                format
                episodes
                genres
                averageScore
                popularity
                studios {
                  nodes {
                    name
                  }
                }
              }
            }
          }
        `,
        variables: { page, perPage },
      }),
    }),
    // GraphQL query for popular anime
    getPopular: (page: number = 1, perPage: number = 50) => ({
      url: 'https://graphql.anilist.co',
      method: 'POST',
      body: JSON.stringify({
        query: `
          query ($page: Int, $perPage: Int) {
            Page(page: $page, perPage: $perPage) {
              media(type: ANIME, sort: POPULARITY_DESC) {
                id
                idMal
                title {
                  romaji
                  english
                  native
                }
                description
                coverImage {
                  large
                  extraLarge
                }
                bannerImage
                startDate {
                  year
                  month
                  day
                }
                endDate {
                  year
                }
                status
                format
                episodes
                genres
                averageScore
                popularity
                studios {
                  nodes {
                    name
                  }
                }
              }
            }
          }
        `,
        variables: { page, perPage },
      }),
    }),
    // GraphQL query for search
    search: (query: string, page: number = 1, perPage: number = 50) => ({
      url: 'https://graphql.anilist.co',
      method: 'POST',
      body: JSON.stringify({
        query: `
          query ($search: String, $page: Int, $perPage: Int) {
            Page(page: $page, perPage: $perPage) {
              media(search: $search, type: ANIME, sort: POPULARITY_DESC) {
                id
                idMal
                title {
                  romaji
                  english
                  native
                }
                description
                coverImage {
                  large
                  extraLarge
                }
                bannerImage
                startDate {
                  year
                  month
                  day
                }
                endDate {
                  year
                }
                status
                format
                episodes
                genres
                averageScore
                popularity
                studios {
                  nodes {
                    name
                  }
                }
              }
            }
          }
        `,
        variables: { search: query, page, perPage },
      }),
    }),
    // GraphQL query for anime by ID
    getById: (id: string) => ({
      url: 'https://graphql.anilist.co',
      method: 'POST',
      body: JSON.stringify({
        query: `
          query ($id: Int) {
            Media(id: $id, type: ANIME) {
              id
              idMal
              title {
                romaji
                english
                native
              }
              description
              coverImage {
                large
                extraLarge
              }
              bannerImage
              startDate {
                year
                month
                day
              }
              endDate {
                year
              }
              status
              format
              episodes
              genres
              averageScore
              popularity
              studios {
                nodes {
                  name
                }
              }
              relations {
                edges {
                  node {
                    id
                    title {
                      romaji
                      english
                    }
                    coverImage {
                      large
                    }
                  }
                }
              }
            }
          }
        `,
        variables: { id: parseInt(id) },
      }),
    }),
  },
  // Consumet API - Most reliable anime streaming API for production
  // Documentation: https://consumet.org/
  // Multiple providers for maximum reliability
  CONSUMET: {
    baseUrl: 'https://api.consumet.org/anime',
    // Available providers: gogoanime, zoro, 9anime, animepahe, etc.
    providers: ['gogoanime', 'zoro', '9anime', 'animepahe'],
    // Search anime
    search: (query: string, provider: string = 'gogoanime') => 
      `https://api.consumet.org/anime/${provider}/${encodeURIComponent(query)}`,
    // Get anime info with episodes
    getInfo: (animeId: string, provider: string = 'gogoanime') => 
      `https://api.consumet.org/anime/${provider}/info/${animeId}`,
    // Get episode streaming URL
    getEpisode: (episodeId: string, provider: string = 'gogoanime') => 
      `https://api.consumet.org/anime/${provider}/watch/${episodeId}`,
  },
  // Cinetaro API - Alternative streaming API
  // Uses AniList ID for direct streaming
  CINETARO: {
    baseUrl: 'https://api.cinetaro.buzz',
    // Get episode streaming URL
    // Format: /anime/[AniListID]/[Season]/[Episode]/[Type]
    // Type: sub (subtitle), dub (dubbed), hindi
    getEpisode: (anilistId: string, season: number = 1, episode: number, type: string = 'sub') => 
      `https://api.cinetaro.buzz/anime/${anilistId}/${season}/${episode}/${type}`,
  },
  // Let's Embed - Alternative streaming API
  LETSEMBED: {
    baseUrl: 'https://letsembed.cc',
    // Get episode embed URL (requires TMDB ID)
    getEpisode: (tmdbId: string, season: number = 1, episode: number) => 
      `https://letsembed.cc/embed/anime/?id=${tmdbId}/${season}/${episode}`,
  },
  // VidStreaming - Direct embed service
  VIDSTREAMING: {
    baseUrl: 'https://vidstreaming.io',
    // Direct embed - uses anime slug and episode
    getEmbed: (slug: string, episode: number) => 
      `https://vidstreaming.io/streaming.php?id=${slug}&episode=${episode}`,
  },
  // Nekosia API - https://nekosia.cat/documentation
  // Base URL: https://api.nekosia.cat/api/v1
  NEKOSIA: {
    baseUrl: 'https://api.nekosia.cat/api/v1',
    // Get random image by category
    // Categories: catgirl, foxgirl, neko, etc.
    getRandomImage: (category: string = 'catgirl') => 
      `https://api.nekosia.cat/api/v1/images/${category}`,
    // Get image by ID
    getImageById: (id: string) => 
      `https://api.nekosia.cat/api/v1/images/${id}`,
    // Search images by tags
    searchImages: (tags: string[]) => 
      `https://api.nekosia.cat/api/v1/images?tags=${tags.join(',')}`,
  },
};


