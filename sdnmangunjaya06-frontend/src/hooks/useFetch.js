import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api';

export function useFetch(endpoint, options = {}) {
  const [data, setData] = useState(options.initialData || null);
  const [loading, setLoading] = useState(endpoint ? true : false);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    if (!endpoint) return;
    setLoading(true);
    setError('');

    try {
      const response = await api.get(endpoint);
      setData(response.data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Gagal mengambil data.');
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Optional polling interval (in ms) for realtime-ish updates
  useEffect(() => {
    if (!options.refetchInterval || !endpoint) return;
    const interval = setInterval(fetchData, options.refetchInterval);
    return () => clearInterval(interval);
  }, [fetchData, options.refetchInterval, endpoint]);

  return { data, loading, error, refetch: fetchData, setData };
}
