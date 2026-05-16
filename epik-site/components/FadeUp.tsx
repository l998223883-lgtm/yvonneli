"use client";

import { useInView } from "@/hooks/useInView";
import { ReactNode } from "react";

interface FadeUpProps {
  children: ReactNode;
  delay?: number; // ms
  className?: string;
}

export default function FadeUp({ children, delay = 0, className }: FadeUpProps) {
  const { ref, inView } = useInView();

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.65s ease, transform 0.65s ease`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
