declare global {
  interface Window {
    goatcounter?: {
      count: (params: { path: string; title?: string; event?: boolean }) => void;
    };
  }
}

export function trackEvent(path: string, title?: string): void {
  if (typeof window !== "undefined" && window.goatcounter?.count) {
    window.goatcounter.count({ path, title, event: true });
  }
}
