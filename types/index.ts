export interface Anime {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  banner: string;
  genre: string[];
  year: number;
  rating: number;
  episodes: Episode[];
  type: 'series' | 'movie';
}

export interface Episode {
  id: string;
  title: string;
  episodeNumber: number;
  duration: number;
  videoUrl: string;
  thumbnail: string;
  description: string;
}

export interface EpisodeData {
  // your existing fields...
  error?: string;
}


export interface User {
  id: string;
  name: string;
  avatar: string;
}

export interface WatchHistory {
  animeId: string;
  episodeId: string;
  progress: number; // in seconds
  lastWatched: Date;
}



