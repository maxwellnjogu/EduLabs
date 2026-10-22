import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/client';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Terminal,
  Activity,
  Zap,
  Lock,
  ArrowRight,
  RefreshCw,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Search,
  Filter,
  Flame,
  Radio,
  FileText,
  UserCheck,
  UserX,
  Server
} from 'lucide-react';

export const AdminSOCDashboardPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'logins' | 'alerts' | 'api_activity' | 'resolved'>('overview');
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('index=edulabs_security sourcetype=*');
  const [loginFilter, setLoginFilter] = useState<'all' | 'success' | 'failed'>('all');
  const [timeRange, setTimeRange] = useState('Last 24 Hours');
  
  // Simulation Modal
  const [showSimModal, setShowSimModal] = useState(false);
  const [simType, setSimType] = useState('prompt_injection');
  const [simulating, setSimulating] = useState(false);
  const [simResult, setSimResult] = useState<any | null>(null);

  // Escalation / Triage Modal
  const [escalatingAlert, setEscalatingAlert] = useState<any | null>(null);
  const [escalationNotes, setEscalationNotes] = useState('');
  const [isEscalating, setIsEscalating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchDashboard = async () => {
    try {
      const res = await adminApi.getSOCDashboard();
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleSimulateAttack = async () => {
    setSimulating(true);
    setSimResult(null);
    try {
      const res = await adminApi.simulateAttack(simType);
      setSimResult(res.data);
      fetchDashboard();
    } catch (err: any) {
      console.error(err);
    } finally {
      setSimulating(false);
    }
  };

  const handleEscalateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!escalatingAlert) return;
    setIsEscalating(true);
    try {
      await adminApi.escalateSOCEvent(escalatingAlert.id, {
        escalation_notes: escalationNotes || 'Escalated to Tier-2 Incident Response Team by SOC Operator.',
        severity: 'critical',
      });
      setStatusMessage({
        type: 'success',
        text: `Alert #${escalatingAlert.id} has been escalated to Tier-2 Lead with Critical priority!`,
      });
      setEscalatingAlert(null);
      setEscalationNotes('');
      fetchDashboard();
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Failed to escalate alert.' });
    } finally {
      setIsEscalating(false);
    }
  };

  const handleResolveAlert = async (alertId: number) => {
    try {
      await adminApi.updateSOCEvent(alertId, {
        investigation_status: 'resolved',
        resolution_notes: 'Remediated & confirmed safe by SOC Administrator.',
      });
      setStatusMessage({ type: 'success', text: `Alert #${alertId} marked as Resolved.` });
      fetchDashboard();
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Failed to update alert.' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
          <span className="text-xs font-mono text-slate-400">Loading Splunk SOC Telemetry...</span>
        </div>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const alerts = data?.recent_alerts || [];
  const resolvedAlerts = data?.recent_resolved || [];
  const logins = data?.recent_logins || [];
  const apiLogs = data?.recent_api_activity || [];

  const filteredLogins = logins.filter((l: any) => {
    if (loginFilter === 'success') return l.status === 'success';
    if (loginFilter === 'failed') return l.status === 'failed';
    return true;
  });

  return (
    <div className="space-y-5 text-slate-100 font-sans">
      {/* Splunk-Style Top Command Header */}
      <div className="bg-[#111622] border border-slate-800 rounded-xl p-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono font-bold text-sm">
              &gt;_
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white tracking-wide font-mono">EduLabs SIEM & Mini SOC</h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> SPLUNK TELEMETRY
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                Real-Time Security Event Ingestion • Authentication Audit • Threat Escalation • API Traffic
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-[#0b0e14] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 font-mono focus:outline-none"
            >
              <option>Last 15 Minutes</option>
              <option>Last 1 Hour</option>
              <option>Last 24 Hours</option>
              <option>All Time</option>
            </select>

            <button
              onClick={() => {
                setShowSimModal(true);
                setSimResult(null);
              }}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 shadow-md shadow-rose-950 transition-all"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" /> Simulate Attack
            </button>

            <button
              onClick={fetchDashboard}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
              title="Refresh Logs"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Splunk Search Bar Emulation */}
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 bg-[#0b0e14] border border-slate-700/80 rounded-lg px-3 py-1.5 flex items-center gap-2 font-mono text-xs">
            <Search className="w-3.5 h-3.5 text-emerald-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent w-full text-slate-200 focus:outline-none placeholder-slate-500"
              placeholder="Search events: index=security host=edulabs sourcetype=auth"
            />
            <span className="text-[10px] text-slate-500 uppercase">SPL Filter</span>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div className={`p-3 rounded-lg text-xs font-mono flex items-center justify-between ${
          statusMessage.type === 'success' ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800' : 'bg-rose-950/80 text-rose-300 border border-rose-800'
        }`}>
          <span>{statusMessage.text}</span>
          <button onClick={() => setStatusMessage(null)} className="font-bold underline ml-4">✕</button>
        </div>
      )}

      {/* Splunk KPI Stat Panels */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 font-mono">
        <div className="bg-[#111622] border border-slate-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>ACTIVE ALERTS</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">{metrics.open_alerts || 0}</div>
          <span className="text-[10px] text-amber-400">Needs Investigation</span>
        </div>

        <div className="bg-[#111622] border border-rose-950/80 p-4 rounded-xl shadow-sm bg-gradient-to-b from-rose-950/20 to-transparent">
          <div className="flex items-center justify-between text-rose-300 text-xs">
            <span>ESCALATED</span>
            <Flame className="w-4 h-4 text-rose-400 animate-bounce" />
          </div>
          <div className="text-2xl font-bold text-rose-400 mt-2">{metrics.escalated_alerts || 0}</div>
          <span className="text-[10px] text-rose-400">Tier-2 Response Queue</span>
        </div>

        <div className="bg-[#111622] border border-slate-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>RESOLVED ALERTS</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-2">{metrics.resolved_alerts || 0}</div>
          <span className="text-[10px] text-emerald-400">Remediated & Closed</span>
        </div>

        <div className="bg-[#111622] border border-slate-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>LOGIN ATTEMPTS</span>
            <UserCheck className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            {metrics.total_logins || 0}
          </div>
          <span className="text-[10px] text-slate-400">
            <strong className="text-emerald-400">{metrics.successful_logins || 0} Pass</strong> • <strong className="text-rose-400">{metrics.failed_logins || 0} Fail</strong>
          </span>
        </div>

        <div className="bg-[#111622] border border-slate-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>API TRAFFIC</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400 mt-2">
            {metrics.total_api_calls || 0}
          </div>
          <span className="text-[10px] text-slate-400">
            {metrics.blocked_api_calls || 0} Blocked • {metrics.avg_api_latency_ms || 18}ms Latency
          </span>
        </div>
      </div>

      {/* Splunk Dashboard Navigation Tabs */}
      <div className="border-b border-slate-800 flex items-center gap-1 bg-[#111622] px-3 pt-2 rounded-t-xl overflow-x-auto font-mono text-xs">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-bold rounded-t-lg transition-colors flex items-center gap-2 border-b-2 ${
            activeTab === 'overview'
              ? 'bg-[#0b0e14] text-emerald-400 border-emerald-400'
              : 'text-slate-400 hover:text-white border-transparent'
          }`}
        >
          <Radio className="w-3.5 h-3.5" /> Dashboard Overview
        </button>

        <button
          onClick={() => setActiveTab('logins')}
          className={`px-4 py-2 font-bold rounded-t-lg transition-colors flex items-center gap-2 border-b-2 ${
            activeTab === 'logins'
              ? 'bg-[#0b0e14] text-emerald-400 border-emerald-400'
              : 'text-slate-400 hover:text-white border-transparent'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" /> Authentication Logs ({logins.length})
        </button>

        <button
          onClick={() => setActiveTab('alerts')}
          className={`px-4 py-2 font-bold rounded-t-lg transition-colors flex items-center gap-2 border-b-2 ${
            activeTab === 'alerts'
              ? 'bg-[#0b0e14] text-emerald-400 border-emerald-400'
              : 'text-slate-400 hover:text-white border-transparent'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" /> Active & Escalated Alerts ({alerts.length})
        </button>

        <button
          onClick={() => setActiveTab('resolved')}
          className={`px-4 py-2 font-bold rounded-t-lg transition-colors flex items-center gap-2 border-b-2 ${
            activeTab === 'resolved'
              ? 'bg-[#0b0e14] text-emerald-400 border-emerald-400'
              : 'text-slate-400 hover:text-white border-transparent'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Resolved Alerts ({resolvedAlerts.length})
        </button>

        <button
          onClick={() => setActiveTab('api_activity')}
          className={`px-4 py-2 font-bold rounded-t-lg transition-colors flex items-center gap-2 border-b-2 ${
            activeTab === 'api_activity'
              ? 'bg-[#0b0e14] text-emerald-400 border-emerald-400'
              : 'text-slate-400 hover:text-white border-transparent'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-cyan-400" /> API Activity Stream ({apiLogs.length})
        </button>
      </div>

      {/* Tab Panels */}
      <div className="bg-[#0b0e14] border border-slate-800 rounded-b-xl p-5 shadow-xl">
        {/* OVERVIEW PANEL */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Recent Active Alerts with Escalate Action */}
              <div className="bg-[#111622] border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                  <span className="text-xs font-mono font-bold text-white uppercase flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" /> High-Priority Security Incidents
                  </span>
                  <button
                    onClick={() => setActiveTab('alerts')}
                    className="text-[11px] font-mono text-emerald-400 hover:underline"
                  >
                    View All &rarr;
                  </button>
                </div>

                <div className="space-y-2.5">
                  {alerts.slice(0, 5).map((ev: any) => (
                    <div
                      key={ev.id}
                      className="p-3 bg-[#0b0e14] border border-slate-800/80 rounded-lg flex items-start justify-between gap-3 text-xs font-mono"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            ev.severity === 'critical' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                            ev.severity === 'high' ? 'bg-orange-950 text-orange-300 border border-orange-800' :
                            'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}>
                            {ev.severity}
                          </span>
                          <span className="font-bold text-white">{ev.event_type}</span>
                          {ev.investigation_status === 'escalated' && (
                            <span className="px-1.5 py-0.2 rounded bg-rose-900 text-rose-200 border border-rose-700 text-[10px] font-bold animate-pulse">
                              ESCALATED
                            </span>
                          )}
                        </div>
                        <p className="text-slate-300 text-[11px] leading-relaxed line-clamp-2">{ev.description}</p>
                        <div className="text-[10px] text-slate-500">
                          IP: {ev.source_ip || '127.0.0.1'} • User: {ev.username_attempted || 'N/A'} • {new Date(ev.timestamp).toLocaleTimeString()}
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5 shrink-0">
                        {ev.investigation_status !== 'escalated' && (
                          <button
                            onClick={() => {
                              setEscalatingAlert(ev);
                              setEscalationNotes('');
                            }}
                            className="px-2 py-1 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded text-[10px] font-bold transition-colors flex items-center gap-1"
                          >
                            <Flame className="w-3 h-3 text-rose-400" /> Escalate
                          </button>
                        )}
                        <button
                          onClick={() => handleResolveAlert(ev.id)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded text-[10px] transition-colors"
                        >
                          Resolve
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Login Audit Stream */}
              <div className="bg-[#111622] border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                  <span className="text-xs font-mono font-bold text-white uppercase flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-indigo-400" /> Real-Time Authentication Audit
                  </span>
                  <button
                    onClick={() => setActiveTab('logins')}
                    className="text-[11px] font-mono text-emerald-400 hover:underline"
                  >
                    View All &rarr;
                  </button>
                </div>

                <div className="space-y-2">
                  {logins.slice(0, 6).map((log: any) => (
                    <div
                      key={log.id}
                      className="p-2.5 bg-[#0b0e14] border border-slate-800 rounded-lg flex items-center justify-between text-xs font-mono"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          log.status === 'success'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-rose-950 text-rose-400 border border-rose-800'
                        }`}>
                          {log.status === 'success' ? 'PASS' : 'FAIL'}
                        </span>
                        <div>
                          <span className="font-bold text-slate-200">{log.username}</span>
                          <span className="text-slate-500 text-[10px] ml-1.5">({log.role || 'user'})</span>
                        </div>
                      </div>

                      <div className="text-right text-[11px] text-slate-400">
                        <div>{log.ip_address}</div>
                        {log.failure_reason && (
                          <div className="text-[10px] text-rose-400 truncate max-w-[160px]">{log.failure_reason}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* API Traffic Panel */}
            <div className="bg-[#111622] border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <span className="text-xs font-mono font-bold text-white uppercase flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" /> Live Endpoint Traffic Telemetry
                </span>
                <button
                  onClick={() => setActiveTab('api_activity')}
                  className="text-[11px] font-mono text-cyan-400 hover:underline"
                >
                  Inspect Full Stream &rarr;
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {apiLogs.slice(0, 6).map((apiLog: any) => (
                  <div
                    key={apiLog.id}
                    className="p-2.5 bg-[#0b0e14] border border-slate-800 rounded-lg text-xs font-mono space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-bold text-[10px]">
                        {apiLog.method}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        apiLog.status_code >= 400 ? 'bg-rose-950 text-rose-400' : 'bg-emerald-950 text-emerald-400'
                      }`}>
                        HTTP {apiLog.status_code}
                      </span>
                    </div>
                    <div className="text-slate-300 text-[11px] truncate">{apiLog.endpoint}</div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/80">
                      <span>{apiLog.username || 'Anonymous'}</span>
                      <span>{apiLog.response_time_ms}ms</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* LOGINS PANEL */}
        {activeTab === 'logins' && (
          <div className="space-y-4 font-mono">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Filter Status:</span>
                {(['all', 'success', 'failed'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setLoginFilter(st)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-colors ${
                      loginFilter === st
                        ? 'bg-emerald-500 text-black'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <div className="text-xs text-slate-400">
                Displaying {filteredLogins.length} Authentication Records
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-800 text-left text-xs">
                <thead className="bg-[#111622] text-slate-400">
                  <tr>
                    <th className="px-4 py-2.5">TIMESTAMP</th>
                    <th className="px-4 py-2.5">STATUS</th>
                    <th className="px-4 py-2.5">USERNAME / ID</th>
                    <th className="px-4 py-2.5">ROLE</th>
                    <th className="px-4 py-2.5">SOURCE IP</th>
                    <th className="px-4 py-2.5">DETAILS / REASON</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredLogins.map((log: any) => (
                    <tr key={log.id} className="hover:bg-slate-900/50">
                      <td className="px-4 py-2.5 text-slate-500 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.status === 'success'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-rose-950 text-rose-400 border border-rose-800'
                        }`}>
                          {log.status === 'success' ? 'SUCCESS (200)' : 'FAILED (401)'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 font-bold text-white whitespace-nowrap">
                        {log.username}
                      </td>
                      <td className="px-4 py-2.5 text-slate-300 capitalize whitespace-nowrap">
                        {log.role || 'student'}
                      </td>
                      <td className="px-4 py-2.5 text-slate-400 whitespace-nowrap">
                        {log.ip_address}
                      </td>
                      <td className="px-4 py-2.5 text-slate-400">
                        {log.failure_reason || 'Verified institutional credentials'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ALERTS & ESCALATION PANEL */}
        {activeTab === 'alerts' && (
          <div className="space-y-4 font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
              <span className="text-slate-400">Active Alert Ingestion Queue</span>
              <span className="text-emerald-400 font-bold">Auto-Triage Enabled</span>
            </div>

            <div className="space-y-3">
              {alerts.map((ev: any) => (
                <div
                  key={ev.id}
                  className={`p-4 rounded-xl border transition-all ${
                    ev.investigation_status === 'escalated'
                      ? 'bg-rose-950/20 border-rose-800'
                      : 'bg-[#111622] border-slate-800'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-slate-800/80">
                    <div className="flex items-center gap-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        ev.severity === 'critical' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                        ev.severity === 'high' ? 'bg-orange-950 text-orange-300 border border-orange-800' :
                        'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}>
                        {ev.severity}
                      </span>
                      <span className="text-sm font-bold text-white font-mono">{ev.event_type}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        ev.investigation_status === 'escalated'
                          ? 'bg-rose-900 text-rose-200 border border-rose-700 animate-pulse'
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        Status: {ev.investigation_status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {ev.investigation_status !== 'escalated' && (
                        <button
                          onClick={() => {
                            setEscalatingAlert(ev);
                            setEscalationNotes('');
                          }}
                          className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                        >
                          <Flame className="w-3.5 h-3.5" /> Escalate Alert
                        </button>
                      )}
                      <button
                        onClick={() => handleResolveAlert(ev.id)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Mark Resolved
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 mt-2 font-sans leading-relaxed">{ev.description}</p>

                  {ev.escalation_notes && (
                    <div className="mt-2.5 p-2 bg-rose-950/40 border border-rose-900/60 rounded text-[11px] text-rose-300">
                      <strong>Escalation Incident Log:</strong> {ev.escalation_notes}
                    </div>
                  )}

                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[10px] text-slate-500 gap-2">
                    <span>Source IP: <strong className="text-slate-400">{ev.source_ip || '127.0.0.1'}</strong></span>
                    <span>Target Endpoint: <strong className="text-slate-400">{ev.endpoint}</strong></span>
                    <span>Identity: <strong className="text-slate-400">{ev.username_attempted || 'N/A'}</strong></span>
                    <span>Ingested: {new Date(ev.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RESOLVED ALERTS PANEL */}
        {activeTab === 'resolved' && (
          <div className="space-y-4 font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
              <span className="text-slate-400">Archived & Remediated Threat Incidents</span>
              <span className="text-emerald-400 font-bold">{resolvedAlerts.length} Closed Cases</span>
            </div>

            {resolvedAlerts.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4">No resolved alerts logged yet.</p>
            ) : (
              <div className="space-y-3">
                {resolvedAlerts.map((ev: any) => (
                  <div key={ev.id} className="p-4 bg-[#111622] border border-slate-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                          RESOLVED
                        </span>
                        <span className="text-xs font-bold text-white">{ev.event_type}</span>
                      </div>
                      <span className="text-[11px] text-slate-500">Closed: {new Date(ev.resolved_at || ev.timestamp).toLocaleTimeString()}</span>
                    </div>

                    <p className="text-xs text-slate-300 font-sans">{ev.description}</p>
                    
                    <div className="p-2 bg-[#0b0e14] border border-slate-800 rounded text-[11px] text-emerald-300">
                      <strong>Remediation Notes:</strong> {ev.resolution_notes || 'Confirmed benign after operator triage.'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* API ACTIVITY STREAM PANEL */}
        {activeTab === 'api_activity' && (
          <div className="space-y-4 font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
              <span className="text-slate-400">Live HTTP Traffic & Gateway Telemetry</span>
              <span className="text-cyan-400 font-bold">Latency Average: {metrics.avg_api_latency_ms || 18}ms</span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-800 text-left text-xs">
                <thead className="bg-[#111622] text-slate-400">
                  <tr>
                    <th className="px-4 py-2.5">TIMESTAMP</th>
                    <th className="px-4 py-2.5">METHOD</th>
                    <th className="px-4 py-2.5">ENDPOINT</th>
                    <th className="px-4 py-2.5">HTTP STATUS</th>
                    <th className="px-4 py-2.5">CLIENT IP</th>
                    <th className="px-4 py-2.5">LATENCY</th>
                    <th className="px-4 py-2.5">ACTION TAKEN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {apiLogs.map((log: any) => (
                    <tr key={log.id} className="hover:bg-slate-900/50">
                      <td className="px-4 py-2.5 text-slate-500 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap font-bold text-white">
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          {log.method}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-slate-200">
                        {log.endpoint}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.status_code >= 400
                            ? 'bg-rose-950 text-rose-400 border border-rose-800'
                            : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        }`}>
                          {log.status_code}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-slate-400 whitespace-nowrap">
                        {log.ip_address}
                      </td>
                      <td className="px-4 py-2.5 text-cyan-400 whitespace-nowrap">
                        {log.response_time_ms}ms
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        {log.is_blocked ? (
                          <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 font-bold border border-rose-700 text-[10px]">
                            BLOCKED BY SOC
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">ALLOWED</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Escalation Action Modal */}
      {escalatingAlert && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111622] border border-rose-800 max-w-lg w-full rounded-2xl p-6 shadow-2xl space-y-4 font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-rose-500" />
                <h3 className="text-base font-bold text-white">Escalate Security Alert #{escalatingAlert.id}</h3>
              </div>
              <button
                onClick={() => setEscalatingAlert(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-[#0b0e14] border border-slate-800 rounded-lg text-xs space-y-1">
              <div className="font-bold text-white">{escalatingAlert.event_type}</div>
              <p className="text-slate-400">{escalatingAlert.description}</p>
            </div>

            <form onSubmit={handleEscalateAlert} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Escalation Target
                </label>
                <input
                  type="text"
                  disabled
                  defaultValue="Tier-2 Computer Incident Response Team (CIRT)"
                  className="w-full bg-[#0b0e14] border border-slate-700 rounded-lg px-3 py-2 text-xs text-rose-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Analyst Escalation Justification / Notes *
                </label>
                <textarea
                  rows={3}
                  required
                  value={escalationNotes}
                  onChange={(e) => setEscalationNotes(e.target.value)}
                  placeholder="State reason for escalation (e.g. repeated exploitation attempt from known malicious subnet, potential lateral movement)..."
                  className="w-full bg-[#0b0e14] border border-slate-700 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEscalatingAlert(null)}
                  className="px-4 py-2 border border-slate-700 text-slate-300 rounded-lg text-xs hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEscalating}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-rose-950 transition-all disabled:opacity-50"
                >
                  {isEscalating ? 'Escalating...' : 'Confirm Escalation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Attack Simulation Modal */}
      {showSimModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111622] border border-slate-700 max-w-lg w-full rounded-2xl p-6 shadow-2xl space-y-4 font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-rose-500" />
                <h3 className="text-base font-bold text-white">Trigger Cyber Attack Simulation</h3>
              </div>
              <button
                onClick={() => setShowSimModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Select an attack payload. This will execute real backend defense routines and generate telemetry across Alerts, Login Logs, and API Activity panels.
            </p>

            <div className="space-y-2">
              {[
                {
                  id: 'prompt_injection',
                  title: 'AI Tutor Prompt Injection',
                  desc: 'Attempts jailbreak to extract system keys and answer keys.',
                },
                {
                  id: 'unauthorized_idor',
                  title: 'IDOR Student Attempt Tampering',
                  desc: 'Attempts unauthorized direct object reference access to peer records.',
                },
                {
                  id: 'brute_force_login',
                  title: 'Brute-Force Credential Stuffing',
                  desc: 'Generates burst of failed authentications against administrative portal.',
                },
                {
                  id: 'malicious_upload',
                  title: 'Disguised Executable Upload',
                  desc: 'Uploads shell script bytes disguised with .pdf file extension.',
                },
              ].map((atk) => (
                <label
                  key={atk.id}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    simType === atk.id
                      ? 'bg-rose-950/40 border-rose-500 text-white'
                      : 'bg-[#0b0e14] border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="sim_type"
                    checked={simType === atk.id}
                    onChange={() => setSimType(atk.id)}
                    className="mt-1 text-rose-600 focus:ring-rose-500"
                  />
                  <div>
                    <p className="text-xs font-bold">{atk.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{atk.desc}</p>
                  </div>
                </label>
              ))}
            </div>

            {simResult && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-800 rounded-xl text-xs space-y-1">
                <p className="font-bold text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Defense Verified & Logged!
                </p>
                <p className="text-emerald-200">{simResult.message}</p>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowSimModal(false)}
                className="px-4 py-2 border border-slate-700 text-slate-300 rounded-lg text-xs hover:bg-slate-800"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleSimulateAttack}
                disabled={simulating}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold shadow-lg transition-all disabled:opacity-50"
              >
                {simulating ? 'Executing...' : 'Execute Simulation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
