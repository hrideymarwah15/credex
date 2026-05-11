"use client";

import { ThemeToggle } from "@/components/ui/ThemeToggle";

interface PageShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  headerContent?: React.ReactNode;
}

export function PageShell({ children, title, subtitle, headerContent }: PageShellProps) {
  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-16 sm:py-24 flex-1">
      <header className="mb-14">
        <div className="flex items-center justify-between mb-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
            <span className="text-[11px] font-medium tracking-wide text-muted uppercase">SpendLens</span>
          </div>
          <ThemeToggle />
        </div>
        {headerContent ?? (
          <>
            <h1 className="text-[2.5rem] sm:text-5xl font-bold tracking-tight leading-[1.08] text-foreground">
              {title ?? (
                <>
                  Stop overpaying for<br className="hidden sm:block" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400"> AI tools.</span>
                </>
              )}
            </h1>
            {subtitle && (
              <p className="mt-5 text-base text-muted max-w-md leading-relaxed">
                {subtitle}
              </p>
            )}
          </>
        )}
      </header>

      {children}

      <footer className="mt-24 flex items-center gap-3 text-[11px] text-muted border-t border-border/50 pt-6">
        <div className="h-1 w-1 rounded-full bg-border" aria-hidden="true" />
        Pricing verified May 2026. Not affiliated with listed tools.
      </footer>
    </main>
  );
}
