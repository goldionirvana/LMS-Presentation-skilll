import React from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  FileText, 
  UserCheck, 
  Users, 
  PieChart, 
  Bell, 
  ShieldAlert,
  User,
  LogOut,
  RefreshCw,
  HelpCircle
} from 'lucide-react';
import { UserRole, RMUser, AssessorUser, Participant } from '../types';

interface SidebarProps {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  selectedUserId: string;
  setSelectedUserId: (id: string) => void;
  rms: RMUser[];
  assessors: AssessorUser[];
  participants: Participant[];
  notificationsCount: number;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({
  currentRole,
  setCurrentRole,
  selectedUserId,
  setSelectedUserId,
  rms,
  assessors,
  participants,
  notificationsCount,
  activeTab,
  setActiveTab
}: SidebarProps) {

  // Navigation items based on current view/role capability
  const adminNav = [
    { id: 'dashboard', label: 'Main Dashboard', icon: LayoutDashboard },
    { id: 'participants', label: 'Peserta & Instruktur', icon: Users },
    { id: 'all-schedules', label: 'Monitoring Jadwal', icon: Calendar },
    { id: 'monitoring', label: 'Rekapitulasi Nilai', icon: PieChart },
  ];

  const rmNav = [
    { id: 'dashboard', label: 'RM Dashboard', icon: LayoutDashboard },
    { id: 'scheduling', label: 'Kelola Jadwal', icon: Calendar },
    { id: 'assessment', label: 'Koreksi & Penilaian', icon: UserCheck },
  ];

  const assessorNav = [
    { id: 'dashboard', label: 'Assessor Dashboard', icon: LayoutDashboard },
    { id: 'assessments', label: 'Sesi Penilaian', icon: UserCheck },
  ];

  const participantNav = [
    { id: 'dashboard', label: 'Peserta Dashboard', icon: LayoutDashboard },
    { id: 'evidence', label: 'Submit Evidence PPT', icon: FileText },
    { id: 'results', label: 'Lihat Hasil Nilai', icon: PieChart },
  ];

  const getNavigation = () => {
    switch (currentRole) {
      case 'ADMIN': return adminNav;
      case 'RM': return rmNav;
      case 'ASSESSOR': return assessorNav;
      case 'PESERTA': return participantNav;
    }
  };

  const currentNav = getNavigation();

  // Handlers for switching role
  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    if (role === 'ADMIN') {
      setSelectedUserId('');
      setActiveTab('dashboard');
    } else if (role === 'RM' && rms.length > 0) {
      setSelectedUserId(rms[0].id);
      setActiveTab('dashboard');
    } else if (role === 'ASSESSOR' && assessors.length > 0) {
      setSelectedUserId(assessors[0].id);
      setActiveTab('dashboard');
    } else if (role === 'PESERTA' && participants.length > 0) {
      setSelectedUserId(participants[1].id); // sitiaminah as default ready to assess or dimas
      setActiveTab('dashboard');
    }
  };

