"use client";

import { useEffect, useRef, useState } from "react";
import { animate } from "motion";
import { motion, useReducedMotion } from "motion/react";
import { formatUsd } from "@/lib/utils";

interface Props {
  value: number;
  duration?: number;
  className?: string;
}

export function AnimatedCounter({ value, duration = 1.2, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const [displayValue, setDisplayValue] = useState(0);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (prefersReduced) {
      setDisplayValue(value);
      return;
    }
    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(latest) {
        setDisplayValue(Math.round(latest));
      },
    });
    return () => controls.stop();
  }, [value, duration, prefersReduced]);

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={prefersReduced ? false : { scale: 0.85, opacity: 0, filter: "blur(4px)" }}
      animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {formatUsd(displayValue)}
    </motion.span>
  );
}
