import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/client';
import {
  ShieldAlert,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  User,
  Globe,
  ArrowRight,
  Eye,
  RefreshCw,
  Sparkles
} from 'lucide-react';

export const AdminSOCEventsPage: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [notes, setNotes] = useState('');
  const [statusVal, setStatusVal] = useState('investigating');
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filters
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchEvents = async () => {
    try {
      const res = await adminApi.getSOCEvents({
        severity: severityFilter !== 'all' ? severityFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      setEvents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [severityFilter, statusFilter]);

  const handleOpenDetail = (evt: any) => {
    setSelectedEvent(evt);
    setNotes(evt.investigation_notes || '');
    setStatusVal(evt.status || 'investigating');
    setMessage(null);
  };

  const handleUpdateIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;
    setUpdating(true);
    setMessage(null);
    try {
      const res = await adminApi.updateSOCEvent(selectedEvent.id, {
        status: statusVal,
        investigation_notes: notes,
      });
      setMessage({ type: 'success', text: 'Incident investigation record updated successfully!' });
      setSelectedEvent(res.data);
      fetchEvents();
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Failed to update event.' });
    } finally {
      setUpdating(false);
    }
  };

  const filtered = events.filter((e) => {
    const term = searchTerm.toLowerCase();
    return (
      e.description.toLowerCase().includes(term) ||
      e.event_type.toLowerCase().includes(term) ||
      (e.user_username && e.user_username.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6 text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5 font-mono">
            <ShieldAlert className="w-7 h-7 text-rose-500" />
            Security Alert Feed & Incident Investigation
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Examine logged security incidents, review threat payload telemetry, and conduct authorized forensic triage.
          </p>
        </div>

        <button
          onClick={fetchEvents}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 self-start md:self-auto"
          title="Refresh Feed"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search alerts, user, or IP..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 font-mono"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase text-slate-400">Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 font-mono focus:outline-none"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase text-slate-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 font-mono focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
              <option value="false_positive">False Positive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Feed Table */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-rose-500"></div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <table className="min-w-full divide-y divide-slate-800 text-left font-mono">
            <thead className="bg-slate-950/80">
              <tr>
                <th className="px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Severity</th>
                <th className="px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Event Type</th>
                <th className="px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Description</th>
                <th className="px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Source / IP</th>
                <th className="px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-slate-900/60 text-xs">
              {filtered.map((evt) => {
                let badgeColor = 'bg-slate-800 text-slate-300 border-slate-700';
                if (evt.severity === 'critical') badgeColor = 'bg-rose-950/80 text-rose-300 border-rose-800';
                else if (evt.severity === 'high') badgeColor = 'bg-orange-950/80 text-orange-300 border-orange-800';
                else if (evt.severity === 'medium') badgeColor = 'bg-amber-950/80 text-amber-300 border-amber-800';
                else if (evt.severity === 'low') badgeColor = 'bg-blue-950/80 text-blue-300 border-blue-800';

                return (
                  <tr key={evt.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3 whitespace-nowrap">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${badgeColor}`}>
                        {evt.severity}
                      </span>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-slate-200 font-semibold">
                      {evt.event_type}
                    </td>
                    <td className="px-5 py-3 text-slate-300 max-w-xs truncate">
                      {evt.description}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-slate-400 text-[11px]">
                      {evt.ip_address || '127.0.0.1'} {evt.user_username && `(${evt.user_username})`}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <span className={`text-[10px] px-2 py-0.5 rounded ${
                        evt.status === 'resolved'
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                          : 'bg-rose-950/80 text-rose-400 border border-rose-800'
                      }`}>
                        {evt.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleOpenDetail(evt)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-xs inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3 text-rose-400" /> Triage
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Incident Investigation Drawer/Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 max-w-xl w-full rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800">
                  Incident #{selectedEvent.id}
                </span>
                <h3 className="text-base font-bold text-white mt-1">{selectedEvent.event_type}</h3>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            {message && (
              <div className={`p-3 rounded-lg text-xs ${
                message.type === 'success' ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800' : 'bg-rose-950/80 text-rose-300 border border-rose-800'
              }`}>
                {message.text}
              </div>
            )}

            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs">
              <p className="text-slate-300 leading-relaxed font-sans">{selectedEvent.description}</p>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                <div>Source IP: <span className="text-white">{selectedEvent.ip_address || '127.0.0.1'}</span></div>
                <div>HTTP Status: <span className="text-white">{selectedEvent.http_status || '403 Forbidden'}</span></div>
                <div>Associated User: <span className="text-white">{selectedEvent.user_username || 'Anonymous'}</span></div>
                <div>Recorded: <span className="text-white">{new Date(selectedEvent.created_at).toLocaleString()}</span></div>
              </div>
            </div>

            <form onSubmit={handleUpdateIncident} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Incident Triage Status</label>
                <select
                  value={statusVal}
                  onChange={(e) => setStatusVal(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="open">Open (Unresolved)</option>
                  <option value="investigating">Under Investigation</option>
                  <option value="resolved">Resolved (Remediated)</option>
                  <option value="false_positive">False Positive (Whitelisted)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Forensic Investigation Notes</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Record remediation actions taken, IP blocking, or student counseling..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedEvent(null)}
                  className="px-4 py-2 border border-slate-700 text-slate-300 rounded-lg text-xs hover:bg-slate-800"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                >
                  {updating ? 'Saving...' : 'Update Incident Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
