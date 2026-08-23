"use client";

import { Game } from "@/lib/games-data";
import { X, Maximize2, Minimize2 } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";

interface GamePlayerProps {
  game: Game | null;
  onClose: () => void;
  startFullscreen?: boolean;
}

// Cross-browser fullscreen helpers
function requestFullscreenCompat(element: HTMLElement): Promise<void> {
  if (element.requestFullscreen) {
    return element.requestFullscreen();
  }
  // Safari
  const el = element as HTMLElement & {
    webkitRequestFullscreen?: () => Promise<void>;
    webkitRequestFullScreen?: () => Promise<void>;
    mozRequestFullScreen?: () => Promise<void>;
    msRequestFullscreen?: () => Promise<void>;
  };
  if (el.webkitRequestFullscreen) {
    return el.webkitRequestFullscreen();
  }
  if (el.webkitRequestFullScreen) {
    return el.webkitRequestFullScreen();
  }
  if (el.mozRequestFullScreen) {
    return el.mozRequestFullScreen();
  }
  if (el.msRequestFullscreen) {
    return el.msRequestFullscreen();
  }
  return Promise.reject(new Error("Fullscreen not supported"));
}

function exitFullscreenCompat(): Promise<void> {
  if (document.exitFullscreen) {
    return document.exitFullscreen();
  }
  const doc = document as Document & {
    webkitExitFullscreen?: () => Promise<void>;
    webkitCancelFullScreen?: () => Promise<void>;
    mozCancelFullScreen?: () => Promise<void>;
    msExitFullscreen?: () => Promise<void>;
  };
  if (doc.webkitExitFullscreen) {
    return doc.webkitExitFullscreen();
  }
  if (doc.webkitCancelFullScreen) {
    return doc.webkitCancelFullScreen();
  }
  if (doc.mozCancelFullScreen) {
    return doc.mozCancelFullScreen();
  }
  if (doc.msExitFullscreen) {
    return doc.msExitFullscreen();
  }
  return Promise.reject(new Error("Exit fullscreen not supported"));
}

function getFullscreenElement(): Element | null {
  const doc = document as Document & {
    webkitFullscreenElement?: Element | null;
    mozFullScreenElement?: Element | null;
    msFullscreenElement?: Element | null;
  };
  return (
    document.fullscreenElement ||
    doc.webkitFullscreenElement ||
    doc.mozFullScreenElement ||
    doc.msFullscreenElement ||
    null
  );
}

export function GamePlayer({ game, onClose, startFullscreen = false }: GamePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleFullscreenChange = useCallback(() => {
    setIsFullscreen(!!getFullscreenElement());
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;

    try {
      if (!getFullscreenElement()) {
        await requestFullscreenCompat(containerRef.current);
        setIsFullscreen(true);
      } else {
        await exitFullscreenCompat();
        setIsFullscreen(false);
      }
    } catch {
      // Fullscreen not supported or blocked
    }
  }, []);

  useEffect(() => {
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
    };
  }, [handleFullscreenChange]);

  useEffect(() => {
    if (startFullscreen && containerRef.current && game) {
      const timer = setTimeout(() => {
        if (containerRef.current) {
          requestFullscreenCompat(containerRef.current).catch(() => {});
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [startFullscreen, game]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        exitFullscreenCompat().catch(() => {});
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  if (!game) return null;

  return (
    <div 
      ref={containerRef}
      className={`fixed inset-0 z-50 bg-background flex flex-col ${isFullscreen ? 'fullscreen-mode' : ''}`}
    >
      {!isFullscreen && (
        <div className="flex items-center justify-between p-4 bg-card border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">{game.title}</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-secondary rounded-lg transition-colors text-foreground"
              title="Toggle Fullscreen (Press ESC to exit)"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-destructive/20 text-destructive rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
      <div className="flex-1 relative">
        <iframe
          src={game.url}
          className="absolute inset-0 w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
        />
        {isFullscreen && (
          <button
            onClick={() => exitFullscreenCompat().catch(() => {})}
            className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-lg transition-colors text-white opacity-0 hover:opacity-100 focus:opacity-100"
            title="Press ESC to exit fullscreen"
          >
            <Minimize2 className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
