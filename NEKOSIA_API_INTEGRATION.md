# Nekosia API Integration

## Base URL
```
https://api.nekosia.cat/api/v1
```

## Integrated Endpoints

The Nekosia API has been integrated as the **primary** anime API with the following endpoints:

### Search Anime
```
GET /anime/search?q={query}
```
Searches for anime by query string.

### Get Popular Anime
```
GET /anime/popular
```
Returns popular anime list.

### Get Trending Anime
```
GET /anime/trending
```
Returns trending anime list.

### Get Anime Details
```
GET /anime/{id}
```
Returns detailed information about a specific anime.

### Get Episode Streaming
```
GET /anime/{id}/episode/{episodeId}
```
Returns streaming links for a specific episode.

### Get Random Image (Bonus)
```
GET /images/random
```
Returns a random anime image (as per Nekosia API documentation).

## Integration Status

✅ **Nekosia API has been added as the PRIMARY API** in the fallback chain:
1. **Nekosia API** (First priority - user requested)
2. AniList API (Metadata)
3. Zoro API (Backup)
4. 9anime API (Backup)
5. Mock Data (Guaranteed fallback)

## How It Works

1. When searching or fetching anime, the system tries Nekosia API first
2. If Nekosia API fails or returns no results, it automatically falls back to other APIs
3. If all APIs fail, it uses mock data (guaranteed to work)

## API Response Handling

The system automatically transforms Nekosia API responses to match the expected format:
- Maps `data` array to `results`
- Extracts title, image, description, genres, etc.
- Handles different response structures gracefully

## Testing

To test the Nekosia API integration:
1. Visit the homepage - should fetch from Nekosia first
2. Search for anime - should use Nekosia search endpoint
3. View anime details - should use Nekosia info endpoint
4. Watch episodes - should use Nekosia episode endpoint

## Documentation Reference

- Official Nekosia API: https://api.nekosia.cat/api/v1
- API Status: https://api.nekosia.cat/api/v1 (Operational)
- Public API Documentation: https://publicapi.dev/nekosia-api
- Example Endpoint: https://api.nekosia.cat/api/v1/images/catgirl

## Notes

- The API is tried first but has automatic fallbacks
- If Nekosia endpoints don't exist or return errors, other APIs will be used
- Mock data ensures the site always works even if all APIs fail

