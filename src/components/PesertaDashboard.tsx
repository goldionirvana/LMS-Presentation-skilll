import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Upload, 
  FileText, 
  Lock, 
  Unlock, 
  CheckCircle, 
  Award, 
  BrainCircuit, 
  User, 
  ChevronRight,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { Participant } from '../types';

interface PesertaDashboardProps {
  activePesertaId: string;
  participants: Participant[];
  onUploadEvidence: (pId: string, fileName: string, fileSize: string) => void;
}

export default function PesertaDashboard({
  activePesertaId,
  participants,
  onUploadEvidence
}: PesertaDashboardProps) {

  const sysTime = new Date("2026-05-26T08:35:21Z");

  // Get active participant info
  const p = participants.find(part => part.id === activePesertaId);

  // Drag and Drop simulation states
  const [dragActive, setDragActive] = useState(false);
  const [manualFileName, setManualFileName] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!p) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-red-100">
        <p className="text-red-500 font-medium">Sesi login peserta tidak terdeteksi. Silakan pilih peserta di bagian kiri bawah switcher.</p>
      </div>
    );
  }

  // Determine if evidence modification is locked.
  // Rule: Locked if schedule date is in the past, or if we have already completed.
  // Let's compare schedule date string:
  let isLOCKED = false;
  let lockReason = "";

  if (p.status === 'COMPLETED') {
    isLOCKED = true;
    lockReason = "Proses Penyesuaian Nilai Selesai. Dokumen terkunci permanen.";
  } else if (p.scheduleDate) {
    const sDate = new Date(p.scheduleDate);
    // Compares dates (ignoring time for safety or based on strict day)
    const normalizedToday = new Date(sysTime.getFullYear(), sysTime.getMonth(), sysTime.getDate());
    const normalizedSchedule = new Date(sDate.getFullYear(), sDate.getMonth(), sDate.getDate());
    
    if (normalizedSchedule < normalizedToday) {
      isLOCKED = true;
      lockReason = "Jadwal presentasi telah lewat. Unggahan dokumen terkunci otomatis.";
    }
  }

  // Handle Drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle Drag submit
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (isLOCKED) {
      alert("Unggahan dibatalkan: Status data terkunci.");
      return;
    }

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.pptx') || file.name.endsWith('.ppt') || file.name.endsWith('.pdf')) {
        const sizeMb = (file.size / (1024 * 1024)).toFixed(1) + " MB";
        onUploadEvidence(p.id, file.name, sizeMb);
        setSuccessMsg(`Berhasil mengunggah ${file.name}!`);
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        alert("Hanya mendukung file presentasi PowerPoint (.pptx) atau Adobe PDF (.pdf)!");
      }
    }
  };

  // Handle manual mock text submit
  const handleManualUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLOCKED) return;
    if (!manualFileName.trim()) return;

    // Append extension if missed
    let finalName = manualFileName;
    if (!finalName.endsWith('.pptx') && !finalName.endsWith('.pdf')) {
      finalName += ".pptx";
    }

    onUploadEvidence(p.id, finalName, '4.2 MB');
    setManualFileName('');
    setSuccessMsg(`Berhasil mendaftarkan file ${finalName}!`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const rmGraded = p.evaluation?.rmScore && p.evaluation.rmScore.technical > 0;
  const assessorGraded = p.evaluation?.assessorScore && p.evaluation.assessorScore.technical > 0;

  return (
    <div className="space-y-6 slide-up p-1">
      {/* Banner info */}
      <div className="bg-gradient-to-r from-indigo-700 to-indigo-500 rounded-xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <span className="bg-indigo-400/30 text-indigo-100 font-mono text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full inline-block">
            STAKEHOLDER PERSPECTIVE: PESERTA SERTIFIKASI
          </span>
          <h2 className="text-xl font-display font-bold mt-2">Portal Belajar & Sertifikasi Peserta</h2>
          <div className="mt-3 text-xs text-indigo-100 flex flex-wrap gap-x-6 gap-y-1.5捷">
            <div><strong className="text-white">Nama Lengkap:</strong> {p.name}</div>
            <div><strong className="text-white">NIK Gacoan:</strong> {p.nik}</div>
            <div><strong className="text-white">Department:</strong> {p.department}</div>
          </div>
        </div>
        <div className="absolute right-0 bottom-0 translate-x-6 translate-y-6 w-32 h-32 bg-white/10 rounded-full" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column: Scheduling Info */}
        <div className="md:col-span-1 space-y-6">
          <div className="form-card p-5 rounded-xl space-y-4">
            <h3 className="label-caps flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-500" />
              Sesi Jadwal Presentasi
            </h3>

            {p.scheduleDate ? (
              <div className="space-y-3">
                <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-100">
                  <div className="text-xs text-slate-505">Tanggal Presentasi:</div>
                  <div className="font-display font-bold text-sm text-indigo-900 mt-0.5">{p.scheduleDate}</div>
                  <div className="text-xs text-slate-400 font-mono mt-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Slot: {p.scheduleTimeSlot} WIB
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600 leading-normal">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    <span><strong>RM:</strong> {p.assignedRMName}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                    <span><strong>Asesor:</strong> {p.assignedAssessorName}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-amber-50 border border-amber-100 text-amber-800 rounded-lg text-xs space-y-1.5">
                <p className="font-bold flex items-center gap-1">
                  <Clock className="w-4 h-4 text-amber-600" />
                  Menunggu Penyusunan Jadwal
                </p>
                <p className="text-[11px] leading-relaxed text-amber-700">
                  Regional Manager Anda ({p.assignedRMName}) sedang menetapkan tanggal lowong. Anda akan menerima notifikasi segera setelah terjadwal.
                </p>
              </div>
            )}
          </div>

          {/* Locked Status Notice card */}
          <div className="form-card p-5 rounded-xl space-y-3">
            <h3 className="label-caps">
              Status Evidence Lock
            </h3>
            <div className={`p-3 rounded-lg border ${isLOCKED ? 'bg-red-50 border-red-100 text-red-800' : 'bg-emerald-50 border-emerald-100 text-emerald-800'} text-xs flex items-start gap-2.5`}>
              {isLOCKED ? (
                <>
                  <Lock className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Dokumen Terkunci</span>
                    <p className="text-[10px] text-red-600 mt-1 leading-normal">{lockReason}</p>
                  </div>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Unggahan Terbuka</span>
                    <p className="text-[10px] text-emerald-700 mt-1 leading-normal">Unggahan PPT aktif. Harap lampirkan slide presentasi minimal 1 jam sebelum jadwal dimulai.</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right column: Upload Area & Results block */}
        <div className="md:col-span-2 space-y-6">
          {/* Submission and upload block */}
          <div className="form-card p-6 rounded-xl space-y-4">
            <div>
              <h3 className="label-caps">
                Langkah 2: Unggah Berkas Evidence (PPTX/PDF)
              </h3>
              <p className="text-xs text-slate-500 mt-1">Sertakan berkas slide presentasi program audit operational sebagai evidence pusat.</p>
            </div>

            {/* Drag & drop container */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`p-6 border-2 border-dashed rounded-lg transition text-center flex flex-col items-center justify-center min-h-[160px] relative ${
                dragActive ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 hover:border-indigo-400 bg-slate-50/30'
              } ${isLOCKED ? 'opacity-60 cursor-not-allowed bg-slate-100/50' : 'cursor-pointer'}`}
            >
              <Upload className={`w-8 h-8 mb-2 ${isLOCKED ? 'text-slate-400' : 'text-indigo-500'}`} />
              <div className="text-xs font-semibold text-slate-700">
                {isLOCKED ? 'Unggahan dikunci (Terkunci)' : 'Tarik (Drag) & Drop File Anda di sini'}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Mendukung file berekstensi .pptx / .ppt / .pdf (Maks. 10 MB)</div>

              {p.evidenceFile && (
                <div className="mt-3 p-2 bg-indigo-50 rounded border border-indigo-100 flex items-center gap-2 text-left">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  <div>
                    <div className="text-xs font-bold text-slate-800 line-clamp-1">{p.evidenceFile.name}</div>
                    <div className="text-[9px] text-slate-400 font-mono">Diterima: {p.evidenceFile.size} • Terpasang otomatis</div>
                  </div>
                </div>
              )}
            </div>

            {/* Manual simulation form if drag and drop is not active */}
            {!isLOCKED && (
              <form onSubmit={handleManualUploadSubmit} className="pt-2 flex gap-2">
                <input
                  type="text"
                  placeholder="Atau ketik nama file presentasi mock Anda (contoh: audit_gacoan.pptx)..."
                  value={manualFileName}
                  onChange={(e) => setManualFileName(e.target.value)}
                  className="flex-1 text-xs p-2.5 border border-slate-200 rounded font-medium focus:ring-1 focus:ring-indigo-500 text-slate-800"
                />
                <button
                  id="peserta-btn-upload"
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 rounded-lg block cursor-pointer transition flex items-center gap-1"
                >
                  Confirm Upload
                </button>
              </form>
            )}

            {successMsg && (
              <div className="text-xs bg-emerald-50 text-emerald-800 p-2.5 rounded border border-emerald-100 font-semibold animate-pulse">
                {successMsg}
              </div>
            )}
          </div>

          {/* Results Summary if completed */}
          {p.status === 'COMPLETED' ? (
            <div className="form-card p-6 rounded-xl space-y-5">
              <div className="flex items-center gap-2 p-1 border-b border-slate-100 pb-3">
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">✓</div>
                <div>
                  <h3 className="label-caps">Hasil Akhir Penilaian & Feedback</h3>
                  <p className="text-[11px] text-slate-400">Selamat, Anda memperoleh nilai sertifikasi lulus!</p>
                </div>
              </div>

              {/* Total final score indicator badge */}
              <div className="bg-gradient-to-r from-emerald-600 to-teal-500 p-4 rounded-xl text-white flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-100 block">NILAI AKHIR REKAPITULASI (SKALA 100)</span>
                  <span className="text-xs text-white/90">Akumulasi rata-rata penilaian RM & Akademi Assessor</span>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-display font-black leading-none">{p.evaluation?.finalAverage}</div>
                  <div className="text-[10px] font-mono text-emerald-200 tracking-tighter mt-1">STATUS: SERTIFIKASI SELESAI</div>
                </div>
              </div>

              {/* Individual breakdown columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Regional Manager Feedback block */}
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 space-y-2">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
                    <span className="text-xs font-bold text-slate-700">Analisis RM: {p.assignedRMName}</span>
                    <span className="text-xs font-bold text-blue-600">
                      Rata-rata: {p.evaluation?.rmScore ? Math.round((p.evaluation.rmScore.technical + p.evaluation.rmScore.communication + p.evaluation.rmScore.visual + p.evaluation.rmScore.professionalism)/4) : '-'}
                    </span>
                  </div>
                  {p.evaluation?.rmScore ? (
                    <div className="space-y-1 text-xs text-slate-600">
                      <div className="flex justify-between"><span>A. Technical:</span> <strong className="text-slate-800">{p.evaluation.rmScore.technical}</strong></div>
                      <div className="flex justify-between"><span>B. Komunikasi:</span> <strong className="text-slate-800">{p.evaluation.rmScore.communication}</strong></div>
                      <div className="flex justify-between"><span>C. Visual:</span> <strong className="text-slate-800">{p.evaluation.rmScore.visual}</strong></div>
                      <div className="flex justify-between"><span>D. Profesionalisme:</span> <strong className="text-slate-800">{p.evaluation.rmScore.professionalism}</strong></div>
                    </div>
                  ) : <div className="text-xs text-slate-400">Belum diisi</div>}
                  <div className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-200/50 leading-relaxed limit-lines">
                    "{p.evaluation?.rmNotes || 'Tidak ada catatan.'}"
                  </div>
                </div>

                {/* 2. Assessor Feedback block */}
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 space-y-2">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
                    <span className="text-xs font-bold text-slate-700">Asesor: {p.assignedAssessorName}</span>
                    <span className="text-xs font-bold text-amber-600">
                      Rata-rata: {p.evaluation?.assessorScore ? Math.round((p.evaluation.assessorScore.technical + p.evaluation.assessorScore.communication + p.evaluation.assessorScore.visual + p.evaluation.assessorScore.professionalism)/4) : '-'}
                    </span>
                  </div>
                  {p.evaluation?.assessorScore ? (
                    <div className="space-y-1 text-xs text-slate-600">
                      <div className="flex justify-between"><span>A. Technical:</span> <strong className="text-slate-800">{p.evaluation.assessorScore.technical}</strong></div>
                      <div className="flex justify-between"><span>B. Komunikasi:</span> <strong className="text-slate-800">{p.evaluation.assessorScore.communication}</strong></div>
                      <div className="flex justify-between"><span>C. Visual:</span> <strong className="text-slate-800">{p.evaluation.assessorScore.visual}</strong></div>
                      <div className="flex justify-between"><span>D. Profesionalisme:</span> <strong className="text-slate-800">{p.evaluation.assessorScore.professionalism}</strong></div>
                    </div>
                  ) : <div className="text-xs text-slate-400">Belum diisi</div>}
                  <div className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-200/50 leading-relaxed limit-lines">
                    "{p.evaluation?.assessorNotes || 'Tidak ada catatan.'}"
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50/50 p-6 rounded-xl border border-slate-200/60 flex flex-col items-center justify-center text-center">
              <Award className="w-10 h-10 text-slate-300 mb-2" />
              <div className="text-xs font-bold text-slate-600">Laporan Hasil Sertifikasi belum Terbit</div>
              <p className="text-[11px] text-slate-400 max-w-sm mt-1">Laporan nilai, feedback detail, dan sertifikat kelulusan otomatis tampil di sini segera setelah RM dan Certified Assessor menyelesaikan input formulir penilaian ujian Anda.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
