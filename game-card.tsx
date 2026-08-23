"use client";

import { useState, useMemo } from "react";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { GameCard } from "@/components/game-card";
import { GamePlayer } from "@/components/game-player";
import { Emulators } from "@/components/emulators";
import { AIChatbot } from "@/components/ai-chatbot";
import { GCUAI } from "@/components/gcu-ai";
import { games, Game } from "@/lib/games-data";
import { Gamepad2, Sparkles, Zap } from "lucide-react";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeTab, setActiveTab] = useState("games");
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const [startFullscreen, setStartFullscreen] = useState(false);

  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      const matchesCategory =
        activeCategory === "All" || game.category === activeCategory;
      const matchesSearch =
        game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const handlePlay = (game: Game) => {
    setCurrentGame(game);
    setStartFullscreen(false);
  };

  const handleFullscreen = (game: Game) => {
    setCurrentGame(game);
    setStartFullscreen(true);
  };

  const handleCloseGame = () => {
    setCurrentGame(null);
    setStartFullscreen(false);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-50 transition-transform duration-300 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <Sidebar
          activeCategory={activeCategory}
          onCategoryChange={(cat) => {
            setActiveCategory(cat);
            setMobileMenuOpen(false);
          }}
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setMobileMenuOpen(false);
          }}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        />

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {activeTab === "games" && (
            <div className="space-y-6">
              {/* Hero Section */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-card to-accent/20 border border-border p-6 md:p-8">
                <div className="relative z-10">
                  <div className="flex items-center gap-2 text-primary mb-2">
                    <Zap className="w-5 h-5" />
                    <span className="text-sm font-medium">Unblocked Games</span>
                  </div>
                  <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-2 text-balance">
                    Play Your Favorite Games
                  </h1>
                  <p className="text-muted-foreground max-w-xl">
                    Access the best collection of unblocked games. Play anywhere, anytime - no restrictions!
                  </p>
                </div>
                <div className="absolute right-0 top-0 w-64 h-64 opacity-10">
                  <Gamepad2 className="w-full h-full" />
                </div>
              </div>

              {/* Featured Games */}
              {!searchQuery && activeCategory === "All" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-semibold text-foreground">Featured Games</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {games.slice(0, 4).map((game) => (
                      <GameCard
                        key={game.id}
                        game={game}
                        onPlay={handlePlay}
                        onFullscreen={handleFullscreen}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* All Games */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">
                    {activeCategory === "All" ? "All Games" : activeCategory}
                  </h2>
                  <span className="text-sm text-muted-foreground">
                    {filteredGames.length} games
                  </span>
                </div>
                
                {filteredGames.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredGames.map((game) => (
                      <GameCard
                        key={game.id}
                        game={game}
                        onPlay={handlePlay}
                        onFullscreen={handleFullscreen}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Gamepad2 className="w-16 h-16 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-1">No games found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your search or category filter
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "emulators" && <Emulators />}
          
          {activeTab === "chatbot" && <AIChatbot />}
          
          {activeTab === "gcu-ai" && <GCUAI />}
        </main>

        {/* Footer */}
        <footer className="border-t border-border p-4 text-center text-sm text-muted-foreground">
          <p>VC-Games V6 - Play unblocked games online for free</p>
        </footer>
      </div>

      {/* Game Player Modal */}
      <GamePlayer
        game={currentGame}
        onClose={handleCloseGame}
        startFullscreen={startFullscreen}
      />
    </div>
  );
}
