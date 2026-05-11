"use client";

import { useState } from "react";
import { Link2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Props {
  savings: number;
  url?: string | null;
}

export function ShareButtons({ savings, url }: Props) {
  const [copied, setCopied] = useState(false);

  const shareText = savings > 0
    ? `Just found $${Math.round(savings).toLocaleString()}/mo in AI tool savings with SpendLens. Free audit — no login needed.`
    : "Ran my AI tool spend through SpendLens — turns out I'm optimized. Free audit — no login needed.";

  const twitterUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}${url ? `&url=${encodeURIComponent(url)}` : ""}`;
  const linkedinUrl = url
    ? `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
    : null;

  const handleCopy = () => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener"
        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card/50 px-3 py-1.5 text-xs font-medium text-foreground/70 hover:text-foreground hover:border-muted transition-colors"
      >
        <ExternalLink className="w-3 h-3" aria-hidden="true" />
        Post on X
      </a>
      {linkedinUrl && (
        <a
          href={linkedinUrl}
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card/50 px-3 py-1.5 text-xs font-medium text-foreground/70 hover:text-foreground hover:border-muted transition-colors"
        >
          <ExternalLink className="w-3 h-3" aria-hidden="true" />
          LinkedIn
        </a>
      )}
      {url && (
        <Button variant="ghost" size="sm" onClick={handleCopy}>
          <Link2 className="w-3 h-3" aria-hidden="true" />
          {copied ? "Copied!" : "Copy link"}
        </Button>
      )}
    </div>
  );
}
