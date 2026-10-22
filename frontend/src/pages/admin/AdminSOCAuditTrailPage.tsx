import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/client';
import { History, Shield, User, Clock, RefreshCw } from 'lucide-react';

export const AdminSOCAuditTrailPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAudit = async () => {
    try {
      const res = await adminApi.getSOCAuditLogs();
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudit();
  }, []);

  return (
    <div className="space-y-6 text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5 font-mono">
            <History className="w-7 h-7 text-indigo-400" />
            Security Audit Trail & Resolution History
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Immutable log of all administrative actions, triage decisions, and security parameter updates.
          </p>
        </div>

        <button
          onClick={fetchAudit}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 self-start md:self-auto"
          title="Refresh Logs"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
        </div>
      ) : logs.length === 0 ? (
        <div className="p-8 bg-slate-900 border border-slate-800 rounded-xl text-center">
          <Clock className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-400">No administrative audit records logged yet.</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden font-mono text-xs">
          <div className="divide-y divide-slate-800">
            {logs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-slate-800/40 transition-colors flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-bold uppercase">
                      {log.action}
                    </span>
                    <span className="text-slate-400">
                      Operator: <strong className="text-white">{log.actor_username || 'System Daemon'}</strong>
                    </span>
                  </div>
                  <p className="text-slate-300 font-sans text-xs mt-1">
                    {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
                  </p>
                </div>

                <div className="text-right text-[11px] text-slate-500 whitespace-nowrap">
                  {new Date(log.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
