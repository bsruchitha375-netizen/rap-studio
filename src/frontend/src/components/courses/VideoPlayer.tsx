import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

// ── YouTube IFrame API types ──────────────────────────────────────────────────
declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string | HTMLElement,
        options: YTPlayerOptions,
      ) => YTPlayer;
      PlayerState: {
        UNSTARTED: -1;
        ENDED: 0;
        PLAYING: 1;
        PAUSED: 2;
        BUFFERING: 3;
        CUED: 5;
      };
    };
    onYouTubeIframeAPIReady: (() => void) | undefined;
  }
}

interface YTPlayerOptions {
  height?: string;
  width?: string;
  videoId: string;
  playerVars?: {
    rel?: number;
    modestbranding?: number;
    showinfo?: number;
    controls?: number;
    enablejsapi?: number;
    origin?: string;
  };
  events?: {
    onReady?: (event: YTEvent) => void;
    onStateChange?: (event: YTStateEvent) => void;
  };
}

interface YTEvent {
  target: YTPlayer;
}
interface YTStateEvent {
  data: number;
  target: YTPlayer;
}
interface YTPlayer {
  destroy(): void;
  getCurrentTime(): number;
  getDuration(): number;
}

// ── Extract YouTube video ID ──────────────────────────────────────────────────
function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([A-Za-z0-9_-]{11})/,
  );
  return match?.[1] ?? null;
}

// ── Load YouTube IFrame API (idempotent) ──────────────────────────────────────
let ytApiLoaded = false;
let ytApiReady = false;
const ytReadyCallbacks: Array<() => void> = [];

function loadYTApi(onReady: () => void): void {
  if (ytApiReady) {
    onReady();
    return;
  }
  ytReadyCallbacks.push(onReady);
  if (ytApiLoaded) return;
  ytApiLoaded = true;

  const script = document.createElement("script");
  script.src = "https://www.youtube.com/iframe_api";
  script.async = true;
  document.head.appendChild(script);

  window.onYouTubeIframeAPIReady = () => {
    ytApiReady = true;
    for (const cb of ytReadyCallbacks) cb();
    ytReadyCallbacks.length = 0;
  };
}

// ── Props ─────────────────────────────────────────────────────────────────────
export interface VideoPlayerProps {
  youtubeUrl: string;
  lessonId: number;
  isLocked: boolean;
  isCompleted: boolean;
  onVideoComplete: () => void;
  /** Called when video reaches ~90% progress */
  onNearComplete?: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────
export function VideoPlayer({
  youtubeUrl,
  lessonId,
  isLocked,
  isCompleted,
  onVideoComplete,
  onNearComplete,
}: VideoPlayerProps) {
  const safeUrl = youtubeUrl ?? "";
  const videoId = extractYouTubeId(safeUrl);
  const playerContainerId = `yt-player-${lessonId}`;
  const playerRef = useRef<YTPlayer | null>(null);
  const progressTimerRef = useRef<number | null>(null);
  const nearCompleteCalledRef = useRef(false);
  // Fallback: if video was playing and stopped at >95%, trigger complete
  const lastProgressRef = useRef(0);

  const [playerReady, setPlayerReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(isCompleted);
  const [showOverlay, setShowOverlay] = useState(!isCompleted);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (isCompleted) {
      setCompleted(true);
      setShowOverlay(false);
      setProgress(100);
    }
  }, [isCompleted]);

  const prevVideoIdRef = useRef(videoId);
  if (prevVideoIdRef.current !== videoId) {
    prevVideoIdRef.current = videoId;
    nearCompleteCalledRef.current = false;
  }

  const onVideoCompleteRef = useRef(onVideoComplete);
  useEffect(() => {
    onVideoCompleteRef.current = onVideoComplete;
  }, [onVideoComplete]);

  const onNearCompleteRef = useRef(onNearComplete);
  useEffect(() => {
    onNearCompleteRef.current = onNearComplete;
  }, [onNearComplete]);