  return (
    <aside className="w-64 border-r border-[#e2e8f0] bg-white flex flex-col justify-between h-screen sticky top-0" id="lms-sidebar">
      <div>
        {/* Logo Section matching Gacoan Academy banner */}
        <div className="p-5 border-b border-[#f1f5f9] flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-blue-200">
            G
          </div>
          <div>
            <h1 className="font-display font-bold text-sm tracking-tight text-blue-900 leading-tight">
              Gacoan Academy
            </h1>
            <p className="text-[10px] text-slate-400 font-mono font-medium">
              Learning Management System
            </p>
          </div>
        </div>

        {/* Dynamic Role Indicator Card */}
        <div className="mx-4 mt-4 p-3 rounded-lg bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full inline-block ${
              currentRole === 'ADMIN' ? 'bg-blue-500' :
              currentRole === 'RM' ? 'bg-emerald-500' :
              currentRole === 'ASSESSOR' ? 'bg-amber-500' : 'bg-indigo-500'
            }`} />
            <span className="text-[11px] uppercase font-mono font-bold tracking-wider text-slate-500">
              Role: {currentRole}
            </span>
          </div>
          <div className="mt-1 font-sans text-xs text-slate-800 font-semibold truncate">
            {currentRole === 'ADMIN' && 'System Administrator'}
            {currentRole === 'RM' && (rms.find(r => r.id === selectedUserId)?.name || 'RM Selected')}
            {currentRole === 'ASSESSOR' && (assessors.find(a => a.id === selectedUserId)?.name || 'Assessor Selected')}
            {currentRole === 'PESERTA' && (participants.find(p => p.id === selectedUserId)?.name || 'Peserta Selected')}
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            {selectedUserId && `ID: ${selectedUserId}`}
          </div>
        </div>

        {/* Sidebar Menu items */}
        <nav className="mt-6 px-3 space-y-1">
          <div className="text-[10px] font-mono font-semibold text-slate-400 px-3 py-1 uppercase tracking-wider">
            Menu Utama
          </div>
          {currentNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs leading-5 font-medium transition-all text-left ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700 font-semibold border-l-4 border-blue-600' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 w-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}

          <button
            id="sidebar-tab-notifications"
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs leading-5 font-medium transition-all text-left ${
              activeTab === 'notifications' 
                ? 'bg-blue-50 text-blue-700 font-semibold border-l-4 border-blue-600' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4" />
              <span>Notifikasi</span>
            </div>
            {notificationsCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold animate-pulse">
                {notificationsCount}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Persistence / Simulator Selector on the bottom */}
      <div className="p-4 border-t border-[#f1f5f9] bg-slate-50/50">
        <div className="text-[10px] font-mono font-semibold text-slate-400 mb-2 uppercase tracking-wider flex items-center gap-1">
          <RefreshCw className="w-3 h-3 animate-spin text-slate-400" />
          Perspective Switcher
        </div>
        <div className="space-y-1.5">
          <div>
            <label className="text-[9px] font-semibold text-slate-500 uppercase">Pilih Stakeholder</label>
            <select
              id="stakeholder-role-select"
              value={currentRole}
              onChange={(e) => handleRoleChange(e.target.value as UserRole)}
              className="w-full text-[11px] bg-white border border-slate-200 rounded-md p-1 font-semibold text-slate-800"
            >
              <option value="ADMIN">1. Admin Academy</option>
              <option value="RM">2. Regional Manager (RM)</option>
              <option value="ASSESSOR">3. Assessor (Academy)</option>
              <option value="PESERTA">4. Peserta (Participant)</option>
            </select>
          </div>

          {currentRole === 'RM' && (
            <div>
              <label className="text-[9px] font-semibold text-slate-500 uppercase">Bertindak Sebagai</label>
              <select
                id="perspective-user-rm"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full text-[11px] bg-white border border-slate-200 rounded-md p-1 font-sans text-slate-800"
              >
                {rms.map(r => (
                  <option key={r.id} value={r.id}>{r.name} ({r.department.split(' ')[1] || 'RM'})</option>
                ))}
              </select>
            </div>
          )}

          {currentRole === 'ASSESSOR' && (
            <div>
              <label className="text-[9px] font-semibold text-slate-500 uppercase">Bertindak Sebagai</label>
              <select
                id="perspective-user-assessor"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full text-[11px] bg-white border border-slate-200 rounded-md p-1 font-sans text-slate-800"
              >
                {assessors.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
          )}

          {currentRole === 'PESERTA' && (
            <div>
              <label className="text-[9px] font-semibold text-slate-500 uppercase">Bertindak Sebagai</label>
              <select
                id="perspective-user-peserta"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full text-[11px] bg-white border border-slate-200 rounded-md p-1 font-sans text-slate-800 animate-pulse"
              >
                {participants.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.status})</option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div className="mt-3 text-[9px] text-slate-400 text-center leading-normal">
          Ubah opsi di atas untuk mensimulasikan alur feedback & penilaian LMS secara utuh!
        </div>
      </div>
    </aside>
  );
}
