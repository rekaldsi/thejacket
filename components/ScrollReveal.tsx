"use client";

import { useEffect, useRef, useState } from "react";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number; // ms
}

export default function ScrollReveal({ children, className = "", delay = 0 }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Delay if specified
          if (delay > 0) {
            setTimeout(() => setRevealed(true), delay);
          } else {
            setRevealed(true);
          }
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: revealed ? 1 : 0,
        transform: revealed ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.6s ${delay}ms ease-out, transform 0.6s ${delay}ms ease-out`,
      }}
    >
      {children}
    </div>
  );
}
