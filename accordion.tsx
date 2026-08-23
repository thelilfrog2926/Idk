"use client";

import { Bot, ExternalLink, MessageSquare } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function GCUAI() {
  const zapierUrl = "https://gcu-Ai.zapier.app/?docs.google.com";
  const [showIframe, setShowIframe] = useState(true);
  const [iframeError, setIframeError] = useState(false);

  const handleIframeError = () => {
    setIframeError(true);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-h-[900px]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">GCU AI</h2>
            <p className="text-sm text-muted-foreground">Powered by Zapier</p>
          </div>
        </div>
        <a
          href={zapierUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Open in New Tab
        </a>
      </div>

      {/* Embedded Zapier Chatbot or Fallback */}
      <div className="flex-1 rounded-xl border border-border overflow-hidden bg-card">
        {showIframe && !iframeError ? (
          <iframe
            src={zapierUrl}
            title="GCU AI Chatbot"
            className="w-full h-full border-0"
            allow="microphone; clipboard-write; clipboard-read"
            referrerPolicy="no-referrer-when-downgrade"
            onError={handleIframeError}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <MessageSquare className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Open GCU AI
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              The GCU AI chatbot needs to be opened in a new tab for the best experience.
            </p>
            <Button asChild size="lg">
              <a
                href={zapierUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <ExternalLink className="w-5 h-5" />
                Launch GCU AI
              </a>
            </Button>
            {iframeError && (
              <button
                onClick={() => {
                  setIframeError(false);
                  setShowIframe(true);
                }}
                className="mt-4 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Try embedding again
              </button>
            )}
          </div>
        )}
      </div>

      {/* Info Footer */}
      <div className="mt-4 p-3 bg-secondary/50 rounded-lg">
        <p className="text-xs text-muted-foreground text-center">
          GCU AI is an external service. Your conversations are handled by Zapier.
          {!showIframe || iframeError ? " Click the button above to open it in a new tab." : ""}
        </p>
      </div>
    </div>
  );
}
