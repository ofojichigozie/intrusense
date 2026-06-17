import { useState, useCallback } from 'react';
import notify from '@/utils/notify';
import * as readingsApi from '@/services/readings';
import type { PaginatedReadings } from '@/types';

const PAGE_SIZE = 15;

export function useReadings(initialIntrusion = false) {
  const [data, setData] = useState<PaginatedReadings | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [intrusionOnly, setIntrusionOnly] = useState(initialIntrusion);

  const load = useCallback(async (p: number, intrusion: boolean) => {
    setLoading(true);
    try {
      const res = await readingsApi.getReadings({
        page: p,
        pageSize: PAGE_SIZE,
        ...(intrusion && { intrusion: true }),
      });
      setData(res.data.data);
    } catch {
      notify.error('Failed to load readings');
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(() => load(page, intrusionOnly), [load, page, intrusionOnly]);

  const changePage = (p: number) => {
    setPage(p);
    load(p, intrusionOnly);
  };

  const toggleFilter = () => {
    const next = !intrusionOnly;
    setIntrusionOnly(next);
    setPage(1);
    load(1, next);
  };

  const remove = async (id: string) => {
    try {
      await readingsApi.deleteReading(id);
      notify.success('Reading deleted');
      load(page, intrusionOnly);
    } catch {
      notify.error('Failed to delete reading');
    }
  };

  return { data, loading, page, intrusionOnly, load, refresh, changePage, toggleFilter, remove };
}
