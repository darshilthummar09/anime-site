import { NextResponse } from 'next/server';
import { animeData } from '@/data/animeData';
import { ANIME_APIS } from '@/lib/animeApis';

export async function GET(
  request: Request,
  { params }: { params: { id: string; episodeId: string } }
) {
  try {
    const { id: animeId, episodeId } = params;
    
    // First check mock data (for demo anime)
    const mockAnime = animeData.find((a) => a.id === animeId);
    if (mockAnime) {
      const mockEpisode = mockAnime.episodes.find((e) => e.id === episodeId);
      if (mockEpisode) {
        return NextResponse.json({
          id: mockEpisode.id,
          title: mockEpisode.title,
          episodeTitle: mockEpisode.title,
          iframe: mockEpisode.videoUrl,
          sources: [
            {
              url: mockEpisode.videoUrl,
              quality: 'default',
              isM3U8: false,
            },
          ],
        });
      }
    }

    // For AniList anime, episodeId format is: {animeId}-{episodeNumber}
    // Extract episode number from episodeId
    const episodeMatch = episodeId.match(/^(\d+)-(\d+)$/);
    if (episodeMatch) {
      const [, animeIdFromEpisode, episodeNumber] = episodeMatch;
      
      // Verify anime ID matches
      if (animeIdFromEpisode === animeId) {
        // Get anime info to verify it exists
        try {
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
            const data = await response.json();
            if (data.data && data.data.Media) {
              const anime = data.data.Media;
              const totalEpisodes = anime.episodes || 0;
              const epNumber = parseInt(episodeNumber);
              
              // Verify episode number is valid
              if (epNumber > 0 && epNumber <= totalEpisodes) {
                // Helper functions for URL filtering (available throughout this block)
                const isDirectVideoUrl = (url: string): boolean => {
                  if (!url) return false;
                  return /\.(mp4|webm|ogg|m3u8|mkv|avi|flv|mov|wmv)(\?|$)/i.test(url) ||
                         url.includes('video') ||
                         url.includes('stream') ||
                         url.includes('cdn');
                };
                
                const blocksIframe = (url: string): boolean => {
                  if (!url) return true;
                  const blockedDomains = [
                    'familynonstop.com',
                    'familynonstop',
                    'www.familynonstop.com',
                    'http://familynonstop',
                    'https://familynonstop',
                    'example.com',
                    'localhost',
                  ];
                  const urlLower = url.toLowerCase();
                  // More aggressive matching - check if domain appears anywhere in URL
                  return blockedDomains.some(domain => {
                    const domainLower = domain.toLowerCase();
                    return urlLower.includes(domainLower);
                  });
                };
                
                const filterBlockedUrls = (url: string | undefined | null): boolean => {
                  if (!url || typeof url !== 'string') return false;
                  if (blocksIframe(url)) return false;
                  if (!url.startsWith('http://') && !url.startsWith('https://')) return false;
                  return true;
                };
                
                // Try multiple title variations for better matching
                const titleVariations = [
                  anime.title.english,
                  anime.title.romaji,
                  anime.title.native,
                  // Remove common suffixes that might not be in Consumet
                  anime.title.english?.replace(/\s*(Season|S\d+|Part|Movie|OVA|ONA).*$/i, '').trim(),
                  anime.title.romaji?.replace(/\s*(Season|S\d+|Part|Movie|OVA|ONA).*$/i, '').trim(),
                ].filter(Boolean) as string[];
                
                // Try Consumet API with multiple providers for maximum reliability
                // This ensures production-ready streaming
                const providers = ANIME_APIS.CONSUMET.providers || ['gogoanime', 'zoro', '9anime'];
                
                for (const provider of providers) {
                  try {
                    // Try each title variation
                    for (const animeTitle of titleVariations) {
                      if (!animeTitle) continue;
                      
                      try {
                        // Step 1: Search for anime on Consumet
                        const searchUrl = ANIME_APIS.CONSUMET.search(animeTitle, provider);
                        const searchResponse = await fetch(searchUrl, {
                          headers: { 'Accept': 'application/json' },
                          next: { revalidate: 3600 },
                        });

                        if (searchResponse.ok) {
                          const searchData = await searchResponse.json();
                          
                          // Find matching anime (check first few results)
                          if (searchData.results && searchData.results.length > 0) {
                            // Try first result, then check others if needed
                            for (const result of searchData.results.slice(0, 5)) {
                              try {
                                // Step 2: Get anime info with episodes
                                const infoUrl = ANIME_APIS.CONSUMET.getInfo(result.id, provider);
                                const infoResponse = await fetch(infoUrl, {
                                  headers: { 'Accept': 'application/json' },
                                  next: { revalidate: 1800 },
                                });

                                if (infoResponse.ok) {
                                  const infoData = await infoResponse.json();
                                  
                                  // Step 3: Find the episode
                                  if (infoData.episodes && Array.isArray(infoData.episodes)) {
                                    // Try multiple ways to find the episode
                                    let episode = infoData.episodes.find((ep: any) => {
                                      const epNum = ep.number || ep.episodeNumber || ep.episode || 0;
                                      return epNum === epNumber || 
                                             parseInt(epNum) === epNumber ||
                                             String(epNum) === String(epNumber);
                                    });
                                    
                                    // If not found by number, try by index (episodes array is usually 0-indexed or 1-indexed)
                                    if (!episode && infoData.episodes.length >= epNumber) {
                                      // Try 1-indexed (episode 1 = index 0)
                                      episode = infoData.episodes[epNumber - 1];
                                      // If that doesn't work, try 0-indexed
                                      if (!episode && infoData.episodes[epNumber]) {
                                        episode = infoData.episodes[epNumber];
                                      }
                                    }
                                    
                                    if (episode && (episode.id || episode.episodeId)) {
                                      const episodeIdToUse = episode.id || episode.episodeId;
                                      
                                      // Step 4: Get streaming URL for this episode
                                      const episodeUrl = ANIME_APIS.CONSUMET.getEpisode(episodeIdToUse, provider);
                                      const episodeResponse = await fetch(episodeUrl, {
                                        headers: { 'Accept': 'application/json' },
                                        next: { revalidate: 600 }, // Cache for 10 minutes
                                      });

                                  if (episodeResponse.ok) {
                                    const episodeData = await episodeResponse.json();
                                    
                                    // Extract streaming URL - handle all possible formats
                                    let streamingUrl = '';
                                    let iframeUrl = '';
                                    
                                    // Check for sources array (most common in Consumet) - ALWAYS prefer this
                                    if (episodeData.sources && Array.isArray(episodeData.sources) && episodeData.sources.length > 0) {
                                      // Filter out invalid URLs and blocked domains - STRICT FILTERING
                                      const validSources = episodeData.sources.filter((s: any) => {
                                        if (!s) return false;
                                        const url = s.url || s.file || s.src;
                                        // Apply strict filtering - reject blocked domains
                                        return filterBlockedUrls(url);
                                      });
                                      
                                      if (validSources.length > 0) {
                                        // STRONGLY prefer direct video file URLs (these never have X-Frame-Options issues)
                                        const directVideoSource = validSources.find((s: any) => {
                                          const url = s.url || s.file || s.src;
                                          return isDirectVideoUrl(url);
                                        });
                                        
                                        if (directVideoSource) {
                                          const url = directVideoSource.url || directVideoSource.file || directVideoSource.src || '';
                                          // Double-check it's not blocked
                                          if (filterBlockedUrls(url)) {
                                            streamingUrl = url;
                                          }
                                        } else {
                                          // If no direct video, prefer non-M3U8 sources that aren't blocked
                                          const bestSource = validSources.find((s: any) => {
                                            const url = s.url || s.file || s.src;
                                            return !s.isM3U8 && filterBlockedUrls(url);
                                          }) || validSources.find((s: any) => {
                                            const url = s.url || s.file || s.src;
                                            return filterBlockedUrls(url);
                                          });
                                          
                                          if (bestSource) {
                                            const url = bestSource.url || bestSource.file || bestSource.src || '';
                                            // Final check - must pass filter
                                            if (filterBlockedUrls(url)) {
                                              streamingUrl = url;
                                            }
                                          }
                                        }
                                      }
                                    }
                                    // Check for iframe URL - ONLY if we don't have a direct video URL
                                    // NOTE: Iframe URLs are more likely to have X-Frame-Options issues
                                    if (!streamingUrl && episodeData.iframe && typeof episodeData.iframe === 'string' && episodeData.iframe.length > 0) {
                                      // STRICT check - must pass filter
                                      if (filterBlockedUrls(episodeData.iframe)) {
                                        iframeUrl = episodeData.iframe;
                                        streamingUrl = episodeData.iframe;
                                      }
                                    }
                                    // Check for direct URL
                                    if (!streamingUrl && episodeData.url && typeof episodeData.url === 'string' && episodeData.url.length > 0) {
                                      // Must pass filter - prefer direct video URLs
                                      if (filterBlockedUrls(episodeData.url)) {
                                        streamingUrl = episodeData.url;
                                      }
                                    }
                                    // Check for headers with Referer (embed URL) - be VERY careful with this
                                    if (!streamingUrl && episodeData.headers && episodeData.headers.Referer && typeof episodeData.headers.Referer === 'string') {
                                      // STRICT filter - Referer URLs often have X-Frame-Options
                                      if (filterBlockedUrls(episodeData.headers.Referer)) {
                                        iframeUrl = episodeData.headers.Referer;
                                        streamingUrl = episodeData.headers.Referer;
                                      }
                                    }
                                    // Check for download URL - these are usually direct video files (safe)
                                    if (!streamingUrl && episodeData.download && typeof episodeData.download === 'string' && episodeData.download.length > 0) {
                                      if (filterBlockedUrls(episodeData.download)) {
                                        streamingUrl = episodeData.download;
                                      }
                                    }
                                    // Check for subtitles with video URL
                                    if (!streamingUrl && episodeData.subtitles && Array.isArray(episodeData.subtitles) && episodeData.subtitles.length > 0) {
                                      const subtitleWithUrl = episodeData.subtitles.find((s: any) => {
                                        const url = s.url;
                                        return url && url.includes('http') && filterBlockedUrls(url);
                                      });
                                      if (subtitleWithUrl && subtitleWithUrl.url) {
                                        // Sometimes subtitle URL is actually the video URL
                                        if (subtitleWithUrl.url.match(/\.(mp4|webm|m3u8)/i)) {
                                          streamingUrl = subtitleWithUrl.url;
                                        }
                                      }
                                    }
                                    // Check for links array
                                    if (!streamingUrl && episodeData.links && Array.isArray(episodeData.links) && episodeData.links.length > 0) {
                                      const link = episodeData.links.find((l: any) => {
                                        const url = l.url;
                                        return url && url.startsWith('http') && filterBlockedUrls(url);
                                      });
                                      if (link && link.url) {
                                        streamingUrl = link.url;
                                      }
                                    }
                                    // Check for data object with url
                                    if (!streamingUrl && episodeData.data && episodeData.data.url) {
                                      if (filterBlockedUrls(episodeData.data.url)) {
                                        streamingUrl = episodeData.data.url;
                                      }
                                    }
                                    // Check for result object
                                    if (!streamingUrl && episodeData.result && episodeData.result.url) {
                                      if (filterBlockedUrls(episodeData.result.url)) {
                                        streamingUrl = episodeData.result.url;
                                      }
                                    }

                                        // FINAL SAFETY CHECK - Never return blocked URLs
                                        const finalUrl = iframeUrl || streamingUrl;
                                        if (finalUrl && filterBlockedUrls(finalUrl)) {
                                          return NextResponse.json({
                                            id: episodeId,
                                            title: episode.title || `Episode ${epNumber}`,
                                            episodeTitle: episode.title || `Episode ${epNumber}`,
                                            iframe: finalUrl,
                                            sources: streamingUrl ? [
                                              {
                                                url: streamingUrl,
                                                quality: 'default',
                                                isM3U8: streamingUrl.includes('.m3u8'),
                                              },
                                            ] : [],
                                          });
                                        }
                                        // If URL is blocked, continue to next provider/result
                                      }
                                    }
                                  }
                                }
                              } catch (infoError) {
                                // Try next result
                                continue;
                              }
                            }
                          }
                        }
                      } catch (searchError) {
                        // Try next title variation
                        continue;
                      }
                    }
                  } catch (providerError) {
                    // Try next provider
                    continue;
                  }
                }

              // Fallback to Cinetaro API (uses AniList ID directly)
              try {
                const anilistId = anime.id.toString();
                const types = ['sub', 'dub'];
                
                for (const type of types) {
                  const cinetaroUrl = ANIME_APIS.CINETARO.getEpisode(anilistId, 1, epNumber, type);
                  const cinetaroResponse = await fetch(cinetaroUrl, {
                    headers: { 'Accept': 'application/json' },
                    next: { revalidate: 1800 },
                  });

                  if (cinetaroResponse.ok) {
                    // Check if response is actually JSON before parsing
                    const contentType = cinetaroResponse.headers.get('content-type') || '';
                    if (!contentType.includes('application/json') && !contentType.includes('text/json')) {
                      // Response is not JSON, skip this API
                      continue;
                    }
                    
                    // Try to parse JSON, but handle HTML responses gracefully
                    let cinetaroData;
                    try {
                      const text = await cinetaroResponse.text();
                      // Check if response starts with HTML (DOCTYPE, <html, etc.)
                      if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html') || text.trim().startsWith('<')) {
                        // This is HTML, not JSON - skip
                        continue;
                      }
                      cinetaroData = JSON.parse(text);
                    } catch (parseError) {
                      // Failed to parse as JSON - skip this API
                      continue;
                    }
                    
                    if (cinetaroData.iframe || cinetaroData.url || (cinetaroData.sources && cinetaroData.sources.length > 0)) {
                      // Try to find a valid URL from Cinetaro (using helper functions from outer scope)
                      let streamingUrl = '';
                      
                      // Prefer direct video URLs
                      if (cinetaroData.sources && Array.isArray(cinetaroData.sources) && cinetaroData.sources.length > 0) {
                        const validSource = cinetaroData.sources.find((s: any) => {
                          const url = s.url || s.file || s.src;
                          return url && filterBlockedUrls(url);
                        });
                        if (validSource) {
                          streamingUrl = validSource.url || validSource.file || validSource.src || '';
                        }
                      }
                      
                      // Fallback to url or iframe if no sources
                      if (!streamingUrl) {
                        const url = cinetaroData.url || cinetaroData.iframe;
                        if (url && filterBlockedUrls(url)) {
                          streamingUrl = url;
                        }
                      }
                      
                      // Only return if we have a valid, non-blocked URL
                      if (streamingUrl && filterBlockedUrls(streamingUrl)) {
                        return NextResponse.json({
                          id: episodeId,
                          title: `Episode ${epNumber}`,
                          episodeTitle: `Episode ${epNumber}`,
                          iframe: streamingUrl,
                          sources: [{
                            url: streamingUrl,
                            quality: 'default',
                            isM3U8: streamingUrl.includes('.m3u8'),
                          }],
                        });
                      }
                    }
                    }
                  }
                } catch (cinetaroError: any) {
                  // Silently handle Cinetaro API errors (it's a fallback, not critical)
                  // Only log if it's not a JSON parse error (which we already handle)
                  if (cinetaroError && !cinetaroError.message?.includes('JSON')) {
                    console.warn('Cinetaro API error:', cinetaroError.message);
                  }
                }

              // Final fallback: Try to create a direct embed URL using anime title
              // This is a last resort that might work for some anime
              try {
                const animeTitleSlug = (anime.title.english || anime.title.romaji || anime.title.native || '')
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, '-')
                  .replace(/^-+|-+$/g, '');
                
                if (animeTitleSlug) {
                  // Try VidStreaming as last resort
                  const vidStreamUrl = `https://vidstreaming.io/streaming.php?id=${animeTitleSlug}&episode=${epNumber}`;
                  
                  // Return with this URL - let the player try it
                  return NextResponse.json({
                    id: episodeId,
                    title: `Episode ${epNumber}`,
                    episodeTitle: `Episode ${epNumber}`,
                    iframe: vidStreamUrl,
                    sources: [{
                      url: vidStreamUrl,
                      quality: 'default',
                      isM3U8: false,
                    }],
                  });
                }
              } catch (fallbackError) {
                // Ignore fallback errors
              }

              // If all streaming APIs fail, return episode data without URL
              return NextResponse.json({
                id: episodeId,
                title: `Episode ${epNumber}`,
                episodeTitle: `Episode ${epNumber}`,
                iframe: '',
                sources: [],
              });
            }
            }
          }
        } catch (apiError) {
          // Fall through to error
        }
      }
    }

    // If not found, return error
    return NextResponse.json(
      { error: 'Episode not found' },
      { status: 404 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Episode not found', message: error.message },
      { status: 404 }
    );
  }
}
