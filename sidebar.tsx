"use client";

import { Game } from "@/lib/games-data";
import { Play, Maximize2 } from "lucide-react";

interface GameCardProps {
  game: Game;
  onPlay: (game: Game) => void;
  onFullscreen: (game: Game) => void;
}

export function GameCard({ game, onPlay, onFullscreen }: GameCardProps) {
  return (
    <div className="group relative bg-card rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
      <div className="aspect-video relative overflow-hidden">
        <img
          src={game.thumbnail}
          alt={game.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          crossOrigin="anonymous"
        />
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <button
            onClick={() => onPlay(game)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            <Play className="w-4 h-4" />
            Play
          </button>
          <button
            onClick={() => onFullscreen(game)}
            className="flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-lg font-medium hover:bg-secondary/80 transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
            Fullscreen
          </button>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
            {game.title}
          </h3>
          <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
            {game.category}
          </span>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {game.description}
        </p>
      </div>
    </div>
  );
}
