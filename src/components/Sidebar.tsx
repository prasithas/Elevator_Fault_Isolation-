import React from 'react';
import {
  Activity,
  AlertOctagon,
  Bell,
  Cpu,
  FileSearch,
  Gauge,
  HelpCircle,
  Layers,
  Network,
  Radio,
  Server,
  ShieldAlert,
  Sliders,
  Workflow,
  Wrench
} from 'lucide-react';
import { AnalysisResult, FaultCategory } from '../types/elevator';

export type NavTab = 'overview' | 'isolation' | 'rca' | 'alerts' | 'simulator' | 'backend';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  activeAlertCount: number;
  currentFault: FaultCategory;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  activeAlertCount,
  currentFault,
  isOpenMobile,
  onCloseMobile,
}) => {
  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: number | string; badgeColor?: string }[] = [
    {
      id: 'overview',
      label: 'Dashboard Overview',
      icon: <Gauge className="w-4 h-4" />,
    },
    {
      id: 'isolation',
      label: 'Fault Isolation Schematic',
      icon: <Layers className="w-4 h-4" />,
      badge: currentFault !== 'Normal' ? 'Fault Active' : undefined,
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      id: 'rca',
      label: 'Root Cause Analysis',
      icon: <FileSearch className="w-4 h-4" />,
    },
    {
      id: 'alerts',
      label: 'Smart Maintenance Alerts',
      icon: <Bell className="w-4 h-4" />,
      badge: activeAlertCount > 0 ? activeAlertCount : undefined,
      badgeColor: 'bg-amber-500 text-slate-950 font-bold',
    },
    {
      id: 'simulator',
      label: 'Telemetry Simulator',
      icon: <Sliders className="w-4 h-4" />,
      badge: 'Live',
      badgeColor: 'bg-teal-500/20 text-teal-300 border border-teal-500/30',
    },
    {
      id: 'backend',
      label: 'Python / Colab API',
      icon: <Server className="w-4 h-4" />,
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/60 z-30 lg:hidden backdrop-blur-sm"
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-200 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand header in sidebar for mobile */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
              <Network className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider font-semibold text-teal-400">Elevator AI</div>
              <div className="text-sm font-semibold text-white">Diagnostics Portal</div>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-md"
          >
            ✕
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            System Modules
          </div>

          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-teal-500 text-slate-950 font-semibold shadow-sm shadow-teal-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={isActive ? 'text-slate-950' : 'text-teal-400'}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                      isActive ? 'bg-slate-900 text-white' : item.badgeColor || 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Subsystem Quick Health Widget */}
        <div className="p-3 mx-3 mb-3 bg-slate-800/50 rounded-xl border border-slate-700/60 text-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2 font-medium">
            <span>Subsystem Health</span>
            <span className="text-[10px] text-teal-400 font-semibold">4 Monitored</span>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Hoist Motor</span>
              <span className={`font-semibold ${currentFault === 'Motor fault' ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
                {currentFault === 'Motor fault' ? 'FAULT' : 'NOMINAL'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Bearing Assembly</span>
              <span className={`font-semibold ${currentFault === 'Bearing fault' ? 'text-amber-400 animate-pulse' : 'text-emerald-400'}`}>
                {currentFault === 'Bearing fault' ? 'FAULT' : 'NOMINAL'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Entrance Doors</span>
              <span className={`font-semibold ${currentFault === 'Door fault' ? 'text-amber-400 animate-pulse' : 'text-emerald-400'}`}>
                {currentFault === 'Door fault' ? 'FAULT' : 'NOMINAL'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Transducers & Sensors</span>
              <span className={`font-semibold ${currentFault === 'Sensor fault' ? 'text-cyan-400 animate-pulse' : 'text-emerald-400'}`}>
                {currentFault === 'Sensor fault' ? 'ANOMALY' : 'NOMINAL'}
              </span>
            </div>
          </div>
        </div>

        {/* Elevator Specs Footer */}
        <div className="p-3 border-t border-slate-800 text-[11px] text-slate-400 bg-slate-950/40">
          <div className="flex items-center justify-between">
            <span>Rated Load</span>
            <span className="font-semibold text-slate-200">800 kg (10 Pers.)</span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span>Machine Room</span>
            <span className="font-semibold text-slate-200">Penthouse LVL 14</span>
          </div>
        </div>
      </aside>
    </>
  );
};
