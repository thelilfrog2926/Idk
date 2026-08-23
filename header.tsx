"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, Play, X, Maximize2, Minimize2, Gamepad, Info } from "lucide-react";

type EmulatorType = "nes" | "snes" | "gba" | "gb" | "gbc" | "n64" | "nds" | "custom";

interface EmulatorInfo {
  name: string;
  extensions: string[];
  description: string;
  color: string;
}

const emulatorInfo: Record<EmulatorType, EmulatorInfo> = {
  nes: {
    name: "NES",
    extensions: [".nes"],
    description: "Nintendo Entertainment System",
    color: "bg-red-500",
  },
  snes: {
    name: "SNES",
    extensions: [".smc", ".sfc"],
    description: "Super Nintendo Entertainment System",
    color: "bg-purple-500",
  },
  gba: {
    name: "GBA",
    extensions: [".gba"],
    description: "Game Boy Advance",
    color: "bg-indigo-500",
  },
  gb: {
    name: "GB",
    extensions: [".gb"],
    description: "Game Boy",
    color: "bg-red-600",
  },
  gbc: {
    name: "GBC",
    extensions: [".gbc"],
    description: "Game Boy Color",
    color: "bg-teal-500",
  },
  n64: {
    name: "N64",
    extensions: [".n64", ".z64", ".v64"],
    description: "Nintendo 64",
    color: "bg-yellow-500",
  },
  nds: {
    name: "NDS",
    extensions: [".nds"],
    description: "Nintendo DS",
    color: "bg-blue-500",
  },
  custom: {
    name: "Custom ROM",
    extensions: [".nes", ".smc", ".sfc", ".gba", ".gb", ".gbc", ".n64", ".z64", ".v64", ".nds"],
    description: "Load any supported ROM file",
    color: "bg-primary",
  },
};

