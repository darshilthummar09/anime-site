# Nekos API Integration

## Base URL
```
https://api.nekosapi.com/v4
```

## Overview

The Nekos API (https://nekosapi.com) has been integrated as the **PRIMARY** anime API for your site. This is an open-source anime images API with over 40,000 images and 50+ tags.

## Integrated Endpoints

### Search Anime
```
GET /images?tags={query}&limit=20
```
Searches for anime images by tags/query.

### Get Popular Anime
```
GET /images?limit=20&order_by=popularity
```
Returns popular anime images.

### Get Trending Anime
```
GET /images?limit=20&order_by=created_at
```
Returns trending anime images.

### Get Anime Details
```
GET /images/{id}
```
Returns detailed information about a specific anime image.

### Get Random Image
```
GET /images/random
```
Returns a random anime image.

## Important Notes

⚠️ **Nekos API is primarily for anime images and GIFs, not video streaming.**

- The API provides high-quality anime images and GIFs
- For video streaming, the system automatically falls back to other APIs (Zoro, 9anime, etc.)
- The API is free forever with no rate limits (but donations are appreciated)
- Average response time: ~300ms

## Integration Status

✅ **Nekos API has been added as the PRIMARY API** in the fallback chain:
1. **Nekos API** (First priority - user requested) - https://nekosapi.com
2. Nekosia API
3. AniList API (Metadata)
4. Zoro API (Video streaming backup)
5. 9anime API (Video streaming backup)
6. Mock Data (Guaranteed fallback)

## Response Format

The Nekos API returns data in this format:
```json
{
  "items": [
    {
      "id": "string",
      "attributes": {
        "title": "string",
        "description": "string",
        "file": {
          "url": "string",
          "original": {
            "url": "string"
          }
        },
        "tags": ["string"],
        "created_at": "string"
      }
    }
  ]
}
```

Our system automatically transforms this to match the expected anime format.

## How It Works

1. When searching or fetching anime, the system tries Nekos API first
2. If Nekos API fails or returns no results, it automatically falls back to other APIs
3. For video streaming, other APIs (Zoro, 9anime) are used as Nekos API doesn't provide videos
4. If all APIs fail, it uses mock data (guaranteed to work)

## Testing

To test the Nekos API integration:
1. Visit the homepage - should fetch from Nekos first
2. Search for anime - should use Nekos search endpoint
3. View anime details - should use Nekos info endpoint
4. Watch episodes - will use other APIs (Zoro/9anime) for video streaming

## Documentation Reference

- Official Nekos API: https://nekosapi.com
- API Documentation: https://nekosapi.com/docs
- API Introduction: https://nekosapi.com/docs/api-introduction
- GitHub: https://github.com/Nekidev/nekos-api
- Discord: Join their Discord server for support

## Features

- ✅ Forever Free
- ✅ 40,000+ Images
- ✅ 50+ Tags
- ✅ ~300ms Response Time
- ✅ Open Source
- ✅ Advanced Tagging System
- ✅ High Performance

## Terms of Use

- Free for commercial and non-commercial use
- Credit the API (mention name and logo)
- Don't store content for more than 1 hour
- Images are copyrighted by their respective owners

