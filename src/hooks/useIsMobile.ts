/**
 * Hook for responsive mobile breakpoint detection.
 */

"use client";

import { useEffect, useState } from "react";

const MOBILE_BREAKPOINT = 768;

/** Returns true when viewport width is below the mobile breakpoint */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    setIsMobile(mq.matches);

    function handleChange(e: MediaQueryListEvent) {
      setIsMobile(e.matches);
    }

    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  return isMobile;
}