export function Emulators() {
  const [selectedEmulator, setSelectedEmulator] = useState<EmulatorType | null>(null);
  const [romFile, setRomFile] = useState<File | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInfo, setShowInfo] = useState<EmulatorType | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setRomFile(file);
      // Auto-detect emulator type based on file extension
      const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
      for (const [type, info] of Object.entries(emulatorInfo)) {
        if (info.extensions.includes(ext)) {
          setSelectedEmulator(type as EmulatorType);
          break;
        }
      }
    }
  };

  const handlePlay = () => {
    if (romFile && selectedEmulator) {
      setIsPlaying(true);
    }
  };

  const handleClose = () => {
    // Clean up EmulatorJS instance
    const gameContainer = document.getElementById("game-container");
    if (gameContainer) {
      gameContainer.innerHTML = "";
    }
    // Remove any EmulatorJS scripts
    const existingScripts = document.querySelectorAll('script[src*="emulatorjs"]');
    existingScripts.forEach(s => s.remove());
    // Clean up globals
    const win = window as unknown as Record<string, unknown>;
    delete win.EJS_player;
    delete win.EJS_core;
    delete win.EJS_gameUrl;
    delete win.EJS_pathtodata;
    delete win.EJS_color;
    delete win.EJS_startOnLoaded;
    delete win.EJS_emulator;
    
    setIsPlaying(false);
    setRomFile(null);
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  // Emulator canvas with EmulatorJS
  useEffect(() => {
    if (!isPlaying || !romFile || !selectedEmulator) return;

    let romUrl: string | null = null;
    let script: HTMLScriptElement | null = null;
    let isCancelled = false;

    const loadEmulator = async () => {
      try {
        // Read the ROM file
        const arrayBuffer = await romFile.arrayBuffer();
        if (isCancelled) return;
        
        const uint8Array = new Uint8Array(arrayBuffer);
        
        // Create a blob URL for the ROM
        const blob = new Blob([uint8Array]);
        romUrl = URL.createObjectURL(blob);

        // Map our emulator types to EmulatorJS cores
        const coreMap: Record<EmulatorType, string> = {
          nes: "nes",
          snes: "snes",
          gba: "gba",
          gb: "gb",
          gbc: "gbc",
          n64: "n64",
          nds: "nds",
          custom: "nes", // Default to NES for custom, will be overridden by extension detection
        };

        // Clear any previous EmulatorJS instance
        const gameContainer = document.getElementById("game-container");
        if (gameContainer) {
          gameContainer.innerHTML = "";
        }

        // Set up EmulatorJS global configuration
        const win = window as unknown as Record<string, unknown>;
        win.EJS_player = "#game-container";
        win.EJS_core = coreMap[selectedEmulator];
        win.EJS_gameUrl = romUrl;
        win.EJS_pathtodata = "https://cdn.emulatorjs.org/stable/data/";
        win.EJS_color = "#ef4444";
        win.EJS_startOnLoaded = true;

        // Remove any existing EmulatorJS scripts
        const existingScripts = document.querySelectorAll('script[src*="emulatorjs"]');
        existingScripts.forEach(s => s.remove());

        // Load the emulator script
        script = document.createElement("script");
        script.src = "https://cdn.emulatorjs.org/stable/data/loader.js";
        script.async = true;
        document.body.appendChild(script);
      } catch (error) {
        console.error("Failed to load emulator:", error);
      }
    };

    loadEmulator();

    return () => {
      isCancelled = true;
      if (romUrl) {
        URL.revokeObjectURL(romUrl);
      }
      if (script) {
        script.remove();
      }
      // Clean up EmulatorJS globals
      const win = window as unknown as Record<string, unknown>;
      delete win.EJS_player;
      delete win.EJS_core;
      delete win.EJS_gameUrl;
      delete win.EJS_pathtodata;
      delete win.EJS_color;
      delete win.EJS_startOnLoaded;
      // Clear the game container
      const gameContainer = document.getElementById("game-container");
      if (gameContainer) {
        gameContainer.innerHTML = "";
      }
    };
  }, [isPlaying, romFile, selectedEmulator]);

  if (isPlaying) {
    return (
      <div ref={containerRef} className={`fixed inset-0 z-50 bg-black flex flex-col ${isFullscreen ? 'fullscreen-mode' : ''}`}>
        {!isFullscreen && (
          <div className="flex items-center justify-between p-4 bg-card border-b border-border">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Gamepad className="w-5 h-5" />
              {emulatorInfo[selectedEmulator!].name} - {romFile?.name}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleFullscreen}
                className="p-2 hover:bg-secondary rounded-lg transition-colors text-foreground"
                title="Toggle Fullscreen (Press ESC to exit)"
              >
                <Maximize2 className="w-5 h-5" />
              </button>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-destructive/20 text-destructive rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
        <div className="flex-1 relative">
          <div id="game-container" className="absolute inset-0 w-full h-full" />
          {isFullscreen && (
            <button
              onClick={() => document.exitFullscreen()}
              className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-lg transition-colors text-white opacity-0 hover:opacity-100 focus:opacity-100 z-50"
              title="Press ESC to exit fullscreen"
            >
              <Minimize2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Emulators</h2>
        <p className="text-muted-foreground">
          Play classic games with our built-in emulators. Upload your own ROM files!
        </p>
      </div>

      {/* Emulator Selection */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {(Object.entries(emulatorInfo) as [EmulatorType, EmulatorInfo][]).map(([type, info]) => (
          <div
            key={type}
            className={`relative group bg-card rounded-xl border transition-all duration-300 overflow-hidden ${
              selectedEmulator === type
                ? "border-primary ring-2 ring-primary/20"
                : "border-border hover:border-primary/50"
            }`}
          >
            <button
              onClick={() => setSelectedEmulator(type)}
              className="w-full p-6 text-left"
            >
              <div className={`w-12 h-12 rounded-lg ${info.color} flex items-center justify-center mb-4`}>
                <Gamepad className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">{info.name}</h3>
              <p className="text-sm text-muted-foreground">{info.description}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {info.extensions.join(", ")}
              </p>
            </button>
            <button
              onClick={() => setShowInfo(showInfo === type ? null : type)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* ROM Upload Section */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Upload ROM</h3>
        
        <input
          ref={fileInputRef}
          type="file"
          accept={selectedEmulator ? emulatorInfo[selectedEmulator].extensions.join(",") : ".nes,.smc,.sfc,.gba,.gb,.gbc,.n64,.z64,.v64,.nds"}
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg transition-colors border-2 border-dashed border-border"
          >
            <Upload className="w-6 h-6" />
            <div className="text-left">
              <p className="font-medium">
                {romFile ? romFile.name : "Select ROM File"}
              </p>
              <p className="text-sm text-muted-foreground">
                {selectedEmulator
                  ? `Supported: ${emulatorInfo[selectedEmulator].extensions.join(", ")}`
                  : "Select an emulator first or upload any ROM"}
              </p>
            </div>
          </button>

          <button
            onClick={handlePlay}
            disabled={!romFile}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            <Play className="w-5 h-5" />
            Play ROM
          </button>
        </div>

        {romFile && (
          <div className="mt-4 p-4 bg-secondary/50 rounded-lg">
            <p className="text-sm text-foreground">
              <span className="font-medium">Selected:</span> {romFile.name}
            </p>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Size:</span> {(romFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
            {selectedEmulator && (
              <p className="text-sm text-primary">
                <span className="font-medium">Emulator:</span> {emulatorInfo[selectedEmulator].name}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">How to Use</h3>
        <ol className="space-y-3 text-muted-foreground">
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-sm font-medium flex items-center justify-center">1</span>
            <span>Select an emulator type above (or leave as Custom ROM for auto-detection)</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-sm font-medium flex items-center justify-center">2</span>
            <span>Upload your ROM file (must match the emulator&apos;s supported formats)</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-sm font-medium flex items-center justify-center">3</span>
            <span>Click &quot;Play ROM&quot; to start playing!</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-sm font-medium flex items-center justify-center">4</span>
            <span>Use the fullscreen button for the best experience. Press ESC to exit.</span>
          </li>
        </ol>
      </div>

      {/* Nintendo DS Special Section */}
      <div className="bg-card rounded-xl border-2 border-blue-500/30 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
            <Gamepad className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Nintendo DS Emulator</h3>
            <p className="text-sm text-muted-foreground">Dual-screen gaming experience</p>
          </div>
        </div>
        <p className="text-muted-foreground mb-4">
          The NDS emulator supports dual-screen gameplay with touch controls. Upload your .nds ROM files to play classic DS games!
        </p>
        <button
          onClick={() => {
            setSelectedEmulator("nds");
            fileInputRef.current?.click();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
        >
          <Upload className="w-4 h-4" />
          Load DS ROM
        </button>
      </div>
    </div>
  );
}
