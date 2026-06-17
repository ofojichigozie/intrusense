import { useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { useSocket } from '@/hooks/useSocket';
import { formatTime, formatDistance } from '@/utils/formatters';
import { StatCard } from '@/components/ui/StatCard';
import type { Reading } from '@/types';

export default function DashboardPage() {
  const { status, loading, fetchStatus, toggleArmed } = useSettings();

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleReadingUpdate = useCallback(
    (_reading: Reading) => {
      fetchStatus();
    },
    [fetchStatus],
  );

  useSocket({ onReadingUpdate: handleReadingUpdate });

  const armed = status?.settings.armed;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">Live security overview</p>
      </div>

      {/* Arm status card */}
      <div
        className={`rounded-2xl border p-6 flex items-center justify-between gap-4 transition-colors ${
          armed ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-amber-500/5 border-amber-500/20'
        }`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`flex items-center justify-center w-12 h-12 rounded-xl ${
              armed ? 'bg-emerald-500/10' : 'bg-amber-500/10'
            }`}
          >
            <Shield
              size={24}
              fill="currentColor"
              strokeWidth={0}
              className={armed ? 'text-emerald-400' : 'text-amber-400'}
            />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              System Status
            </p>
            <p
              className={`text-2xl font-bold mt-0.5 ${
                armed ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {loading ? '\u2026' : armed ? 'Armed' : 'Disarmed'}
            </p>
          </div>
        </div>
        <button
          onClick={toggleArmed}
          disabled={loading}
          className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 ${
            armed
              ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30'
              : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30'
          }`}
        >
          {armed ? 'Disarm' : 'Arm'}
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Last Reading"
          value={status?.lastReading?.deviceId ?? '\u2014'}
          sub={formatTime(status?.lastReading?.createdAt)}
        />
        <StatCard
          label="Last Distance"
          value={status?.lastReading ? formatDistance(status.lastReading.distanceCm) : '\u2014'}
          sub={status?.lastReading?.motionDetected === 1 ? 'Motion detected' : 'No motion'}
        />
        <StatCard
          label="Last Intrusion"
          value={status?.lastIntrusion ? formatDistance(status.lastIntrusion.distanceCm) : 'None'}
          sub={formatTime(status?.lastIntrusion?.createdAt)}
        />
      </div>

      {/* Quick links */}
      <div className="flex flex-wrap gap-3">
        <Link
          to="/readings"
          className="px-4 py-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 text-sm font-medium transition-colors"
        >
          View all readings &rarr;
        </Link>
        <Link
          to="/readings?intrusion=true"
          className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 text-sm font-medium transition-colors"
        >
          View intrusions &rarr;
        </Link>
        <Link
          to="/settings"
          className="px-4 py-2 rounded-lg bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700 hover:text-slate-100 text-sm font-medium transition-colors"
        >
          Settings &rarr;
        </Link>
      </div>
    </div>
  );
}
