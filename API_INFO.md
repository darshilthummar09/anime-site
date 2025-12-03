# Anime API Information

## Current Implementation

The site uses a **multi-API fallback system** that tries multiple anime APIs in order:

### 1. Zoro API (Primary)
- Base URL: `https://api.consumet.org/anime/zoro`
- Provides: Search, anime info, episode streaming
- Status: Generally reliable

### 2. 9anime API (Secondary)
- Base URL: `https://api.consumet.org/anime/9anime`
- Provides: Search, anime info, episode streaming
- Status: Alternative option

### 3. AniList API (Metadata)
- Base URL: `https://graphql.anilist.co`
- Provides: Anime metadata, descriptions, images
- Status: Very reliable (official API)

### 4. Mock Data (Fallback)
- Location: `data/animeData.ts`
- Provides: 8 sample anime with working video URLs
- Status: Always works, guaranteed fallback

## How It Works

1. **Search/List**: Tries Zoro → 9anime → AniList → Mock Data
2. **Anime Details**: Tries Zoro → 9anime → Mock Data
3. **Episode Streaming**: Tries Zoro → 9anime → Mock Data

## Video Sources

The video player supports:
- **Direct video files**: `.mp4`, `.webm`, `.ogg`, `.m3u8`
- **Iframe embeds**: YouTube, Vimeo, custom embeds
- **Streaming URLs**: HLS, DASH formats

## Mock Data Videos

The fallback mock data uses sample videos from Google's test video bucket:
- These are guaranteed to work
- Good for testing and demos
- Replace with actual anime videos in production

## Troubleshooting

### If APIs are down:
- The site automatically falls back to mock data
- All features still work
- You'll see 8 sample anime titles

### If videos don't play:
- Check browser console for CORS errors
- Some video sources may be blocked
- Try different anime/episodes
- Mock data videos should always work

### To use only mock data:
- Comment out API calls in route files
- Use only `getFallbackAnimeData()` function
- Site will work 100% with mock data

## Production Recommendations

1. **Use your own video hosting**:
   - Set up a CDN (Cloudflare, AWS CloudFront)
   - Host videos yourself for reliability
   - Use proper video encoding

2. **Implement caching**:
   - Cache API responses
   - Store video URLs in database
   - Reduce API dependency

3. **Add monitoring**:
   - Track API success rates
   - Alert when APIs fail
   - Log video playback errors

4. **Legal considerations**:
   - Ensure you have rights to stream content
   - Use licensed video sources
   - Comply with copyright laws

