'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'cyberjob_hidden_jobs';

export function useHiddenJobs() {
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const [lastHidden, setLastHidden] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setHiddenIds(new Set(parsed));
        }
      }
    } catch {
      // storage disabled
    }

    const handleSync = () => {
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setHiddenIds(new Set(parsed));
        } else {
          setHiddenIds(new Set());
        }
      } catch {}
    };

    window.addEventListener('storage', handleSync);
    window.addEventListener('cyberjob:hidden_jobs_change', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('cyberjob:hidden_jobs_change', handleSync);
    };
  }, []);

  const persist = (ids: Set<string>) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(ids)));
      window.dispatchEvent(new Event('cyberjob:hidden_jobs_change'));
    } catch {}
  };

  const hideJob = useCallback((id: string, title?: string) => {
    setHiddenIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      persist(next);
      return next;
    });
    if (title) {
      setLastHidden({ id, title });
    }
  }, []);

  const unhideJob = useCallback((id: string) => {
    setHiddenIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      persist(next);
      return next;
    });
    setLastHidden((current) => (current?.id === id ? null : current));
  }, []);

  const clearLastHidden = useCallback(() => {
    setLastHidden(null);
  }, []);

  const unhideAll = useCallback(() => {
    setHiddenIds(new Set());
    persist(new Set());
    setLastHidden(null);
  }, []);

  return {
    hiddenIds,
    hideJob,
    unhideJob,
    unhideAll,
    lastHidden,
    clearLastHidden,
    isHidden: (id: string) => hiddenIds.has(id),
  };
}
