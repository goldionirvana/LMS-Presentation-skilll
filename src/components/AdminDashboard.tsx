import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Calendar, 
  FileCheck, 
  Download, 
  Search, 
  Filter, 
  Trash2, 
  User, 
  FileCode, 
  Award,
  BookOpen,
  PieChart,
  HelpCircle,
  MoreVertical,
  CheckCircle,
  Clock,
  AlertCircle,
  FileSpreadsheet,
  Upload,
  Info
} from 'lucide-react';
import { Participant, RMUser, AssessorUser } from '../types';

interface AdminDashboardProps {
  participants: Participant[];
  rms: RMUser[];
  assessors: AssessorUser[];
  onAddParticipant: (p: Omit<Participant, 'id' | 'status'>) => void;
  onAddParticipantsBulk: (p: Omit<Participant, 'id' | 'status'>[]) => void;
  onDeleteParticipant: (id: string) => void;
  onUpdateParticipantEvaluator: (pId: string, rmId: string, assessorId: string) => void;
}

export default function AdminDashboard({
  participants,
  rms,
  assessors,
  onAddParticipant,
  onAddParticipantsBulk,
  onDeleteParticipant,
  onUpdateParticipantEvaluator
}: AdminDashboardProps) {
  
  // State for adding participant form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newNik, setNewNik] = useState('');
  const [newDept, setNewDept] = useState('Operations (Store Manager)');
  const [selectedRM, setSelectedRM] = useState(rms[0]?.id || '');
  const [selectedAssessor, setSelectedAssessor] = useState(assessors[0]?.id || '');

  // Tab state for registration: 'MANUAL' | 'EXCEL'
  const [activeRegTab, setActiveRegTab] = useState<'MANUAL' | 'EXCEL'>('MANUAL');
  
  // Custom CSV/Excel states
  const [excelPasteText, setExcelPasteText] = useState('');
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [excelError, setExcelError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Helper to parse pasted / uploaded CSV format data
  const parseCSVText = (text: string) => {
    if (!text.trim()) {
      setParsedRows([]);
      setExcelError(null);
      return;
    }

    try {
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length < 2) {
        throw new Error('Format tidak valid. Data minimal harus menyertakan Header kolom di baris pertama dan minimal satu baris data.');
      }

      // Detect delimiters (comma, semicolon, tab)
      const headerLine = lines[0];
      let delimiter = ',';
      if (headerLine.includes(';')) delimiter = ';';
      else if (headerLine.includes('\t')) delimiter = '\t';

      // Parse headers
      const headers = headerLine.split(delimiter).map(h => h.trim().toLowerCase().replace(/"/g, ''));
      
      const namaIdx = headers.findIndex(h => h.includes('nama') || h.includes('name'));
      const nikIdx = headers.findIndex(h => h.includes('nik') || h.includes('id') || h.includes('nomor'));
      const deptIdx = headers.findIndex(h => h.includes('jabatan') || h.includes('dept') || h.includes('department') || h.includes('divisi'));
      const rmIdx = headers.findIndex(h => h.includes('rm') || h.includes('manager') || h.includes('regional'));
      const assessorIdx = headers.findIndex(h => h.includes('assessor') || h.includes('as_') || h.includes('asesor'));

      if (namaIdx === -1 || nikIdx === -1) {
        throw new Error('Header tidak lengkap! Kolom "Nama" dan "NIK" wajib ada di baris pertama file CSV.');
      }

      const tempRows: any[] = [];
      for (let i = 1; i < lines.length; i++) {
        // Safe split by delimiter respecting potential enclosed quotes
        const rawCols = lines[i].split(delimiter);
        const cols = rawCols.map(c => c.trim().replace(/^["']|["']$/g, ''));
        
        if (cols.length < 2) continue;

        const pName = cols[namaIdx] || `Peserta Massal ${i}`;
        const pNik = cols[nikIdx] || `GAC-BU-${100 + i}`;
        const pDept = deptIdx !== -1 && cols[deptIdx] ? cols[deptIdx] : 'Operations (Store Manager)';
        
        // Find RM match
        let assignedRMId = rms[0]?.id || '';
        let assignedRMName = rms[0]?.name || '';
        if (rmIdx !== -1 && cols[rmIdx]) {
          const rawRM = cols[rmIdx].toLowerCase();
          const found = rms.find(r => r.id.toLowerCase() === rawRM || r.name.toLowerCase().includes(rawRM));
          if (found) {
            assignedRMId = found.id;
            assignedRMName = found.name;
          }
        }

        // Find Assessor match
        let assignedAssessorId = assessors[0]?.id || '';
        let assignedAssessorName = assessors[0]?.name || '';
        if (assessorIdx !== -1 && cols[assessorIdx]) {
          const rawAs = cols[assessorIdx].toLowerCase();
          const found = assessors.find(a => a.id.toLowerCase() === rawAs || a.name.toLowerCase().includes(rawAs));
          if (found) {
            assignedAssessorId = found.id;
            assignedAssessorName = found.name;
          }
        }

        tempRows.push({
          name: pName,
          nik: pNik,
          department: pDept,
          assignedRMId,
          assignedRMName,
          assignedAssessorId,
          assignedAssessorName,
          isValid: true
        });
      }

      setParsedRows(tempRows);
      setExcelError(null);
    } catch (err: any) {
      setExcelError(err.message || 'Gagal memproses data CSV/Excel ini. Pastikan format pemisah yang digunakan sesuai.');
      setParsedRows([]);
    }
  };

  const handleDownloadTemplate = () => {
    const headers = ['Nama', 'NIK', 'Jabatan_Department', 'RM_ID_atau_Nama', 'Assessor_ID_atau_Nama'];
    const sampleRows = [
      ['Rudi Hermawan', 'GAC-2026-611', 'Operations (Assistant Store Manager)', rms[0]?.name || 'Agus Purwanto', assessors[0]?.name || 'Asesor Gacoan'],
      ['Rania Safitri', 'GAC-2026-612', 'Kitchen Prep (Team Leader)', rms[1]?.name || rms[0]?.name || 'RM Jawa Timur', assessors[1]?.name || assessors[0]?.name || 'Asesor Utama'],
      ['Andrian Permadi', 'GAC-2026-613', 'Service Crew (Trainer)', rms[0]?.name || 'Agus Purwanto', assessors[0]?.name || 'Asesor Gacoan']
    ];
    // With standard BOM for proper excel encoding support
    const csvContent = '\uFEFF' + [
      headers.join(','),
      ...sampleRows.map(r => r.map(x => `"${x.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Template_Daftar_LMS_Gacoan_Massal.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const loadPresetData = (presetNum: number) => {
    let text = '';
    if (presetNum === 1) {
      text = `Nama,NIK,Jabatan_Department,RM_ID_atau_Nama,Assessor_ID_atau_Nama\n` +
             `Dimas Adi Nugroho,GAC-2026-301,Operations (Store Manager),${rms[0]?.name || 'RM001'},${assessors[0]?.name || 'AS001'}\n` +
             `Sinta Wahyuni,GAC-2026-302,Kitchen Prep (Team Leader),${rms[1]?.name || rms[0]?.name || 'RM002'},${assessors[1]?.name || assessors[0]?.name || 'AS002'}\n` +
             `Andrian Permadi,GAC-2026-303,Service Crew (Trainer),${rms[0]?.name || 'RM001'},${assessors[0]?.name || 'AS001'}\n` +
             `Vicky Prasetya,GAC-2026-304,Store Supervisor,${rms[1]?.name || rms[0]?.name || 'RM002'},${assessors[1]?.name || assessors[0]?.name || 'AS002'}\n` +
             `Eko Prasetyo,GAC-2026-305,Operations (Assistant Store Manager),${rms[0]?.name || 'RM001'},${assessors[0]?.name || 'AS001'}`;
    } else {
      text = `Nama,NIK,Jabatan_Department,RM_ID_atau_Nama,Assessor_ID_atau_Nama\n` +
             `Randi Kurniadi,GAC-2026-401,Store Supervisor,${rms[0]?.id || 'RM001'},${assessors[1]?.id || assessors[0]?.id || 'AS002'}\n` +
             `Melati Suci,GAC-2026-402,Kitchen Prep (Team Leader),${rms[1]?.id || rms[0]?.id || 'RM002'},${assessors[0]?.id || 'AS001'}\n` +
             `Fahmi Zakariya,GAC-2026-403,Operations (Store Manager),${rms[0]?.id || 'RM001'},${assessors[0]?.id || 'AS001'}`;
    }
    setExcelPasteText(text);
    parseCSVText(text);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setExcelPasteText(text);
        parseCSVText(text);
      };
      reader.readAsText(file);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Detect if file is excel / csv
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setExcelPasteText(text);
      parseCSVText(text);
    };
    reader.readAsText(file);
  };

  const handleClearExcelInput = () => {
    setExcelPasteText('');
    setParsedRows([]);
    setExcelError(null);
  };

  const handleConfirmBulkRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedRows.length === 0) return;
    
    const listToRegister = parsedRows.map(p => ({
      name: p.name,
      nik: p.nik,
      department: p.department,
      assignedRMId: p.assignedRMId,
      assignedRMName: p.assignedRMName,
      assignedAssessorId: p.assignedAssessorId,
      assignedAssessorName: p.assignedAssessorName
    }));

    onAddParticipantsBulk(listToRegister);
    
    // Clear states and close form
    handleClearExcelInput();
    setShowAddForm(false);
    alert(`Sukses menambahkan ${listToRegister.length} peserta baru secara massal! Notifikasi sistem telah otomatis dikirimkan ke masing-masing RM.`);
  };

  // State for filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Calculate statistics
  const totalCount = participants.length;
  
  // Status matching the screenshot logic
  const scheduledCount = participants.filter(p => p.status !== 'PENDING_SCHEDULE').length;
  const pptSubmittedCount = participants.filter(p => p.evidenceFile).length;
  const completedCount = participants.filter(p => p.status === 'COMPLETED').length;
  const pendingCount = totalCount - completedCount;

  const successRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const failureRate = totalCount > 0 ? Math.round((participants.filter(p => p.evaluation?.finalAverage && p.evaluation.finalAverage < 70).length / totalCount) * 100) : 0;

  // Handle Form submit
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newNik) {
      alert('Nama dan NIK wajib diisi!');
      return;
    }

    const matchedRM = rms.find(r => r.id === selectedRM);
    const matchedAssessor = assessors.find(a => a.id === selectedAssessor);

    onAddParticipant({
      name: newName,
      nik: newNik,
      department: newDept,
      assignedRMId: selectedRM,
      assignedRMName: matchedRM ? matchedRM.name : 'Unknown RM',
      assignedAssessorId: selectedAssessor,
      assignedAssessorName: matchedAssessor ? matchedAssessor.name : 'Unknown Assessor'
    });

    // Reset Form
    setNewName('');
    setNewNik('');
    setShowAddForm(false);
  };

  // Export CSV Handler
  const handleExportCSV = () => {
    // Generate beautiful formatted CSV with details of RM and Assessor grading
    const headers = [
      'ID', 'Nama Peserta', 'NIK', 'Department', 'Status', 'Jadwal Hari', 'Slot Waktu', 
      'Nama RM', 'Nilai RM (Tech)', 'Nilai RM (Kom)', 'Nilai RM (Vis)', 'Nilai RM (Prof)', 'Catatan RM',
      'Nama Assessor', 'Nilai Assessor (Tech)', 'Nilai Assessor (Kom)', 'Nilai Assessor (Vis)', 'Nilai Assessor (Prof)', 'Catatan Assessor',
      'Nilai Rata-Rata Akhir'
    ];

    const rows = participants.map(p => {
      const rmEval = p.evaluation?.rmScore;
      const assEval = p.evaluation?.assessorScore;
      return [
        p.id,
        `"${p.name.replace(/"/g, '""')}"`,
        p.nik,
        `"${p.department}"`,
        p.status,
        p.scheduleDate || '-',
        p.scheduleTimeSlot || '-',
        `"${p.assignedRMName}"`,
        rmEval?.technical ?? 0,
        rmEval?.communication ?? 0,
        rmEval?.visual ?? 0,
        rmEval?.professionalism ?? 0,
        `"${(p.evaluation?.rmNotes || '').replace(/"/g, '""')}"`,
        `"${p.assignedAssessorName}"`,
        assEval?.technical ?? 0,
        assEval?.communication ?? 0,
        assEval?.visual ?? 0,
        assEval?.professionalism ?? 0,
        `"${(p.evaluation?.assessorNotes || '').replace(/"/g, '""')}"`,
        p.evaluation?.finalAverage || '-'
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Gacoan_LMS_Technical_Assessment_Export_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter participants
  const filteredParticipants = participants.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.nik.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.department.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (statusFilter === 'ALL') return matchesSearch;
    return matchesSearch && p.status === statusFilter;
  });

  return (
    <div className="space-y-6 slide-up p-1">
      {/* Visual Header matching the screenshot overview */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-800">Admin Academy Dashboard</h2>
          <p className="text-xs text-slate-500">Monitoring Progress, Assign Evaluator & Re-kapitulasi otomatis Technical Skill.</p>
        </div>
        <button
          id="btn-tarik-data"
          onClick={handleExportCSV}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition duration-150 shadow-sm cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Tarik Data (Export CSV)</span>
        </button>
      </div>

      {/* Grid statistics replicating screen-shot colors and layouts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Blue Card: Registered participants */}
        <div className="bg-blue-600 text-white rounded-xl p-5 shadow-md flex items-center justify-between relative overflow-hidden group">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-blue-100 uppercase tracking-wider block">Peserta</span>
            <span className="text-[10px] text-blue-200 block">Jumlah Peserta Terdaftar</span>
            <span className="text-3xl font-display font-semibold block pt-2">{totalCount} <span className="text-xs font-normal text-blue-200">Peserta</span></span>
          </div>
          <div className="bg-blue-500/40 p-3.5 rounded-full">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 w-20 h-20 bg-blue-500/20 rounded-full" />
        </div>

        {/* Green Card: Success rate */}
        <div className="bg-emerald-600 text-white rounded-xl p-5 shadow-md flex items-center justify-between relative overflow-hidden group">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-emerald-100 uppercase tracking-wider block">Lulus & Selesai</span>
            <span className="text-[10px] text-emerald-200 block">Peserta Selesai Dinilai</span>
            <span className="text-3xl font-display font-semibold block pt-2">{completedCount} <span className="text-xs font-normal text-emerald-200">({successRate}% Done)</span></span>
          </div>
          <div className="bg-emerald-500/40 p-3.5 rounded-full">
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
          <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 w-20 h-20 bg-emerald-500/20 rounded-full" />
        </div>

        {/* Red Card: Failure / Remaining pending */}
        <div className="bg-rose-500 text-white rounded-xl p-5 shadow-md flex items-center justify-between relative overflow-hidden group">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-rose-100 uppercase tracking-wider block">Outstanding</span>
            <span className="text-[10px] text-rose-100/80 block">Masih Menunggu Penilaian</span>
            <span className="text-3xl font-display font-semibold block pt-2">{pendingCount} <span className="text-xs font-normal text-rose-100/70">Peserta</span></span>
          </div>
          <div className="bg-rose-400/40 p-3.5 rounded-full">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 w-20 h-20 bg-rose-400/20 rounded-full" />
        </div>
      </div>

      {/* Step Info-graphic Flow to guide Admin through steps */}
      <div className="bg-white rounded-xl p-4 border border-slate-100 glow-card">
        <h3 className="text-xs font-mono font-bold uppercase text-slate-400 mb-3 tracking-widest">Alur Penilaian Technical Skill</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
          <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100/60 flex flex-col items-center">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center font-mono">1</div>
            <p className="text-xs font-bold text-slate-700 mt-2">Daftar & Assign</p>
            <p className="text-[10px] text-slate-400 leading-normal mt-0.5">Admin menginput peserta dan assign cross-function RM & Assessor.</p>
          </div>
          <div className="p-3 bg-slate-50/50 rounded-lg border border-slate-100 flex flex-col items-center">
            <div className="w-6 h-6 rounded-full bg-slate-300 text-slate-700 text-xs font-bold flex items-center justify-center font-mono">2</div>
            <p className="text-xs font-bold text-slate-700 mt-2">Penjadwalan</p>
            <p className="text-[10px] text-slate-400 leading-normal mt-0.5">RM terpilih mengisi slot waktu kosong ke dalam Kalender LMS.</p>
          </div>
          <div className="p-3 bg-slate-50/50 rounded-lg border border-slate-100 flex flex-col items-center">
            <div className="w-6 h-6 rounded-full bg-slate-300 text-slate-700 text-xs font-bold flex items-center justify-center font-mono">3</div>
            <p className="text-xs font-bold text-slate-700 mt-2">Serah Evidence</p>
            <p className="text-[10px] text-slate-400 leading-normal mt-0.5">Peserta submit file PPT/PDF presentasi sebagai bukti evidence.</p>
          </div>
          <div className="p-3 bg-slate-50/50 rounded-lg border border-slate-100 flex flex-col items-center">
            <div className="w-6 h-6 rounded-full bg-slate-300 text-slate-700 text-xs font-bold flex items-center justify-center font-mono">4</div>
            <p className="text-xs font-bold text-slate-700 mt-2">Ujian & Nilai</p>
            <p className="text-[10px] text-slate-400 leading-normal mt-0.5">Sesi live: RM & Assessor mengisi form penilaian split-screen.</p>
          </div>
        </div>
      </div>

      {/* Collapsible Panel for adding/inserting participants */}
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden glow-card">
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Pendaftaran Peserta & Evaluator</span>
          </div>
          <button
            id="toggle-add-form-btn"
            onClick={() => setShowAddForm(!showAddForm)}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition px-2.5 py-1 rounded hover:bg-white"
          >
            {showAddForm ? '[-] Sembunyikan Panel' : '[+] Tampilkan Panel'}
          </button>
        </div>

        {showAddForm && (
          <div className="p-5 space-y-5 slide-up">
            {/* Tab switchers inside add panel */}
            <div className="flex border-b border-slate-150 pb-px">
              <button
                type="button"
                onClick={() => setActiveRegTab('MANUAL')}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 -mb-px transition flex items-center gap-2 ${
                  activeRegTab === 'MANUAL' 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                Pendaftaran Manual
              </button>
              <button
                type="button"
                onClick={() => setActiveRegTab('EXCEL')}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 -mb-px transition flex items-center gap-2 ${
                  activeRegTab === 'EXCEL' 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Upload Excel / CSV (Massal)
                <span className="bg-amber-100 text-amber-800 text-[9px] px-1.5 py-0.5 rounded font-mono font-bold animate-pulse">BARU</span>
              </button>
            </div>

            {/* TAB CONTENT 1: MANUAL REGISTRATION */}
            {activeRegTab === 'MANUAL' && (
              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Nama Lengkap Peserta</label>
                    <input
                      type="text"
                      placeholder="Contoh: Dimas Adi Nugroho"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full text-xs p-2 border border-slate-200 rounded focus:ring-1 focus:ring-blue-500 font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Nomor Induk Karyawan (NIK)</label>
                    <input
                      type="text"
                      placeholder="Contoh: GAC-2024-0012"
                      value={newNik}
                      onChange={(e) => setNewNik(e.target.value)}
                      className="w-full text-xs p-2 border border-slate-200 rounded focus:ring-1 focus:ring-blue-500 font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Jabatan & Department</label>
                    <select
                      value={newDept}
                      onChange={(e) => setNewDept(e.target.value)}
                      className="w-full text-xs p-2 border border-slate-200 rounded focus:ring-1 focus:ring-blue-500 font-medium bg-white"
                    >
                      <option value="Operations (Store Manager)">Operations (Store Manager)</option>
                      <option value="Operations (Assistant Store Manager)">Operations (Assistant Store Manager)</option>
                      <option value="Kitchen Prep (Team Leader)">Kitchen Prep (Team Leader)</option>
                      <option value="Service Crew (Trainer)">Service Crew (Trainer)</option>
                      <option value="Store Supervisor">Store Supervisor</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full inline-block" />
                      Assign Regional Manager (RM)
                    </label>
                    <p className="text-[10px] text-slate-400 mb-2">Pilih Regional Manager lintas divisi untuk melakukan cross-check operational.</p>
                    <select
                      value={selectedRM}
                      onChange={(e) => setSelectedRM(e.target.value)}
                      className="w-full text-xs p-2 border border-slate-200 rounded bg-white text-slate-800"
                    >
                      {rms.map(r => (
                        <option key={r.id} value={r.id}>{r.name} - {r.department}</option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-amber-500 rounded-full inline-block" />
                      Assign Academy Assessor
                    </label>
                    <p className="text-[10px] text-slate-400 mb-2">Pilih asesor profesional dari Gacoan Academy kurikulum pusat.</p>
                    <select
                      value={selectedAssessor}
                      onChange={(e) => setSelectedAssessor(e.target.value)}
                      className="w-full text-xs p-2 border border-slate-200 rounded bg-white text-slate-800"
                    >
                      {assessors.map(a => (
                        <option key={a.id} value={a.id}>{a.name} - {a.department}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    id="submit-new-participant"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-5 py-2 rounded-lg transition duration-150 cursor-pointer"
                  >
                    Simpan & Daftarkan Peserta
                  </button>
                </div>
              </form>
            )}

            {/* TAB CONTENT 2: EXCEL / CSV BULK REGISTRATION */}
            {activeRegTab === 'EXCEL' && (
              <div className="space-y-4">
                {/* Visual Instructions Alert */}
                <div className="p-3.5 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-slate-700 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-indigo-900">
                    <Info className="w-4 h-4 text-indigo-600" />
                    <span>Petunjuk Unggah Pendaftaran Lintas Divisi secara Massal</span>
                  </div>
                  <p className="text-slate-600 leading-normal pl-6">
                    Anda dapat mendaftarkan puluhan store manager / team leader sekaligus dengan mengunggah template spreadsheet Excel (.xlsx/.xls) atau berkas pemisah koma (.csv). Atutor evaluator cross-function RM dan Assessor dapat dicantumkan langsung menggunakan ID atau sebagian nama instansi mereka.
                  </p>
                  <div className="flex flex-wrap gap-2.5 pt-1 pl-6">
                    <button
                      type="button"
                      onClick={handleDownloadTemplate}
                      className="bg-white hover:bg-slate-50 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-lg font-bold text-[11px] flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Unduh Template Excel (.CSV)
                    </button>
                    <button
                      type="button"
                      onClick={() => loadPresetData(1)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg font-bold text-[11px] transition shadow-sm cursor-pointer"
                    >
                      ⚡ Simulasikan Pengisian Preset A (5 Orang)
                    </button>
                    <button
                      type="button"
                      onClick={() => loadPresetData(2)}
                      className="bg-slate-700 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg font-bold text-[11px] transition shadow-sm cursor-pointer"
                    >
                      ⚡ Simulasikan Pengisian Preset B (3 Orang)
                    </button>
                  </div>
                </div>

                {/* Import Row containing Dropzone & Custom Text Clipboard */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* File Upload Dropzone */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 block">Langkah A: Pilih / Seret Berkas Spreadsheet Anda</label>
                    <div 
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      className={`h-40 rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-4 transition ${
                        dragActive ? 'bg-blue-50 border-blue-500' : 'bg-slate-50/50 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <Upload className="w-8 h-8 text-slate-400 mb-2" />
                      <p className="text-xs text-slate-600 font-semibold text-center">Seret & taruh file CSV / cetakan Excel di sini</p>
                      <p className="text-[10px] text-slate-400 text-center mt-1">Atau klik tombol dibawah untuk mencari file dokumen</p>
                      
                      <label className="mt-3 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-[11px] px-3 py-1.5 rounded-lg shadow-sm cursor-pointer">
                        <span>Pilih Dokumen</span>
                        <input
                          type="file"
                          accept=".csv, .txt, .xlsx, .xls"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Manual Paste area fallback */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 block">Langkah B: Atau Tempel (Paste) Baris Data Excel</label>
                      {excelPasteText && (
                        <button 
                          onClick={handleClearExcelInput}
                          className="text-[10px] text-red-500 font-bold hover:underline"
                        >
                          [Reset Input]
                        </button>
                      )}
                    </div>
                    <textarea
                      value={excelPasteText}
                      onChange={(e) => {
                        setExcelPasteText(e.target.value);
                        parseCSVText(e.target.value);
                      }}
                      placeholder="Nama,NIK,Jabatan_Department,RM_ID_atau_Nama,Assessor_ID_atau_Nama&#10;Dimas Adi,GAC-2026-301,Store Supervisor,Agus Purwanto,Sri Wahyuni"
                      className="w-full h-40 p-3 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-500 font-mono leading-relaxed"
                    />
                  </div>
                </div>

                {/* Error Box if parsing fails */}
                {excelError && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-700 flex items-center gap-2 font-medium">
                    <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-ping" />
                    <span>{excelError}</span>
                  </div>
                )}

                {/* Preview Grid Section */}
                {parsedRows.length > 0 && (
                  <div className="space-y-2 border border-slate-150 rounded-xl overflow-hidden pt-2.5">
                    <div className="px-3.5 pb-2 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block" />
                        Live Preview Mapped Data ({parsedRows.length} Calon Peserta terdeteksi)
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">Siap Di-import</span>
                    </div>

                    <div className="overflow-x-auto max-h-56">
                      <table className="w-full text-left text-xs border-collapse font-medium">
                        <thead>
                          <tr className="bg-slate-100 border-b border-slate-150 text-[10px] font-mono text-slate-500 uppercase">
                            <th className="p-2 pl-3.5">Nama Peserta</th>
                            <th className="p-2">NIK</th>
                            <th className="p-2">Jabatan & Department</th>
                            <th className="p-2">Regional Manager (RM) Assigned</th>
                            <th className="p-2 pr-3.5">Assessor Assigned</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {parsedRows.map((r, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="p-2 pl-3.5 font-bold text-slate-800">{r.name}</td>
                              <td className="p-2 font-mono text-[11px] text-slate-600">{r.nik}</td>
                              <td className="p-2 text-slate-500">{r.department}</td>
                              <td className="p-2">
                                <div className="space-y-0.5">
                                  <div className="font-semibold text-slate-700">{r.assignedRMName}</div>
                                  <div className="text-[10px] text-slate-400 font-mono">ID: {r.assignedRMId}</div>
                                </div>
                              </td>
                              <td className="p-2 pr-3.5">
                                <div className="space-y-0.5">
                                  <div className="font-semibold text-slate-700">{r.assignedAssessorName}</div>
                                  <div className="text-[10px] text-slate-400 font-mono">ID: {r.assignedAssessorId}</div>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end">
                      <button
                        type="button"
                        onClick={handleConfirmBulkRegister}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <FileCheck className="w-4 h-4" />
                        Konfirmasi & Daftarkan {parsedRows.length} Peserta Secara Massal
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Monitoring Progress Table */}
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden glow-card">
        {/* Filter Toolbar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 className="text-xs font-bold uppercase text-slate-700 tracking-wider">
            Monitoring Progress Peserta ({filteredParticipants.length} Baris data)
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama, NIK, or divisi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-md w-48 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Status Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-slate-200 bg-white rounded-md font-medium text-slate-700"
            >
              <option value="ALL">Semua Status</option>
              <option value="PENDING_SCHEDULE">Mencari Jadwal</option>
              <option value="PENDING_EVIDENCE">Menunggu PPT</option>
              <option value="READY_TO_ASSESS">Siap Dinilai</option>
              <option value="COMPLETED">Selesai Dinilai</option>
            </select>
          </div>
        </div>

        {/* Real-time Monitoring grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-500 font-semibold font-mono text-[10px] uppercase tracking-wider">
                <th className="p-4">Peserta & NIK</th>
                <th className="p-4">Department / Divisi</th>
                <th className="p-4">Evaluator Assigned (RM + Assessor)</th>
                <th className="p-4">Jadwal Sesi</th>
                <th className="p-4">Evidence (PPT)</th>
                <th className="p-4">Nilai Akhir</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredParticipants.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 font-medium">
                    Tidak ditemukan data peserta dengan filter target.
                  </td>
                </tr>
              ) : (
                filteredParticipants.map((p) => {
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition">
                      {/* Name & NIK */}
                      <td className="p-4">
                        <div className="font-semibold text-slate-800">{p.name}</div>
                        <div className="text-[10px] font-mono font-bold text-slate-400 mt-0.5">{p.nik}</div>
                      </td>
                      
                      {/* Department */}
                      <td className="p-4 text-slate-600 font-medium">
                        {p.department}
                      </td>

                      {/* assigned assessors */}
                      <td className="p-4 space-y-1">
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block" />
                          <span className="text-slate-500 font-semibold">RM:</span> 
                          <span className="text-slate-700 font-medium">{p.assignedRMName}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full inline-block" />
                          <span className="text-slate-500 font-semibold">Asesor:</span> 
                          <span className="text-slate-700 font-medium">{p.assignedAssessorName}</span>
                        </div>
                      </td>

                      {/* Scheduled info */}
                      <td className="p-4">
                        {p.scheduleDate ? (
                          <div>
                            <div className="font-semibold text-slate-700 flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-blue-500" />
                              {p.scheduleDate}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">{p.scheduleTimeSlot}</div>
                          </div>
                        ) : (
                          <span className="text-red-500 font-medium font-mono text-[10px] bg-red-50 px-2 py-0.5 rounded-full inline-block">
                            Belum di-schedule RM
                          </span>
                        )}
                      </td>

                      {/* Evidence */}
                      <td className="p-4">
                        {p.evidenceFile ? (
                          <div>
                            <div className="font-semibold text-blue-600 hover:underline truncate max-w-[150px] cursor-pointer" title={p.evidenceFile.name}>
                              {p.evidenceFile.name}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                              {p.evidenceFile.size} • {p.evidenceFile.slideCount} slides
                            </div>
                          </div>
                        ) : p.scheduleDate ? (
                          <span className="text-amber-600 font-medium font-mono text-[10px] bg-amber-50 px-2 py-0.5 rounded-full inline-block">
                            Belum diserahkan
                          </span>
                        ) : (
                          <span className="text-slate-400 font-medium text-[10px]">Menunggu Jadwal</span>
                        )}
                      </td>

                      {/* Average Score */}
                      <td className="p-4">
                        {p.status === 'COMPLETED' && p.evaluation?.finalAverage ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-display font-bold text-sm text-emerald-600">
                              {p.evaluation.finalAverage}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">/ 100</span>
                          </div>
                        ) : p.status === 'READY_TO_ASSESS' ? (
                          <span className="text-blue-500 font-medium">Ready (Belum dinilai)</span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* Status badge */}
                      <td className="p-4">
                        {p.status === 'PENDING_SCHEDULE' && (
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border border-amber-200">
                            1. Isi Jadwal
                          </span>
                        )}
                        {p.status === 'PENDING_EVIDENCE' && (
                          <span className="bg-orange-100 text-orange-800 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border border-orange-200">
                            2. Kumpul Evidence
                          </span>
                        )}
                        {p.status === 'READY_TO_ASSESS' && (
                          <span className="bg-blue-100 text-blue-800 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border border-blue-200 animate-pulse">
                            3. Siap Ujian
                          </span>
                        )}
                        {p.status === 'COMPLETED' && (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                            4. Selesai
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-center">
                        <button
                          id={`delete-participant-btn-${p.id}`}
                          onClick={() => {
                            if (confirm(`Apakah Anda yakin ingin menghapus nama peserta ${p.name}?`)) {
                              onDeleteParticipant(p.id);
                            }
                          }}
                          className="p-1 px-2 text-rose-500 hover:bg-rose-50 hover:text-rose-700 rounded-lg transition"
                          title="Hapus Peserta"
                        >
                          <Trash2 className="w-3.5 h-3.5 inline" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
