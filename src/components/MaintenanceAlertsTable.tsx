import React, { useState } from 'react';
import {
  AlertCircle,
  AlertOctagon,
  AlertTriangle,
  Bell,
  Check,
  CheckCheck,
  Download,
  Filter,
  Search,
  Trash2,
  Wrench
} from 'lucide-react';
import { AlertSeverity, FaultCategory, MaintenanceAlert } from '../types/elevator';

interface MaintenanceAlertsTableProps {
  alerts: MaintenanceAlert[];
  onAcknowledgeAlert: (id: string) => void;
  onClearAlerts: () => void;
}

export const MaintenanceAlertsTable: React.FC<MaintenanceAlertsTableProps> = ({
  alerts,
  onAcknowledgeAlert,
  onClearAlerts,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSeverity = filterSeverity === 'ALL' || alert.severity.toUpperCase() === filterSeverity;
    const matchesSearch =
      alert.fault.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.subsystem.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.possibleCause.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.action.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  const getSeverityBadge = (severity: AlertSeverity) => {
    switch (severity) {
      case 'Critical':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-600/50">
            <AlertOctagon className="w-3 h-3 text-rose-400" />
            CRITICAL
          </span>
        );
      case 'Warning':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-600/50">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            WARNING
          </span>
        );
      case 'Low':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-600/50">
            <AlertCircle className="w-3 h-3 text-cyan-400" />
            LOW
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-950 text-emerald-300 border border-emerald-600/40">
            NOMINAL
          </span>
        );
    }
  };

  const handleExportCSV = () => {
    if (alerts.length === 0) return;
    const headers = ['ID', 'Timestamp', 'Fault', 'Subsystem', 'Severity', 'Confidence', 'Possible Cause', 'Action', 'Acknowledged'];
    const rows = alerts.map((a) => [
      a.id,
      a.timestamp,
      `"${a.fault}"`,
      a.subsystem,
      a.severity,
      `${Math.round(a.confidence * 100)}%`,
      `"${a.possibleCause.replace(/"/g, '""')}"`,
      `"${a.action.replace(/"/g, '""')}"`,
      a.acknowledged ? 'Yes' : 'No',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `elevator_maintenance_alerts_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-teal-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Smart Maintenance Alert Log & Work Orders
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            {alerts.length} total event tickets recorded • Predictive dispatch queue
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportCSV}
            disabled={alerts.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 hover:text-white transition disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onClearAlerts}
            disabled={alerts.length === 0}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-800 hover:bg-rose-950/40 hover:text-rose-300 text-xs text-slate-400 transition disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Log</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search fault, cause, or action..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
        </div>

        {/* Severity Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 w-full sm:w-auto">
          {['ALL', 'CRITICAL', 'WARNING'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1 rounded-md text-[11px] font-semibold transition ${
                filterSeverity === sev
                  ? 'bg-teal-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950/40">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-800/80 text-[11px] uppercase font-semibold text-slate-400 border-b border-slate-700">
            <tr>
              <th className="py-2.5 px-3">Timestamp</th>
              <th className="py-2.5 px-3">Fault Category</th>
              <th className="py-2.5 px-3">Subsystem</th>
              <th className="py-2.5 px-3">Severity</th>
              <th className="py-2.5 px-3">Confidence</th>
              <th className="py-2.5 px-3">Diagnosed Cause</th>
              <th className="py-2.5 px-3">Maintenance Action</th>
              <th className="py-2.5 px-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filteredAlerts.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500 italic">
                  No maintenance alerts match the current filter.
                </td>
              </tr>
            ) : (
              filteredAlerts.map((alert) => (
                <tr
                  key={alert.id}
                  className={`hover:bg-slate-800/40 transition ${
                    alert.acknowledged ? 'opacity-60 bg-slate-900/30' : ''
                  }`}
                >
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                    {alert.timestamp}
                  </td>
                  <td className="py-3 px-3 font-semibold text-white whitespace-nowrap">
                    {alert.fault}
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-teal-300 border border-slate-700 font-mono text-[11px]">
                      {alert.subsystem}
                    </span>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    {getSeverityBadge(alert.severity)}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-teal-400 whitespace-nowrap">
                    {Math.round(alert.confidence * 100)}%
                  </td>
                  <td className="py-3 px-3 max-w-xs text-slate-300 truncate" title={alert.possibleCause}>
                    {alert.possibleCause}
                  </td>
                  <td className="py-3 px-3 max-w-xs text-slate-200 truncate" title={alert.action}>
                    {alert.action}
                  </td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <button
                      onClick={() => onAcknowledgeAlert(alert.id)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
                        alert.acknowledged
                          ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                          : 'bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40'
                      }`}
                    >
                      {alert.acknowledged ? (
                        <>
                          <CheckCheck className="w-3 h-3 text-emerald-400" />
                          <span>Acknowledged</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Acknowledge</span>
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
