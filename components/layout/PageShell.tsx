"use client";

import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { TrendingDown, Shield, Clock, Zap } from "lucide-react";
import { motion } from "motion/react";

interface PageShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  headerContent?: React.ReactNode;
}

const trustItems = [
  { icon: Shield, label: "No signup required" },
  { icon: Clock, label: "90-second audit" },
  { icon: TrendingDown, label: "Verified May 2026 pricing" },
];

export function PageShell({ children, title, subtitle, headerContent }: PageShellProps) {
  return (
    <div className="min-h-full flex flex-col bg-background">
      {/* Navigation bar */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-background/90 backdrop-blur-md border-b border-slate-200/80 dark:border-border">
        <div className="mx-auto max-w-2xl px-5 h-14 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-sm shadow-emerald-600/20">
              <TrendingDown className="w-3.5 h-3.5 text-white" aria-hidden="true" />
            </div>
            <span className="text-sm font-bold text-slate-900 dark:text-heading tracking-tight">SpendLens</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Live indicator */}
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-muted">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-dot" aria-hidden="true" />
              Live pricing
            </div>
            <div className="h-4 w-px bg-slate-200 dark:bg-border hidden sm:block" />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main id="main-content" className="mx-auto w-full max-w-2xl px-5 py-12 sm:py-16 flex-1">
        {/* Hero */}
        <section className="mb-10">
          {headerContent ?? (
            <>
              {/* Category badge */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="inline-flex items-center gap-2 mb-5"
              >
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-full px-3 py-1 tracking-wide uppercase">
                  <Zap className="w-2.5 h-2.5" aria-hidden="true" />
                  Free AI Tool Audit
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
                className="text-[2.6rem] sm:text-5xl font-bold tracking-tight leading-[1.06] text-slate-900 dark:text-heading mb-4"
              >
                {title ?? (
                  <>
                    Stop overpaying<br className="hidden sm:block" />{" "}
                    <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                      for AI tools.
                    </span>
                  </>
                )}
              </motion.h1>

              {/* Subtitle */}
              {subtitle && (
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
                  className="text-base text-slate-500 dark:text-muted max-w-lg leading-relaxed mb-7"
                >
                  {subtitle}
                </motion.p>
              )}

              {/* Trust strip */}
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-wrap items-center gap-x-5 gap-y-2"
              >
                {trustItems.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-muted">
                    <Icon className="w-3.5 h-3.5 text-emerald-500 shrink-0" aria-hidden="true" />
                    <span>{label}</span>
                  </div>
                ))}
              </motion.div>
            </>
          )}
        </section>

        {/* Page content */}
        <div className="pb-8">
          {children}
        </div>

        {/* Footer */}
        <footer className="border-t border-slate-100 dark:border-border/50 pt-6 mt-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-400 dark:text-muted/60">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
                <TrendingDown className="w-2 h-2 text-white" aria-hidden="true" />
              </div>
              <span>SpendLens</span>
            </div>
            <p>Pricing verified May 2026 · Not affiliated with listed tools · Free, always.</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
