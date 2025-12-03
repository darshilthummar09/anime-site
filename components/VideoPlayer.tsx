'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  FiPlay, 
  FiPause, 
  FiVolume2, 
  FiVolumeX, 
  FiMaximize, 
  FiMinimize,
  FiX,
  FiSkipForward,
  FiSkipBack,
  FiSettings,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { usePremium } from '@/contexts/PremiumContext';

interface VideoPlayerProps {
  iframeUrl: string;
  animeTitle: string;
  episodeTitle: string;
  animeId?: string;
  episodeId?: string;
  onEnded?: () => void;
}

export default function VideoPlayer({
  iframeUrl,
  animeTitle,
  episodeTitle,
  animeId,
  episodeId,
  onEnded,
}: VideoPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const { isPremium } = usePremium();

  // Save progress to localStorage
  const saveProgress = useCallback(() => {
    if (animeId && episodeId && videoRef.current) {
      const progress = Math.floor(videoRef.current.currentTime);
      localStorage.setItem(`progress-${animeId}-${episodeId}`, progress.toString());
    }
  }, [animeId, episodeId]);

  // Load saved progress
  useEffect(() => {
    if (animeId && episodeId && videoRef.current) {
      const savedProgress = localStorage.getItem(`progress-${animeId}-${episodeId}`);
      if (savedProgress) {
        const time = parseInt(savedProgress, 10);
        if (time > 0 && time < duration) {
          videoRef.current.currentTime = time;
        }
      }
    }
  }, [animeId, episodeId, duration]);

  // Auto-hide controls
  useEffect(() => {
    if (playing && !isDragging) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [playing, isDragging]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!videoRef.current) return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          skip(-10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          skip(10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          changeVolume(0.1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          changeVolume(-0.1);
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          toggleMute();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      // Save progress every 10 seconds
      if (Math.floor(video.currentTime) % 10 === 0) {
        saveProgress();
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);
    };

    const handlePlay = () => setPlaying(true);
    const handlePause = () => setPlaying(false);
    const handleEnded = () => {
      setPlaying(false);
      if (onEnded) onEnded();
    };
    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, [saveProgress, onEnded]);

  // Fullscreen handling
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Close settings when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showSettings && !(e.target as HTMLElement).closest('.settings-menu')) {
        setShowSettings(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showSettings]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (playing) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !muted;
      setMuted(!muted);
    }
  };

  const changeVolume = (delta: number) => {
    if (videoRef.current) {
      const newVolume = Math.max(0, Math.min(1, volume + delta));
      setVolume(newVolume);
      videoRef.current.volume = newVolume;
      if (newVolume > 0) setMuted(false);
    }
  };

  const skip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = percent * duration;
  };

  const handleProgressDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    videoRef.current.currentTime = percent * duration;
  };

  useEffect(() => {
    if (isDragging) {
      const handleMouseMove = (e: MouseEvent) => {
        if (!videoRef.current || !progressRef.current) return;
        const rect = progressRef.current.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        videoRef.current.currentTime = percent * duration;
      };
      const handleMouseUp = () => {
        setIsDragging(false);
      };
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, duration]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!isFullscreen) {
      containerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
  };

  const handleMouseLeave = () => {
    if (playing && !isDragging) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2000);
    }
  };


  // FINAL CLIENT-SIDE CHECK: Block domains that have X-Frame-Options issues
  const isBlockedDomain = (url: string): boolean => {
    if (!url) return true;
    const blockedDomains = [
      'familynonstop.com',
      'familynonstop',
      'www.familynonstop.com',
    ];
    const urlLower = url.toLowerCase();
    return blockedDomains.some(domain => urlLower.includes(domain.toLowerCase()));
  };
  
  // Check if URL is a direct video file
  const isDirectVideo = iframeUrl && (
    iframeUrl.match(/\.(mp4|webm|ogg|m3u8|mkv|avi)/i) ||
    iframeUrl.startsWith('blob:') ||
    iframeUrl.startsWith('data:')
  );
  
  // If URL is blocked, show error immediately
  if (iframeUrl && isBlockedDomain(iframeUrl) && !isDirectVideo) {
    return (
      <div className="relative w-full h-screen bg-black flex items-center justify-center">
        <div className="text-center px-4">
          <h2 className="text-2xl font-bold mb-4 text-white">Video Cannot Be Embedded</h2>
          <p className="text-gray-400 mb-6">
            This video source blocks embedding. Please try a different episode or check back later.
          </p>
          <button
            onClick={() => router.back()}
            className="bg-netflix-red text-white px-6 py-3 rounded font-semibold hover:bg-opacity-80 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!isPremium) {
    return (
      <div className="relative w-full h-screen bg-black flex items-center justify-center">
        <div className="text-center px-4">
          <h2 className="text-2xl font-bold mb-4">Premium Content</h2>
          <p className="text-gray-400 mb-6">This content is available for premium users only.</p>
          <button
            onClick={() => router.push('/subscription')}
            className="bg-netflix-red text-white px-8 py-3 rounded font-semibold hover:bg-opacity-80 transition"
          >
            Upgrade to Premium
          </button>
        </div>
      </div>
    );
  }

  useEffect(() => {
    // Reset iframe error when URL changes
    setIframeError(false);
    
    // Listen for X-Frame-Options errors in console
    const handleError = (event: ErrorEvent) => {
      const errorMessage = event.message || '';
      if (errorMessage.includes('X-Frame-Options') || 
          errorMessage.includes('Refused to display') ||
          errorMessage.includes('familynonstop')) {
        setIframeError(true);
      }
    };
    
    window.addEventListener('error', handleError);
    
    return () => {
      window.removeEventListener('error', handleError);
    };
  }, [iframeUrl]);

  if (!isDirectVideo) {
    // FINAL CHECK: If URL is blocked, show error immediately
    if (isBlockedDomain(iframeUrl)) {
      return (
        <div className="relative w-full h-screen bg-black flex items-center justify-center">
          <div className="text-center px-4">
            <h2 className="text-2xl font-bold mb-4 text-white">Video Cannot Be Embedded</h2>
            <p className="text-gray-400 mb-6">
              This video source blocks embedding (X-Frame-Options). Please try a different episode.
            </p>
            <button
              onClick={() => router.back()}
              className="bg-netflix-red text-white px-6 py-3 rounded font-semibold hover:bg-opacity-80 transition"
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }
    
    // For iframe embeds, use simpler player with error handling
    return (
      <div className="relative w-full h-screen bg-black">
        {iframeError ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center px-4">
              <h2 className="text-2xl font-bold mb-4 text-white">Video Cannot Be Embedded</h2>
              <p className="text-gray-400 mb-6">
                This video source doesn't allow embedding. Trying alternative sources...
              </p>
              <button
                onClick={() => router.back()}
                className="bg-netflix-red text-white px-6 py-3 rounded font-semibold hover:bg-opacity-80 transition"
              >
                Go Back
              </button>
            </div>
          </div>
        ) : (
          <iframe
            src={iframeUrl}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onError={() => setIframeError(true)}
            onLoad={(e) => {
              // Check if iframe loaded successfully
              try {
                const iframe = e.target as HTMLIFrameElement;
                // If we can't access iframe content, it might be blocked
                if (iframe.contentWindow === null) {
                  setIframeError(true);
                }
              } catch (err) {
                // Cross-origin error means iframe loaded but we can't access it (this is normal)
                // Only set error if we get a specific X-Frame-Options error
              }
            }}
          />
        )}
        <div className="absolute top-4 left-4">
          <button
            onClick={() => router.back()}
            className="text-white hover:text-gray-300 transition bg-black/50 rounded-full p-2"
          >
            <FiX size={24} />
          </button>
        </div>
      </div>
    );
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen bg-black group"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={iframeUrl}
        className="w-full h-full object-contain cursor-pointer"
        playsInline
        autoPlay
        volume={volume}
        muted={muted}
        playbackRate={playbackRate}
        onClick={togglePlay}
      />

      {/* Loading Spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="w-16 h-16 border-4 border-netflix-red border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Controls Overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity duration-300 pointer-events-none ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between pointer-events-auto controls-area">
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.back();
            }}
            className="text-white hover:text-gray-300 transition bg-black/50 rounded-full p-2 hover:bg-black/70"
          >
            <FiX size={24} />
          </button>
          <h2 className="text-white font-semibold text-lg max-w-md truncate">
            {animeTitle} - {episodeTitle}
          </h2>
          <div className="w-10" />
        </div>

        {/* Center Play Button */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            className={`pointer-events-auto w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center transition-opacity hover:bg-white/30 ${
              showControls ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {playing ? (
              <FiPause className="text-white ml-1" size={32} />
            ) : (
              <FiPlay className="text-white ml-1" size={32} />
            )}
          </button>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3 pointer-events-auto controls-area">
          {/* Progress Bar */}
          <div
            ref={progressRef}
            className="w-full h-2 bg-white/30 rounded-full cursor-pointer group/progress hover:h-3 transition-all"
            onClick={(e) => {
              e.stopPropagation();
              handleProgressClick(e);
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setIsDragging(true);
              handleProgressDrag(e);
            }}
          >
            <div className="relative h-full">
              <div
                className="absolute top-0 left-0 h-full bg-netflix-red rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-netflix-red rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity -ml-1.5"
                style={{ left: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Play/Pause */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
                className="text-white hover:text-gray-300 transition"
                title={playing ? 'Pause' : 'Play'}
              >
                {playing ? <FiPause size={24} /> : <FiPlay size={24} />}
              </button>

              {/* Skip Back */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  skip(-10);
                }}
                className="text-white hover:text-gray-300 transition"
                title="Rewind 10s (←)"
              >
                <FiSkipBack size={20} />
              </button>

              {/* Skip Forward */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  skip(10);
                }}
                className="text-white hover:text-gray-300 transition"
                title="Forward 10s (→)"
              >
                <FiSkipForward size={20} />
              </button>

              {/* Volume */}
              <div className="flex items-center space-x-2 group/volume">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMute();
                  }}
                  className="text-white hover:text-gray-300 transition"
                  title={muted ? 'Unmute (M)' : 'Mute (M)'}
                >
                  {muted || volume === 0 ? <FiVolumeX size={20} /> : <FiVolume2 size={20} />}
                </button>
                <div
                  ref={volumeRef}
                  className="w-0 group-hover/volume:w-20 h-1 bg-white/30 rounded-full overflow-hidden transition-all duration-300 cursor-pointer relative"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (!volumeRef.current) return;
                    const handleMouseMove = (moveEvent: MouseEvent) => {
                      const rect = volumeRef.current!.getBoundingClientRect();
                      const percent = Math.max(0, Math.min(1, (moveEvent.clientX - rect.left) / rect.width));
                      const newVolume = percent;
                      setVolume(newVolume);
                      if (videoRef.current) {
                        videoRef.current.volume = newVolume;
                        videoRef.current.muted = false;
                        setMuted(false);
                      }
                    };
                    const handleMouseUp = () => {
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                    };
                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                    handleMouseMove(e.nativeEvent);
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (!volumeRef.current) return;
                    const rect = volumeRef.current.getBoundingClientRect();
                    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                    const newVolume = percent;
                    setVolume(newVolume);
                    if (videoRef.current) {
                      videoRef.current.volume = newVolume;
                      videoRef.current.muted = false;
                      setMuted(false);
                    }
                  }}
                >
                  <div
                    className="h-full bg-white rounded-full transition-all"
                    style={{ width: `${(muted ? 0 : volume) * 100}%` }}
                  />
                </div>
              </div>

              {/* Time Display */}
              <div className="text-white text-sm font-mono">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Playback Speed */}
              <div className="relative group/settings settings-menu">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSettings(!showSettings);
                  }}
                  className="text-white hover:text-gray-300 transition"
                >
                  <FiSettings size={20} />
                </button>
                {showSettings && (
                  <div className="absolute bottom-full right-0 mb-2 bg-black/90 rounded-lg p-2 min-w-[120px] z-50">
                    <div className="text-white text-sm mb-2 px-2">Playback Speed</div>
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                      <button
                        key={rate}
                        onClick={(e) => {
                          e.stopPropagation();
                          setPlaybackRate(rate);
                          if (videoRef.current) videoRef.current.playbackRate = rate;
                          setShowSettings(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-sm hover:bg-white/10 rounded ${
                          playbackRate === rate ? 'text-netflix-red' : 'text-white'
                        }`}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Fullscreen */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFullscreen();
                }}
                className="text-white hover:text-gray-300 transition"
                title="Fullscreen (F)"
              >
                {isFullscreen ? <FiMinimize size={20} /> : <FiMaximize size={20} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Click overlay for empty areas when controls are hidden */}
      {!showControls && (
        <div
          className="absolute inset-0 cursor-pointer z-10"
          onClick={(e) => {
            const target = e.target as HTMLElement;
            // Don't toggle if clicking on controls
            if (target.closest('.controls-area')) {
              return;
            }
            // Toggle play for empty areas
            togglePlay();
          }}
        />
      )}
    </div>
  );
}
