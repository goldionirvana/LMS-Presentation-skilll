import React from 'react';
import { Bell, Info, AlertTriangle, CheckCircle, RefreshCw, Trash, Calendar } from 'lucide-react';
import { NotificationLog } from '../types';

interface NotificationCenterProps {
  notifications: NotificationLog[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
  onTriggerMockReminder: () => void;
}

export default function NotificationCenter({
  notifications,
  onMarkAsRead,
  onClearAll,
  onTriggerMockReminder
}: NotificationCenterProps) {
  
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-6 space-y-6 glow-card slide-up">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            Pusat Notifikasi & Pengingat Otomatis
          </h2>
          <p className="text-xs text-slate-500 mt-1">Sistem LMS mengirimkan notifikasi instan secara otomatis untuk kelancaran progress sertifikasi.</p>
        </div>

        {/* Action simulators */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-simulate-reminder"
            onClick={onTriggerMockReminder}
            className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold cursor-pointer transition flex items-center gap-1.5 border border-indigo-200"
            title="Kirim pengingat rapat 1 hari sebelum presentasi secara otomatis"
          >
            <Calendar className="w-3.5 h-3.5" />
            Simulasi Reminder (H-1 Meeting)
          </button>
          
          <button
            onClick={onClearAll}
            disabled={notifications.length === 0}
            className={`p-2 bg-slate-100 hover:bg-slate-200 text-slate-750 font-semibold rounded-lg text-xs cursor-pointer transition ${
              notifications.length === 0 ? 'opacity-40 cursor-not-allowed' : ''
            }`}
          >
            Bersihkan Log
          </button>
        </div>
      </div>

      {/* Notifications list */}
      <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
        {notifications.length === 0 ? (
          <div className="text-center p-8 text-slate-400 font-medium">
            Tidak ada notifikasi baru saat ini. Anda dapat mengklik tombol "Simulasi Reminder (H-1 Meeting)" di atas untuk mematangkan uji coba notifikasi.
          </div>
        ) : (
          notifications.map((notif) => {
            return (
              <div 
                key={notif.id} 
                className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                  notif.isRead 
                    ? 'bg-slate-50/70 border-slate-100 opacity-75' 
                    : 'bg-blue-50/40 border-blue-100/60 shadow-sm'
                }`}
              >
                {/* Visual Icon indicator */}
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {notif.type === 'SUCCESS' && (
                      <div className="p-1.5 bg-emerald-100 text-emerald-800 rounded-full">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                    )}
                    {notif.type === 'WARNING' && (
                      <div className="p-1.5 bg-amber-100 text-amber-800 rounded-full">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                    )}
                    {notif.type === 'INFO' && (
                      <div className="p-1.5 bg-blue-100 text-blue-800 rounded-full">
                        <Info className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-700 text-xs">{notif.title}</span>
                      <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 bg-slate-200/60 rounded text-slate-500">
                        {notif.role}: {notif.userName}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-normal">{notif.message}</p>
                    <span className="text-[10px] text-slate-400 font-mono mt-2 block">
                      {new Date(notif.timestamp).toLocaleTimeString('id-ID')} - {new Date(notif.timestamp).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                </div>

                {/* Individual action trigger */}
                {!notif.isRead && (
                  <button
                    onClick={() => onMarkAsRead(notif.id)}
                    className="p-1 text-[10px] font-mono font-bold text-blue-600 hover:text-blue-800 hover:bg-blue-15 px-2 rounded border border-blue-200 hover:border-blue-300 transition shrink-0 cursor-pointer"
                  >
                    Mark read
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Instructional context */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 text-xs text-slate-500 space-y-1.5 leading-normal">
        <p className="font-bold text-slate-700">📌 Fitur Otomasi Notifikasi:</p>
        <p>1. <strong>RM Notice</strong>: Dikirim instan ke RM terpilih saat Admin mendaftarkan peserta baru.</p>
        <p>2. <strong>Peserta Notice</strong>: Dikirim langsung ke peserta sesaat setelah RM menetapkan slot jadwal kosong.</p>
        <p>3. <strong>H-1 Reminder (Meeting Room)</strong>: Simulasi pengingat email panelis mengenai persiapan materi presentasi sebelum sesi live di hari selanjutnya.</p>
      </div>
    </div>
  );
}
