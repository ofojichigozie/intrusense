import { useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useReadings } from '@/hooks/useReadings';
import { useSocket } from '@/hooks/useSocket';
import { formatTime } from '@/utils/formatters';
import { MotionBadge } from '@/components/ui/MotionBadge';
import { IntrusionBadge } from '@/components/ui/IntrusionBadge';
import { DeleteButton } from '@/components/ui/DeleteButton';
import type { Reading } from '@/types';

export default function ReadingsPage() {
  const [searchParams] = useSearchParams();
  const initialIntrusion = searchParams.get('intrusion') === 'true';

  const { data, loading, page, intrusionOnly, load, refresh, changePage, toggleFilter, remove } =
    useReadings(initialIntrusion);

  useEffect(() => {
    load(1, initialIntrusion);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load]);

  const handleReadingUpdate = useCallback(
    (_r: Reading) => {
      refresh();
    },
    [refresh],
  );

  useSocket({ onReadingUpdate: handleReadingUpdate });

  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Readings</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {data ? `${data.total} total` : 'Loading…'}
          </p>
        </div>
        <button
          onClick={toggleFilter}
          className={`self-start sm:self-auto flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
            intrusionOnly
              ? 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20'
              : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-slate-100'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${intrusionOnly ? 'bg-red-400' : 'bg-slate-500'}`}
          />
          {intrusionOnly ? 'Intrusions only' : 'All readings'}
        </button>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48 text-slate-500 text-sm">
            Loading…
          </div>
        ) : !data?.readings.length ? (
          <div className="flex items-center justify-center h-48 text-slate-500 text-sm">
            No readings found
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Device
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Motion
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Distance
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {data.readings.map((r) => (
                    <tr
                      key={r._id}
                      className={`transition-colors hover:bg-slate-800/40 ${
                        r.isIntrusion ? 'bg-red-500/5' : ''
                      }`}
                    >
                      <td className="px-5 py-3.5 text-slate-400 whitespace-nowrap">
                        {formatTime(r.createdAt)}
                      </td>
                      <td className="px-5 py-3.5 text-slate-300 font-mono text-xs">{r.deviceId}</td>
                      <td className="px-4 py-3.5">
                        <MotionBadge motionDetected={r.motionDetected} />
                      </td>
                      <td className="px-4 py-3.5 text-slate-300 tabular-nums">
                        {r.distanceCm.toFixed(1)} cm
                      </td>
                      <td className="px-4 py-3.5">
                        <IntrusionBadge isIntrusion={r.isIntrusion} />
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <DeleteButton onClick={() => remove(r._id)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => changePage(page - 1)}
            disabled={page <= 1}
            className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-sm disabled:opacity-40 hover:bg-slate-700 transition-colors"
          >
            ← Previous
          </button>
          <span className="text-sm text-slate-500">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => changePage(page + 1)}
            disabled={page >= totalPages}
            className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-sm disabled:opacity-40 hover:bg-slate-700 transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
