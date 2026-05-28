import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  FileText, 
  UserCheck, 
  Sliders, 
  Send,
  BookOpen,
  Eye,
  Award,
  AlertCircle
} from 'lucide-react';
import { Participant, AssessorUser } from '../types';

interface AssessorDashboardProps {
  activeAssessorId: string;
  participants: Participant[];
  assessors: AssessorUser[];
  onLaunchSplitScreen: (pId: string) => void;
  onSubmitInlineEvaluation: (pId: string, scores: { technical: number; communication: number; visual: number; professionalism: number }, notes: string) => void;
}

export default function AssessorDashboard({
  activeAssessorId,
  participants,
  assessors,
  onLaunchSplitScreen,
  onSubmitInlineEvaluation
}: AssessorDashboardProps) {

  // Current Assessor identity information
  const currentAssessor = assessors.find(a => a.id === activeAssessorId) || assessors[0];

  // Filters to participants assigned to this specific Assessor
  const myParticipants = participants.filter(p => p.assignedAssessorId === activeAssessorId);

  // Form states for quick inline assessment
  const [gradingPId, setGradingPId] = useState<string | null>(null);
  const [techVal, setTechVal] = useState(85);
  const [commVal, setCommVal] = useState(85);
  const [visVal, setVisVal] = useState(85);
  const [profVal, setProfVal] = useState(85);
  const [feedbackNotes, setFeedbackNotes] = useState('');

  const startInlineGrading = (p: Participant) => {
    setGradingPId(p.id);
    const existing = p.evaluation?.assessorScore;
    if (existing && (existing.technical > 0 || existing.communication > 0)) {
      setTechVal(existing.technical);
      setCommVal(existing.communication);
      setVisVal(existing.visual);
      setProfVal(existing.professionalism);
      setFeedbackNotes(p.evaluation?.assessorNotes || '');
    } else {
      setTechVal(85);
      setCommVal(85);
      setVisVal(85);
      setProfVal(85);
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
      {/* Visual top banner */}
      <div className="bg-gradient-to-r from-amber-600 to-amber-500 rounded-xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <span className="bg-amber-400/30 text-amber-100 font-mono text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full inline-block">
            STAKEHOLDER PERSPECTIVE: ACADEMY ASSESSOR
          </span>
          <h2 className="text-xl font-display font-bold mt-2">Panel Penilaian Akademis</h2>
          <div className="mt-3 text-xs text-amber-100 flex flex-wrap gap-x-6 gap-y-1.5">
            <div><strong className="text-white">Asesor Academy:</strong> {currentAssessor?.name}</div>
            <div><strong className="text-white">Divisi Pusat:</strong> {currentAssessor?.department}</div>
            <div><strong className="text-white">Target Sertifikasi:</strong> {myParticipants.length} Peserta</div>
          </div>
        </div>
        <div className="absolute right-0 bottom-0 translate-x-6 translate-y-6 w-32 h-32 bg-white/10 rounded-full" />
      </div>

      {/* Task count row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="form-card p-4 rounded-xl flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 rounded-lg text-amber-700 font-bold text-sm">
            {myParticipants.filter(p => p.status === 'PENDING_SCHEDULE' || p.status === 'PENDING_EVIDENCE').length}
          </div>
          <div>
            <div className="label-caps">Menunggu Persiapan</div>
            <div className="text-[11px] text-slate-500">Jadwal / PPT belum siap</div>
          </div>
        </div>

        <div className="form-card p-4 rounded-xl flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 rounded-lg text-blue-700 font-bold text-sm animate-pulse">
            {myParticipants.filter(p => p.status === 'READY_TO_ASSESS').length}
          </div>
          <div>
            <div className="label-caps text-blue-600">Siap Diuji</div>
            <div className="text-[11px] text-slate-500">Silakan buka split screen</div>
          </div>
        </div>

        <div className="form-card p-4 rounded-xl flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 rounded-lg text-emerald-700 font-bold text-sm">
            {myParticipants.filter(p => p.status === 'COMPLETED').length}
          </div>
          <div>
            <div className="label-caps">Evaluasi Selesai</div>
            <div className="text-[11px] text-slate-500">Nilai & catatan sukses dikirim</div>
          </div>
        </div>
      </div>

      {/* Checklist items */}
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden glow-card">
        <div className="p-4 bg-slate-50 border-b border-slate-100">
          <h3 className="text-xs font-bold uppercase text-slate-700 tracking-wider">
            Sesi Presentasi Kerja yang Ditugaskan ({myParticipants.length} Sesi)
          </h3>
        </div>

        <div className="divide-y divide-slate-100">
          {myParticipants.length === 0 ? (
            <div className="p-8 text-center text-slate-400 font-medium font-sans">
              Tidak ada sesi penugasan untuk Anda saat ini.
            </div>
          ) : (
            myParticipants.map((p) => {
              const isGrading = gradingPId === p.id;
              const averageScore = p.evaluation?.finalAverage;
              const asGraded = p.evaluation?.assessorScore && p.evaluation.assessorScore.technical > 0;

              return (
                <div key={p.id} className="p-5 hover:bg-slate-50/50 transition duration-150">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Participant detail */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-800 text-sm font-semibold">{p.name}</strong>
                        <span className="text-[10px] font-mono bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold">
                          {p.nik}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 font-medium">
                        {p.department}
                      </div>

                      <div className="pt-1 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-slate-700">RM Penguji:</span>
                          <span>{p.assignedRMName}</span>
                        </div>
                        {p.scheduleDate ? (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-blue-500" />
                            <span className="font-semibold text-slate-700">{p.scheduleDate} ({p.scheduleTimeSlot})</span>
                          </div>
                        ) : (
                          <span className="text-amber-600 font-mono text-[10px] bg-amber-50 px-2 py-0.5 rounded-full inline-block">
                            Menunggu Jadwal dari RM
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Status badges & interactive triggers */}
                    <div className="flex items-center gap-3">
                      <div>
                        {p.status === 'PENDING_SCHEDULE' && (
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-mono font-bold px-2 py-1 rounded border border-amber-200">
                            Menunggu Jadwal
                          </span>
                        )}
                        {p.status === 'PENDING_EVIDENCE' && (
                          <span className="bg-orange-100 text-orange-800 text-[10px] font-mono font-bold px-2 py-1 rounded border border-orange-200">
                            Menunggu PPT Peserta
                          </span>
                        )}
                        {p.status === 'READY_TO_ASSESS' && (
                          <span className="bg-blue-100 text-blue-800 text-[10px] font-mono font-bold px-2 py-1 rounded border border-blue-200 animate-pulse">
                            Siap Diuji
                          </span>
                        )}
                        {p.status === 'COMPLETED' && (
                          <div className="text-right">
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold px-2 py-1 rounded border border-emerald-200">
                              Penilaian Selesai
                            </span>
                            {averageScore && (
                              <div className="text-xs text-slate-500 mt-1 font-mono">
                                Final Rata-rata: <span className="text-emerald-600 font-semibold">{averageScore}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5">
                        {p.status === 'READY_TO_ASSESS' && (
                          <div className="flex flex-wrap gap-1.5">
                            {/* Option 1: Live Interactive Split Screen (High-fidelity recommendation) */}
                            <button
                              id={`assessor-btn-split-${p.id}`}
                              onClick={() => onLaunchSplitScreen(p.id)}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2 rounded-lg cursor-pointer transition flex items-center gap-1.5 shadow-md shadow-indigo-100"
                            >
                              <Sliders className="w-3.5 h-3.5" />
                              Mulai Ujian (Real-time Split-Screen)
                            </button>

                            {/* Option 2: Quick Score inline */}
                            {!isGrading && (
                              <button
                                id={`assessor-btn-grade-${p.id}`}
                                onClick={() => startInlineGrading(p)}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-3 py-2 rounded-lg cursor-pointer transition"
                              >
                                {asGraded ? 'Edit Nilai Cepat' : 'Nilai Cepat (Form)'}
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

                  {/* Inline grading Form */}
                  {isGrading && (
                    <form onSubmit={(e) => handleInlineGradingSubmit(e, p.id)} className="mt-4 p-5 bg-slate-50 border border-slate-200 rounded-lg space-y-4 slide-up">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <span className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1">
                          <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                          Form Penilaian Assessor Academy ({asGraded ? 'Mutakhirkan Nilai' : 'Simpan Nilai Baru'})
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
                        <label className="text-xs font-bold text-slate-600 block mb-1">Catatan Feedback Utama (Assessor)</label>
                        <textarea
                          rows={3}
                          placeholder="Masukkan komentar akademis terperinci mengenai penguasaan materi, visualisasi slide, tata bahasa, dan kredibilitas..."
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
                            id={`assessor-btn-submit-grading-${p.id}`}
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