  const triggerComplete = useCallback(() => {
    setIsPlaying(false);
    setProgress(100);
    stopProgressPolling();
    setCompleted(true);
    setShowOverlay(false);
    onVideoCompleteRef.current();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startProgressPolling = useCallback(() => {
    if (progressTimerRef.current) return;
    progressTimerRef.current = window.setInterval(() => {
      if (!playerRef.current) return;
      try {
        const current = playerRef.current.getCurrentTime();
        const duration = playerRef.current.getDuration();
        if (duration > 0) {
          const pct = Math.min(100, (current / duration) * 100);
          setProgress(pct);
          lastProgressRef.current = pct;
          if (pct >= 90 && !nearCompleteCalledRef.current) {
            nearCompleteCalledRef.current = true;
            onNearCompleteRef.current?.();
          }
          // Fallback: auto-complete if stuck at 99%+ without ENDED firing
          if (pct >= 99.5) {
            window.clearInterval(progressTimerRef.current ?? undefined);
            progressTimerRef.current = null;
            triggerComplete();
          }
        }
      } catch {
        // player may not be ready
      }
    }, 500);
  }, [triggerComplete]);

  const stopProgressPolling = useCallback(() => {
    if (progressTimerRef.current) {
      window.clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  }, []);

  const startProgressPollingRef = useRef(startProgressPolling);
  useEffect(() => {
    startProgressPollingRef.current = startProgressPolling;
  }, [startProgressPolling]);

  const stopProgressPollingRef = useRef(stopProgressPolling);
  useEffect(() => {
    stopProgressPollingRef.current = stopProgressPolling;
  }, [stopProgressPolling]);

  const triggerCompleteRef = useRef(triggerComplete);
  useEffect(() => {
    triggerCompleteRef.current = triggerComplete;
  }, [triggerComplete]);

  useEffect(() => {
    if (!videoId || isLocked || completed) return;
    const containerId = playerContainerId;

    loadYTApi(() => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }

      playerRef.current = new window.YT.Player(containerId, {
        videoId,
        playerVars: {
          rel: 0,
          modestbranding: 1,
          showinfo: 0,
          enablejsapi: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: () => setPlayerReady(true),
          onStateChange: (event) => {
            const state = event.data;
            const PS = window.YT.PlayerState;
            if (state === PS.PLAYING) {
              setIsPlaying(true);
              setShowOverlay(false);
              startProgressPollingRef.current();
            } else if (state === PS.PAUSED || state === PS.BUFFERING) {
              setIsPlaying(false);
              stopProgressPollingRef.current();
            } else if (state === PS.ENDED) {
              triggerCompleteRef.current();
            }
          },
        },
      });
    });

    return () => {
      stopProgressPollingRef.current();
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {
          /* ignore */
        }
        playerRef.current = null;
      }
    };
  }, [videoId, playerContainerId, isLocked, completed]);

