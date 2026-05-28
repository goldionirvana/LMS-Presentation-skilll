import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  FileText, 
  UserCheck, 
  AlertCircle, 
  CheckCircle, 
  BookOpen, 
  ExternalLink,
  ChevronRight,
  Sliders,
  Send
} from 'lucide-react';
import { Participant, RMUser } from '../types';

interface RMDashboardProps {
  activeRMId: string;
  participants: Participant[];
  rms: RMUser[];
  onSetSchedule: (pId: string, date: string, timeSlot: string) => void;
  onLaunchSplitScreen: (pId: string) => void;
  onSubmitInlineEvaluation: (pId: string, scores: { technical: number; communication: number; visual: number; professionalism: number }, notes: string) => void;
}

export default function RMDashboard({
  activeRMId,
  participants,
  rms,
  onSetSchedule,
  onLaunchSplitScreen,
  onSubmitInlineEvaluation
}: RMDashboardProps) {
  
  // Find current active RM active profile info
  const currentRM = rms.find(r => r.id === activeRMId) || rms[0];
  
  // Filters to participants assigned to this specific RM
  const myParticipants = participants.filter(p => p.assignedRMId === activeRMId);

  // Scheduling Form state
  const [schedulingPId, setSchedulingPId] = useState<string | null>(null);
  const [scheduleDate, setScheduleDate] = useState('2026-05-28');
  const [scheduleTimeSlot, setScheduleTimeSlot] = useState('09:00 - 10:30');

  // Inline grading form state template
  const [gradingPId, setGradingPId] = useState<string | null>(null);
  const [techVal, setTechVal] = useState(80);
  const [commVal, setCommVal] = useState(80);
  const [visVal, setVisVal] = useState(80);
  const [profVal, setProfVal] = useState(82);
  const [feedbackNotes, setFeedbackNotes] = useState('');

  const handleSetScheduleSubmit = (e: React.FormEvent, pId: string) => {
    e.preventDefault();
    onSetSchedule(pId, scheduleDate, scheduleTimeSlot);
    setSchedulingPId(null);
  };

  const startInlineGrading = (p: Participant) => {
    setGradingPId(p.id);
    const existing = p.evaluation?.rmScore;
    if (existing && (existing.technical > 0 || existing.communication > 0)) {
      setTechVal(existing.technical);
      setCommVal(existing.communication);
      setVisVal(existing.visual);
      setProfVal(existing.professionalism);
      setFeedbackNotes(p.evaluation?.rmNotes || '');
    } else {
      setTechVal(80);
      setCommVal(80);
      setVisVal(80);
      setProfVal(80);
      setFeedbackNotes('');
    }
  };

  const handleInlineGradingSubmit = (e: React.FormEvent, pId: string) => {
    e.preventDefault();
    onSubmitInlineEvaluation(pId, {
      technical: techVal,
      communication: commVal,
      visual: visVal,
      professionalism: profVal
    }, feedbackNotes);
    setGradingPId(null);
  };

  return (
    <div className="space-y-6 slide-up p-1">
      {/* Banner introduction with current RM details */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-500 rounded-xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <span className="bg-blue-400/30 text-blue-100 font-mono text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full inline-block">
            STAKEHOLDER PERSPECTIVE: REGIONAL MANAGER
          </span>
          <h2 className="text-xl font-display font-bold mt-2">Daftar Sesi Penilaian Anda</h2>
          <div className="mt-3 text-xs text-blue-100 flex flex-wrap gap-x-6 gap-y-1.5">
            <div><strong className="text-white">Nama RM:</strong> {currentRM?.name}</div>
            <div><strong className="text-white">Wilayah Operasional:</strong> {currentRM?.department}</div>
            <div><strong className="text-white">Total Penugasan:</strong> {myParticipants.length} Peserta</div>
          </div>
        </div>
        <div className="absolute right-0 bottom-0 translate-x-6 translate-y-6 w-32 h-32 bg-white/10 rounded-full" />
      </div>

      {/* Grid count list */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="form-card p-4 rounded-xl flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 rounded-lg text-amber-600 font-bold text-sm">
            {myParticipants.filter(p => p.status === 'PENDING_SCHEDULE').length}
          </div>
          <div>
            <div className="label-caps">1. Atur Jadwal</div>
            <div className="text-[11px] text-slate-500">Belum disetup waktu</div>
          </div>
        </div>
        <div className="form-card p-4 rounded-xl flex items-center gap-3">
          <div className="p-2.5 bg-orange-50 rounded-lg text-orange-600 font-bold text-sm">
            {myParticipants.filter(p => p.status === 'PENDING_EVIDENCE').length}
          </div>
          <div>
            <div className="label-caps">2. Menunggu PPT</div>
            <div className="text-[11px] text-slate-500">Belum submit evidence</div>
          </div>
        </div>
        <div className="form-card p-4 rounded-xl flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 rounded-lg text-blue-600 font-bold text-sm">
            {myParticipants.filter(p => p.status === 'READY_TO_ASSESS').length}
          </div>
          <div>
            <div className="label-caps">3. Siap Diuji</div>
            <div className="text-[11px] text-slate-500">PPT Ready & Sesi Terbuka</div>
          </div>
        </div>
        <div className="form-card p-4 rounded-xl flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 rounded-lg text-emerald-600 font-bold text-sm">
            {myParticipants.filter(p => p.status === 'COMPLETED').length}
          </div>
          <div>
            <div className="label-caps">4. Selesai Dinilai</div>
            <div className="text-[11px] text-slate-500">Nilai terhitung otomatis</div>
          </div>
        </div>
      </div>

      {/* Main tasks list */}
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden glow-card">
        <div className="p-4 bg-slate-50 border-b border-slate-100">
          <h3 className="text-xs font-bold uppercase text-slate-700 tracking-wider">
            Daftar Peserta dalam Tanggung Jawab Anda ({myParticipants.length} Orang)
          </h3>
        </div>

        <div className="divide-y divide-slate-100">
          {myParticipants.length === 0 ? (
            <div className="p-8 text-center text-slate-400 font-medium">
              Tidak ada peserta yang saat ini di-assign kepada Anda. Hubungi Admin Academy untuk pendaftaran.
            </div>
          ) : (
            myParticipants.map((p) => {
              const isScheduling = schedulingPId === p.id;
              const isGrading = gradingPId === p.id;
              
              const averageScore = p.evaluation?.finalAverage;
              const rmGraded = p.evaluation?.rmScore && p.evaluation.rmScore.technical > 0;

              return (
                <div key={p.id} className="p-5 transition hover:bg-slate-50/50">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Participant basics */}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-800">{p.name}</span>
                        <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                          {p.nik}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1 font-medium bg-slate-100/50 py-0.5 px-2 rounded inline-block">
                        {p.department}
                      </div>
                      
                      {/* Subtitle status info */}
                      <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-700">Asesor:</span> 
                          <span>{p.assignedAssessorName}</span>
                        </div>
                        {p.scheduleDate && (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-blue-500" />
                            <span className="font-semibold text-slate-700">{p.scheduleDate}</span>
                            <span className="text-slate-400">({p.scheduleTimeSlot})</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Progress Badge Indicator */}
                    <div className="flex items-center gap-3">
                      <div>
                        {p.status === 'PENDING_SCHEDULE' && (
                          <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-200 uppercase tracking-wider block text-center">
                            Belum Atur Jadwal
                          </span>
                        )}
                        {p.status === 'PENDING_EVIDENCE' && (
                          <span className="bg-orange-50 text-orange-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-orange-200 uppercase tracking-wider block text-center">
                            Menunggu PPT Upload
                          </span>
                        )}
                        {p.status === 'READY_TO_ASSESS' && (
                          <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-blue-200 uppercase tracking-wider block text-center animate-pulse">
                            Siap Uji Presentasi
                          </span>
                        )}
                        {p.status === 'COMPLETED' && (
                          <div className="text-right">
                            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-200 uppercase tracking-wider inline-block">
                              Selesai Dinilai
                            </span>
                            {averageScore && (
                              <div className="text-xs text-slate-500 mt-1">
                                Rata-rata akhir: <strong className="text-emerald-600 font-display font-semibold text-sm">{averageScore}</strong>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Action trigger button */}
                      <div className="flex items-center gap-1.5">
                        {p.status === 'PENDING_SCHEDULE' && !isScheduling && (
                          <button
                            id={`rm-btn-schedule-${p.id}`}
                            onClick={() => setSchedulingPId(p.id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-3.5 py-2 rounded-lg cursor-pointer transition flex items-center gap-1"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            Atur Jadwal LMS
                          </button>
                        )}

                        {p.status === 'READY_TO_ASSESS' && (
                          <div className="flex flex-wrap gap-1.5">
                            {/* Option 1: Live Interactive Split Screen (High-fidelity recommendation) */}
                            <button
                              id={`rm-btn-split-${p.id}`}
                              onClick={() => onLaunchSplitScreen(p.id)}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2 rounded-lg cursor-pointer transition flex items-center gap-1.5 shadow-md shadow-indigo-100"
                            >
                              <Sliders className="w-3.5 h-3.5" />
                              Mulai Ujian (Real-time Split-Screen)
                            </button>

                            {/* Option 2: Quick Score inline */}
                            {!isGrading && (
                              <button
                                id={`rm-btn-grade-${p.id}`}
                                onClick={() => startInlineGrading(p)}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-3.5 py-2 rounded-lg cursor-pointer transition"
                              >
                                {rmGraded ? 'Edit Nilai Cepat' : 'Nilai Cepat (Form)'}
                              </button>
                            )}
                          </div>
                        )}

                        {p.status === 'COMPLETED' && (
                          <button
                            onClick={() => onLaunchSplitScreen(p.id)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs px-3 py-2 rounded-lg transition text-left cursor-pointer flex items-center gap-1"
                          >
                            <FileText className="w-3.5 h-3.5 text-slate-500" />
                            View Evidence & Score breakdown
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Inline Form: Scheduling Box */}
                  {isScheduling && (
                    <form onSubmit={(e) => handleSetScheduleSubmit(e, p.id)} className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3 slide-up">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 mb-1">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span>Tentukan Tanggal & Slot Waktu Presentasi</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-semibold text-slate-500 uppercase">Pilih Tanggal Presentasi</label>
                          <input
                            type="date"
                            value={scheduleDate}
                            onChange={(e) => setScheduleDate(e.target.value)}
                            className="w-full text-xs p-2 border border-slate-200 rounded focus:ring-1 focus:ring-blue-500 bg-white"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-slate-500 uppercase">Pilih Slot Waktu</label>
                          <select
                            value={scheduleTimeSlot}
                            onChange={(e) => setScheduleTimeSlot(e.target.value)}
                            className="w-full text-xs p-2 border border-slate-200 rounded focus:ring-1 focus:ring-blue-500 bg-white"
                          >
                            <option value="09:00 - 10:30">09:00 - 10:30 WIB (Pagi)</option>
                            <option value="10:30 - 12:00">10:30 - 12:00 WIB (Pagi)</option>
                            <option value="13:00 - 14:30">13:00 - 14:30 WIB (Siang)</option>
                            <option value="14:30 - 16:00">14:30 - 16:00 WIB (Sore)</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setSchedulingPId(null)}
                          className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          id={`rm-btn-confirm-schedule-${p.id}`}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-1.5 rounded"
                        >
                          Konfirmasi & Hubungi Peserta
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Inline Form: Quick Assessment Grading Box */}
                  {isGrading && (
                    <form onSubmit={(e) => handleInlineGradingSubmit(e, p.id)} className="mt-4 p-5 bg-slate-50 border border-slate-200 rounded-lg space-y-4 slide-up">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <span className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1">
                          <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                          Form Penilaian RM ({rmGraded ? 'Mutakhirkan Nilai' : 'Simpan Nilai Baru'})
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">Ditetapkan Skala 1 - 100</span>
                      </div>

                      {/* Score sliders */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                            <span>A. Technical & Pemahaman Materi</span>
                            <span className="text-blue-600 font-bold">{techVal}</span>
                          </div>
                          <input
                            type="range" min="1" max="100" value={techVal}
                            onChange={(e) => setTechVal(Number(e.target.value))}
                            className="w-full accent-blue-600"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                            <span>B. Kemampuan Komunikasi</span>
                            <span className="text-blue-600 font-bold">{commVal}</span>
                          </div>
                          <input
                            type="range" min="1" max="100" value={commVal}
                            onChange={(e) => setCommVal(Number(e.target.value))}
                            className="w-full accent-blue-600"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                            <span>C. Visual & Penyampaian</span>
                            <span className="text-blue-600 font-bold">{visVal}</span>
                          </div>
                          <input
                            type="range" min="1" max="100" value={visVal}
                            onChange={(e) => setVisVal(Number(e.target.value))}
                            className="w-full accent-blue-600"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                            <span>D. Profesionalisme</span>
                            <span className="text-blue-600 font-bold">{profVal}</span>
                          </div>
                          <input
                            type="range" min="1" max="100" value={profVal}
                            onChange={(e) => setProfVal(Number(e.target.value))}
                            className="w-full accent-blue-600"
                          />
                        </div>
                      </div>

                      {/* Feedback notes */}
                      <div>
                        <label className="text-xs font-bold text-slate-600 block mb-1">Catatan Feedback Utama (RM)</label>
                        <textarea
                          rows={3}
                          placeholder="Masukkan komentar konstruktif terkait pemahaman operational store, komunikasi, dan visualisasi materi..."
                          value={feedbackNotes}
                          onChange={(e) => setFeedbackNotes(e.target.value)}
                          className="w-full text-xs p-2 border border-slate-200 rounded bg-white text-slate-800"
                          required
                        />
                      </div>

                      <div className="flex justify-between items-center pt-1">
                        <div className="text-[11px] text-slate-400 font-mono font-semibold">
                          Nilai rata-rata Anda: <span className="text-slate-700">{Math.round((techVal + commVal + visVal + profVal) / 4)}</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setGradingPId(null)}
                            className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-200 rounded"
                          >
                            Batal
                          </button>
                          <button
                            type="submit"
                            id={`rm-btn-submit-grading-${p.id}`}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-1.5 rounded flex items-center justify-center gap-1.5"
                          >
                            <Send className="w-3.5 h-3.5" />
                            Kirim Nilai Sekarang
                          </button>
                        </div>
                      </div>
                    </form>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
