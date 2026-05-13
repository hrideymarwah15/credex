"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { motion } from "motion/react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="w-9 h-9" />;
  }

  const isDark = theme === "dark";

  return (
    <motion.button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      whileTap={{ scale: 0.93 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 dark:text-muted hover:text-slate-900 dark:hover:text-foreground hover:bg-slate-100 dark:hover:bg-surface border border-transparent hover:border-slate-200 dark:hover:border-border transition-all"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark 
        ? <Sun className="w-4 h-4" />
        : <Moon className="w-4 h-4" />
      }
    </motion.button>
  );
}
