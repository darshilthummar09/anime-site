// Nekosia API Integration Example
// Documentation: https://nekosia.cat/documentation?page=getting-started
// Base URL: https://api.nekosia.cat/api/v1

import { ANIME_APIS } from './animeApis';

/**
 * Example: Fetch a random anime image from Nekosia API
 * @param category - Image category (catgirl, foxgirl, neko, etc.)
 * @returns Promise with image data
 */
export async function fetchNekosiaImage(category: string = 'catgirl') {
  try {
    const url = ANIME_APIS.NEKOSIA.getRandomImage(category);
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 3600 },
    });

    if (response.ok) {
      const data = await response.json();
      
      // Response structure:
      // {
      //   "success": true,
      //   "status": 200,
      //   "count": 832,
      //   "id": "66a77347a4b979c761eb0cde",
      //   "colors": { "main": "#E7C9CF", "palette": [...] },
      //   "image": {
      //     "original": { "url": "...", "extension": "png" },
      //     "compressed": { "url": "...", "extension": "jpeg" }
      //   },
      //   "metadata": { ... },
      //   "category": "catgirl",
      //   "tags": [...],
      //   "rating": "safe",
      //   "anime": { "title": null, "character": null },
      //   "source": { "url": "...", "direct": "..." },
      //   "attribution": { ... }
      // }
      
      return {
        success: data.success,
        imageUrl: data.image?.original?.url || data.image?.compressed?.url,
        compressedUrl: data.image?.compressed?.url,
        id: data.id,
        category: data.category,
        tags: data.tags || [],
        colors: data.colors,
        metadata: data.metadata,
        source: data.source,
        attribution: data.attribution,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Nekosia API error:', error);
    return null;
  }
}

/**
 * Example: Get image by ID
 * @param id - Image ID from Nekosia API
 * @returns Promise with image data
 */
export async function getNekosiaImageById(id: string) {
  try {
    const url = ANIME_APIS.NEKOSIA.getImageById(id);
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 3600 },
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    }
    
    return null;
  } catch (error) {
    console.error('Nekosia API error:', error);
    return null;
  }
}

/**
 * Example: Search images by tags
 * @param tags - Array of tags to search for
 * @returns Promise with search results
 */
export async function searchNekosiaImages(tags: string[]) {
  try {
    const url = ANIME_APIS.NEKOSIA.searchImages(tags);
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 3600 },
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    }
    
    return null;
  } catch (error) {
    console.error('Nekosia API error:', error);
    return null;
  }
}

// Example usage in a React component:
/*
import { fetchNekosiaImage } from '@/lib/nekosiaApiExample';

const MyComponent = () => {
  const [imageUrl, setImageUrl] = useState('');
  
  useEffect(() => {
    const loadImage = async () => {
      const result = await fetchNekosiaImage('catgirl');
      if (result && result.imageUrl) {
        setImageUrl(result.imageUrl);
      }
    };
    loadImage();
  }, []);
  
  return imageUrl ? <img src={imageUrl} alt="Anime" /> : <div>Loading...</div>;
};
*/

