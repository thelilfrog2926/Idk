"use client";

import { categories, externalLinks } from "@/lib/games-data";
import { 
  Gamepad2, 
  Tv, 
  Users, 
  Bot, 
  Monitor, 
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from "lucide-react";

interface SidebarProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({
  activeCategory,
  onCategoryChange,
  activeTab,
  onTabChange,
  isCollapsed,
  onToggleCollapse,
}: SidebarProps) {
  const tabs = [
    { id: "games", label: "Games", icon: Gamepad2 },
    { id: "emulators", label: "Emulators", icon: Monitor },
    { id: "chatbot", label: "GameBot", icon: Bot },
    { id: "gcu-ai", label: "GCU AI", icon: Sparkles },
  ];

  return (
    <aside
      className={`bg-sidebar border-r border-sidebar-border h-full flex flex-col transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
        {!isCollapsed && (
          <h1 className="text-xl font-bold text-primary flex items-center gap-2">
            <Gamepad2 className="w-6 h-6" />
            VC-Games V6
          </h1>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-2 hover:bg-sidebar-accent rounded-lg transition-colors text-sidebar-foreground"
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-6 overflow-y-auto">
        {/* Main Tabs */}
        <div className="space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span className="font-medium">{tab.label}</span>}
              </button>
            );
          })}
        </div>

        {/* Categories - Only show when on games tab */}
        {activeTab === "games" && !isCollapsed && (
          <div className="space-y-1">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
              Categories
            </h3>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => onCategoryChange(category)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                  activeCategory === category
                    ? "bg-primary/20 text-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {/* External Links */}
        {!isCollapsed && (
          <div className="space-y-1">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
              External
            </h3>
            {externalLinks.map((link) => {
              const Icon = link.icon === "tv" ? Tv : Users;
              return (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sidebar-foreground hover:bg-sidebar-accent text-sm"
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{link.title}</span>
                </a>
              );
            })}
          </div>
        )}
      </nav>

      {/* About:blank cloak button */}
      {!isCollapsed && (
        <div className="p-3 border-t border-sidebar-border">
          <button
            onClick={() => {
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
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg transition-colors text-sm font-medium"
          >
            <EyeOff className="w-4 h-4" />
            <span>Cloak Tab</span>
          </button>
        </div>
      )}
    </aside>
  );
}
