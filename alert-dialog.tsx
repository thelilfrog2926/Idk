"use client";

import { Search, Menu, EyeOff } from "lucide-react";
import { useState } from "react";

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onMenuToggle: () => void;
}

export function Header({ searchQuery, onSearchChange, onMenuToggle }: HeaderProps) {
  const [showSearch, setShowSearch] = useState(false);

  const handleCloak = () => {
    const win = window.open("about:blank", "_blank");
    if (win) {
      win.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Google Docs</title>
            <link rel="icon" href="https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico">
            <style>
              body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; }
              iframe { width: 100%; height: 100%; border: none; }
            </style>
          </head>
          <body>
            <iframe src="${window.location.href}"></iframe>
          </body>
        </html>
      `);
      win.document.close();
    }
  };

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 hover:bg-secondary rounded-lg transition-colors text-foreground"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <div className={`relative ${showSearch ? "w-64 sm:w-80" : "w-64 sm:w-80"}`}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search games..."
            onFocus={() => setShowSearch(true)}
            onBlur={() => setShowSearch(false)}
            className="w-full pl-9 pr-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleCloak}
          className="flex items-center gap-2 px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors text-sm font-medium"
        >
          <EyeOff className="w-4 h-4" />
          <span className="hidden sm:inline">Cloak</span>
        </button>
      </div>
    </header>
  );
}