  // ── Locked state ──────────────────────────────────────────────────────────────
  if (isLocked) {
    return (
      <div
        className="relative w-full rounded-2xl overflow-hidden border"
        style={{ border: "1px solid oklch(0.68 0.2 290 / 0.3)" }}
        data-ocid="video_player.locked"
      >
        <div className="aspect-video relative bg-background/80">
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.18 0.07 290 / 0.92) 0%, oklch(0.1 0.05 270 / 0.96) 100%)",
            }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center border-2 mb-1"
              style={{
                background: "oklch(0.22 0.06 290 / 0.8)",
                borderColor: "oklch(0.68 0.2 290 / 0.5)",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="oklch(0.68 0.2 290)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <p
              className="font-display font-semibold text-sm text-center px-6 leading-snug"
              style={{ color: "oklch(0.88 0.01 280)" }}
            >
              Complete previous lesson to unlock this video
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── No video URL ──────────────────────────────────────────────────────────────
  if (!videoId) {
    return (
      <div
        className="aspect-video w-full rounded-2xl flex flex-col items-center justify-center gap-4"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.10 0.015 280), oklch(0.14 0.020 285))",
          border: "2px dashed oklch(var(--border) / 0.4)",
        }}
        data-ocid="video_player.no_video"
      >
        <div className="text-5xl">🎬</div>
        <div className="text-center px-8">
          <p className="text-sm font-semibold text-foreground mb-1">
            Video Coming Soon
          </p>
          <p className="text-xs text-muted-foreground">
            The instructor hasn't added a YouTube link yet.
          </p>
        </div>
      </div>
    );
  }

  const isActive = isPlaying || playerReady;
  const thumbnailSrc = videoId
    ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    : null;

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden transition-all duration-500"
      style={{
        background: "oklch(0.06 0.012 275)",
        border: `1px solid ${completed ? "oklch(0.65 0.18 150 / 0.5)" : isActive ? "oklch(var(--primary) / 0.5)" : "oklch(var(--border) / 0.4)"}`,
        boxShadow: completed
          ? "0 0 0 1px oklch(0.65 0.18 150 / 0.15), 0 8px 40px oklch(0.07 0.01 270 / 0.7)"
          : isActive
            ? "0 0 0 1px oklch(var(--primary) / 0.15), 0 0 32px oklch(var(--primary) / 0.18), 0 8px 40px oklch(0.07 0.01 270 / 0.7)"
            : "0 8px 32px oklch(0.07 0.01 270 / 0.5)",
      }}
      data-ocid="video_player.container"
    >
      {/* Top progress bar */}
      <AnimatePresence>
        {isPlaying && !completed && (
          <motion.div
            key="progress-bar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-0 left-0 right-0 z-20 h-1 rounded-t-2xl overflow-hidden"
            style={{ background: "oklch(var(--border) / 0.3)" }}
          >
            <motion.div
              className="h-full"
              style={{
                background: "var(--gradient-gold)",
                width: `${progress}%`,
              }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 16:9 player container */}
      <div className="aspect-video relative">
        <div id={playerContainerId} className="w-full h-full" />

        {/* Play overlay */}
        <AnimatePresence>
          {showOverlay && !isPlaying && videoId && (
            <motion.div
              key="play-overlay"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer"
              style={{
                background:
                  "linear-gradient(180deg, oklch(0.06 0.012 275 / 0.3) 0%, oklch(0.06 0.012 275 / 0.85) 100%)",
                backdropFilter: "blur(2px)",
              }}
              data-ocid="video_player.play_overlay"
            >
              {thumbnailSrc && !imgError && (
                <img
                  src={thumbnailSrc}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover -z-10 opacity-50"
                  onError={() => setImgError(true)}
                />
              )}

              <motion.div
                className="w-20 h-20 rounded-full flex items-center justify-center mb-3"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.72 0.14 82 / 0.95) 0%, oklch(0.68 0.18 75 / 0.9) 100%)",
                  boxShadow:
                    "0 0 0 4px oklch(0.72 0.14 82 / 0.25), 0 0 48px oklch(0.72 0.14 82 / 0.35), 0 8px 24px oklch(0.07 0.01 270 / 0.6)",
                }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="oklch(0.08 0.01 280)"
                  aria-hidden="true"
                >
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </motion.div>
              <p
                className="font-display font-semibold text-sm tracking-wide"
                style={{ color: "oklch(0.92 0.01 80)" }}
              >
                Click to play
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Video complete badge */}
        <AnimatePresence>
          {completed && (
            <motion.div
              key="complete-badge"
              initial={{ opacity: 0, scale: 0.7, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
              className="absolute top-3 right-3 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
              style={{
                background: "oklch(0.65 0.18 150 / 0.18)",
                border: "1px solid oklch(0.65 0.18 150 / 0.6)",
                backdropFilter: "blur(12px)",
                color: "oklch(0.75 0.18 150)",
              }}
              data-ocid="video_player.complete_badge"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Video Complete
            </motion.div>
          )}
        </AnimatePresence>

        {/* Near-complete indicator */}
        <AnimatePresence>
          {progress >= 90 && progress < 100 && isPlaying && (
            <motion.div
              key="near-complete"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="absolute top-3 left-3 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
              style={{
                background: "oklch(0.68 0.2 290 / 0.18)",
                border: "1px solid oklch(0.68 0.2 290 / 0.5)",
                backdropFilter: "blur(12px)",
                color: "oklch(0.78 0.18 290)",
              }}
            >
              📝 Almost done — quiz coming up!
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom glow line when active */}
      {isActive && !completed && (
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, oklch(var(--primary) / 0.7) 50%, transparent 100%)",
          }}
        />
      )}
    </div>
  );
}
