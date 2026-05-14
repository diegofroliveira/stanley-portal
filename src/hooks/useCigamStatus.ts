import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

type CigamStatus = {
  is_active: boolean;
  sync_status: 'idle' | 'running' | 'success' | 'error';
  last_synced_at: string | null;
  sync_error_message: string | null;
};

export const useCigamStatus = (tenantId: string | undefined) => {
  const [cigam, setCigam] = useState<CigamStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenantId) {
      setLoading(false);
      return;
    }

    const fetchStatus = async () => {
      const { data, error } = await supabase
        .from('tenant_cigam_config')
        .select('is_active, sync_status, last_synced_at, sync_error_message')
        .eq('tenant_id', tenantId)
        .maybeSingle();

      if (!error && data) {
        setCigam(data as CigamStatus);
      }
      setLoading(false);
    };

    void fetchStatus();

    // Poll every 60s for live sync status
    const interval = setInterval(() => void fetchStatus(), 60_000);
    return () => clearInterval(interval);
  }, [tenantId]);

  return { cigam, loading };
};
