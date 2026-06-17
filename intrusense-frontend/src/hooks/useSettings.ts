import { useState, useCallback } from 'react';
import notify from '@/utils/notify';
import * as settingsApi from '@/services/settings';
import type { Settings, SystemStatus } from '@/types';

export function useSettings() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [updatingSettings, setUpdatingSettings] = useState(false);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await settingsApi.getStatus();
      setStatus(res.data.data);
    } catch {
      notify.error('Failed to load system status');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSettings = async (updates: Partial<Settings>) => {
    setUpdatingSettings(true);
    try {
      await settingsApi.updateSettings(updates);
      notify.success('Settings updated');
      await fetchStatus();
    } catch {
      notify.error('Failed to update settings');
    } finally {
      setUpdatingSettings(false);
    }
  };

  const toggleArmed = async () => {
    if (!status) return;
    const armed = !status.settings.armed;
    try {
      await settingsApi.updateSettings({ armed });
      setStatus((s) => (s ? { ...s, settings: { ...s.settings, armed } } : s));
      notify.success(armed ? 'System armed' : 'System disarmed');
    } catch {
      notify.error('Failed to update arm state');
    }
  };

  return { status, loading, updatingSettings, fetchStatus, updateSettings, toggleArmed };
}
