import React from 'react';
import { Bell, Clock, Compass, HelpCircle, LogOut, Sun } from 'lucide-react';
import { UserRole } from '../types';

interface HeaderProps {
  currentRole: UserRole;
  selectedUserId: string;
  rms: Array<{ id: string; name: string }>;
  assessors: Array<{ id: string; name: string }>;
  participants: Array<{ id: string; name: string; nik: string }>;
  notificationsCount: number;
  activeTab: string;
  onOpenNotifications: () => void;
}

export default function Header({
  currentRole,
  selectedUserId,
  rms,
  assessors,
  participants,
  notificationsCount,
  activeTab,
  onOpenNotifications
}: HeaderProps) {
  
  // Format current date
  const now = new Date("2026-05-26T08:35:21Z");
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  };
  const formattedDate = now.toLocaleDateString('id-ID', options);

  // Determine user display name
  const getUserDisplayNameAndStatus = () => {
    switch (currentRole) {
      case 'ADMIN':
        return { name: 'Academy Admin', roleLbl: 'Admin Academy', email: 'admin.academy@gacoan.co.id', initials: 'AA' };
      case 'RM':
        const rm = rms.find(r => r.id === selectedUserId);
        return { 
          name: rm ? rm.name : 'Regional Manager', 
          roleLbl: 'Regional Manager', 
          email: `${rm?.name.toLowerCase().replace(/\s+/g, '') || 'rm'}@gacoan.co.id`,
          initials: rm ? rm.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'RM'
        };
      case 'ASSESSOR':
        const as = assessors.find(a => a.id === selectedUserId);
        return { 
          name: as ? as.name : 'Academy Assessor', 
          roleLbl: 'Assessor (Academy)', 
          email: `${as?.name.toLowerCase().replace(/\s+/g, '') || 'assessor'}@gacoan.co.id`,
          initials: as ? as.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'AC'
        };
      case 'PESERTA':
        const p = participants.find(p => p.id === selectedUserId);
        return { 
          name: p ? p.name : 'Peserta', 
          roleLbl: `Peserta (NIK: ${p?.nik || ''})`, 
          email: `${p?.name.toLowerCase().replace(/\s+/g, '') || 'peserta'}@gacoan.co.id`,
          initials: p ? p.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'PS'
        };
    }
  };

  const userObj = getUserDisplayNameAndStatus();

  return (
    <header className="h-[73px] bg-white border-b border-slate-100 px-6 flex items-center justify-between z-10 sticky top-0" id="main-header">
      {/* Left side: Breadcrumb & Title */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium tracking-tight">
          <span>LMS Academy</span>
          <span className="text-slate-300">/</span>
          <span className="capitalize">{currentRole.toLowerCase()}</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-500 font-semibold capitalize font-mono text-[10px]">{activeTab.replace('-', ' ')}</span>
        </div>
        <div className="text-[13px] font-sans font-medium text-slate-700 mt-0.5 flex items-center gap-1.5">
          <span>Hi, <strong className="text-blue-900">{userObj.name}</strong>! Welcome to Gacoan Academy.</span>
        </div>
      </div>

      {/* Right side: DateTime, Notifications, User Widget */}
      <div className="flex items-center gap-4">
        {/* Dynamic datetime info */}
        <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-full py-1 px-3.5 text-xs text-slate-600 font-medium">
          <Clock className="w-3.5 h-3.5 text-blue-500" />
          <span className="font-mono text-[11px]">{formattedDate} (08:35 UTC)</span>
        </div>

        {/* Notifications Icon Button */}
        <button 
          onClick={onOpenNotifications}
          className="relative p-2 text-slate-500 hover:bg-slate-50 hover:text-blue-600 rounded-full transition-colors cursor-pointer"
          title="Buka Log Notifikasi"
          id="header-notification-btn"
        >
          <Bell className="w-4 h-4" />
          {notificationsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
          )}
        </button>

        {/* User Info Avatar block replicating layout */}
        <div className="flex items-center gap-2.5 border-l border-slate-100 pl-4">
          <div className="flex flex-col text-right">
            <span className="text-xs font-semibold text-slate-800 tracking-tight leading-none truncate max-w-[140px]">
              {userObj.name}
            </span>
            <span className="text-[10px] text-slate-400 font-mono mt-0.5 font-bold tracking-tight">
              {userObj.roleLbl}
            </span>
          </div>
          <div 
            className="w-9 h-9 rounded-full bg-slate-100 border-2 border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center font-display shadow-inner"
            title={userObj.email}
          >
            {userObj.initials}
          </div>
        </div>
      </div>
    </header>
  );
}
