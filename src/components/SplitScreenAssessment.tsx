import React, { useState } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Award, 
  Sliders, 
  Layers, 
  MessageSquare, 
  Send,
  Sparkles,
  Info,
  Calendar,
  Layers as SlideIcon
} from 'lucide-react';
import { Participant, UserRole } from '../types';

interface SplitScreenAssessmentProps {
  participant: Participant;
  currentRole: UserRole;
  activeUserId: string;
  onClose: () => void;
  onSubmitEvaluation: (
    pId: string, 
    role: UserRole, 
    scores: { technical: number; communication: number; visual: number; professionalism: number }, 
    notes: string
  ) => void;
}

export default function SplitScreenAssessment({
  participant,
  currentRole,
  activeUserId,
  onClose,
  onSubmitEvaluation
}: SplitScreenAssessmentProps) {
  
  // Slide reader index pointer
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Initialize scores depending on active user's existing scores if any
  const isRM = currentRole === 'RM';
  const existingScores = isRM 
    ? participant.evaluation?.rmScore 
    : participant.evaluation?.assessorScore;

  const existingNotes = isRM 
    ? participant.evaluation?.rmNotes 
    : participant.evaluation?.assessorNotes;

  // Rating values
  const [techVal, setTechVal] = useState(existingScores && existingScores.technical > 0 ? existingScores.technical : 85);
  const [commVal, setCommVal] = useState(existingScores && existingScores.communication > 0 ? existingScores.communication : 78);
  const [visVal, setVisVal] = useState(existingScores && existingScores.visual > 0 ? existingScores.visual : 92);
  const [profVal, setProfVal] = useState(existingScores && existingScores.professionalism > 0 ? existingScores.professionalism : 80);
  const [feedbackNotes, setFeedbackNotes] = useState(existingNotes || 'Very clear understanding of technical bottlenecks. Could improve response time during Q&A session.');

  // Slide content references
  const slides = participant.evidenceFile?.slides || [
    "Slide 1: Gacoan Store Management Audit\nPresented by: " + participant.name + "\nNIK: " + participant.nik,
    "Slide 2: Audit Masalah & Analisis\n- Laporan antrean puncak\n- Persediaan bahan baku",
    "Slide 3: Solusi & Standardisasi\n- Penerapan FIFO\n- Penataan crew line",
    "Slide 4: Standardisasi Kebersihan\n- Manual check-sheet\n- Audit rutin",
    "Slide 5: Ringkasan Dampak Finansial\n- Efisiensi 14%"
  ];

  const handleNextSlide = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };

  const handlePrevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackNotes.trim()) {
      alert('Mohon tuliskan testimoni feedback terlebih dahulu!');
      return;
    }

    onSubmitEvaluation(
      participant.id, 
      currentRole, 
      {
        technical: techVal,
        communication: commVal,
        visual: visVal,
        professionalism: profVal
      }, 
      feedbackNotes
    );
    onClose();
  };

  // Live average calculator
  const liveAverage = Number(((techVal + commVal + visVal + profVal) / 4).toFixed(2));

  // Check if partner already graded
  const partnerRole = isRM ? 'Assessor Center' : 'Regional Manager';
  const partnerScores = isRM ? participant.evaluation?.assessorScore : participant.evaluation?.rmScore;
  const partnerNotes = isRM ? participant.evaluation?.assessorNotes : participant.evaluation?.rmNotes;
  const partnerGraded = partnerScores && (partnerScores.technical > 0);

  // Avatar matching the design system
  const seedWord = participant.name.replace(/\s+/g, '');
  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seedWord}`;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex flex-col slide-up" id="split-screen-overlay">
      
      {/* Top bar control bar header */}
      <div className="bg-white border-b border-slate-200 text-slate-800 p-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-sm">LMS</div>
          <div>
            <h1 className="font-bold text-sm leading-none text-slate-900">Technical Skill Assessment Panel</h1>
            <p className="text-[10px] text-slate-500 mt-0.5">Dual Evaluator cross-function calibration platform</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="label-caps">Status</span>
            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">LIVE SESSION</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 px-3 text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded transition cursor-pointer flex items-center gap-1.5"
            id="btn-close-splitscreen"
          >
            <X className="w-3.5 h-3.5" />
            <span>Close Mode Split</span>
          </button>
        </div>
      </div>

      {/* Main split-screen canvas body */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-[#F8FAFC]">
        
        {/* Left Side: PPT Reader + Candidate bar (Takes 60% of width on lg screens) */}
        <div className="flex-1 flex flex-col p-4 justify-between overflow-y-auto min-h-0 gap-4">
          
          {/* Candidate Profile Form-Card based on Design Theme style */}
          <div className="form-card p-3 rounded-xl flex items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 bg-slate-200 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                <img src={avatarUrl} alt="Candidate" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div>
                <span className="label-caps">Candidate</span>
                <h2 className="text-base font-bold text-slate-900 leading-tight">{participant.name}</h2>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">ID: {participant.id} &bull; NIK: {participant.nik}</p>
              </div>
            </div>
            
            <div className="flex gap-6">
              <div className="text-right">
                <p className="label-caps text-slate-500">Regional Manager</p>
                <p className="text-xs font-semibold text-blue-600">{participant.assignedRMName}</p>
              </div>
              <div className="text-right border-l pl-4 border-slate-200">
                <p className="label-caps text-slate-500">Assessor</p>
                <p className="text-xs font-semibold text-emerald-600">{participant.assignedAssessorName}</p>
              </div>
            </div>
          </div>

          {/* PPT Slides presentation viewer - Designed matching High Density theme */}
          <div className="ppt-placeholder flex-1 rounded-xl relative flex flex-col justify-between border-4 border-slate-800 shadow-2xl p-6 select-none min-h-[250px]">
            
            {/* Top PPT Watermark */}
            <div className="w-full text-slate-400 text-[9px] font-mono tracking-wider uppercase flex items-center justify-between border-b border-slate-800/60 pb-2">
              <span className="truncate">File: {participant.evidenceFile?.name || 'Technical_Presentation_v2.ppt'}</span>
              <span className="text-blue-400 font-bold">Gacoan Slide Preview</span>
            </div>

            {/* Corner Logo */}
            <div className="absolute top-14 right-6 flex items-center gap-1.5 opacity-40">
              <span className="w-4 h-4 rounded-md bg-blue-600 flex items-center justify-center text-[8px] font-black text-white">G</span>
              <span className="text-[8px] font-mono text-slate-400">GACOAN ACADEMY</span>
            </div>

            {/* Slide presentation body content */}
            <div className="flex-1 flex flex-col justify-center py-4">
              <div className="text-white font-sans font-extrabold text-base md:text-lg lg:text-xl leading-snug tracking-tight text-center max-w-2xl mx-auto">
                {slides[currentSlideIndex].split('\n')[0]}
              </div>
              
              <div className="mt-4 text-slate-300 text-xs md:text-sm whitespace-pre-line max-w-lg mx-auto text-center font-mono leading-relaxed bg-slate-900/40 p-3 rounded-lg border border-slate-800/40">
                {slides[currentSlideIndex].split('\n').slice(1).join('\n')}
              </div>
            </div>

            {/* Slide pagination floating selector inside Slide Frame */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[9px] font-mono text-slate-500">
              <span>Presenter: {participant.name}</span>
              <div className="bg-black/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-3 text-white">
                <button 
                  type="button"
                  onClick={handlePrevSlide}
                  disabled={currentSlideIndex === 0}
                  className="hover:text-blue-400 opacity-80 disabled:opacity-30 disabled:hover:text-white transition cursor-pointer"
                >
                  &larr; Prev
                </button>
                <span className="font-mono">{currentSlideIndex + 1} / {slides.length}</span>
                <button 
                  type="button"
                  onClick={handleNextSlide}
                  disabled={currentSlideIndex === slides.length - 1}
                  className="hover:text-blue-400 opacity-80 disabled:opacity-30 disabled:hover:text-white transition cursor-pointer"
                >
                  Next &rarr;
                </button>
              </div>
              <span>Slide Count: {slides.length}</span>
            </div>
          </div>

          {/* Bottom candidate notes or attachment status elements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 shrink-0">
            <div className="form-card p-3 rounded-lg border-l-4 border-l-blue-500">
              <p className="label-caps">Candidate Notes</p>
              <p className="text-xs italic mt-1 text-slate-600 font-medium">
                "{participant.department} division program analysis & regional team synergy."
              </p>
            </div>
            <div className="form-card p-3 rounded-lg">
              <p className="label-caps">Evidence Attachment</p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <div className="px-1.5 py-0.5 bg-slate-100 rounded text-[9px] font-bold font-mono text-slate-700">PPTX ({participant.evidenceFile?.slideCount || slides.length} PPTs)</div>
                <div className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[9px] font-bold font-mono">VERIFIED</div>
                <div className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[9px] font-bold font-mono">{participant.evidenceFile?.size || '4.2 MB'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Score Input Form Card (Takes 40% of page on lg screens) */}
        <div className="w-full lg:w-[440px] border-t lg:border-t-0 lg:border-l border-slate-200 bg-white flex flex-col overflow-hidden shrink-0">
          
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex justify-between items-center shrink-0">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-blue-600" />
              Assessment Scorecard
            </h3>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
              <span>RM</span>
              <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
              <span className="ml-1">AC</span>
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between overflow-y-auto p-4 space-y-4" id="dual-scoring-sheet">
            <div className="space-y-4">
              
              {/* Guidelines helper text */}
              <div className="p-2.5 bg-blue-50/70 border border-blue-100 rounded-lg text-[11px] leading-normal flex items-start gap-1.5 text-slate-700">
                <Info className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  Acting as: <strong className="text-blue-800 font-bold">{isRM ? 'Regional Manager' : 'Academy Assessor'}</strong>. Fill the grades (1-100) using sliders or by typing in the input boxes below.
                </div>
              </div>

              {/* Dynamic Grids matching High Density criteria styles */}
              <div className="space-y-3">
                {/* Score field 1 */}
                <div className="space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <div className="flex justify-between items-end">
                    <p className="text-xs font-bold text-slate-850">A. Technical & Pemahaman</p>
                    <span className="text-[9px] text-slate-400 font-bold font-mono">Weight: 40%</span>
                  </div>
                  <div className="grid grid-cols-[1fr_56px] gap-3 items-center">
                    <input
                      type="range" min="1" max="100" value={techVal}
                      onChange={(e) => setTechVal(Number(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer h-1"
                      required
                    />
                    <input 
                      type="number" min="1" max="100" value={techVal}
                      onChange={(e) => {
                        let val = Number(e.target.value);
                        if (val > 100) val = 100;
                        if (val < 1) val = 1;
                        setTechVal(val);
                      }}
                      className="input-box text-center text-blue-600 w-full"
                    />
                  </div>
                </div>

                {/* Score field 2 */}
                <div className="space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <div className="flex justify-between items-end">
                    <p className="text-xs font-bold text-slate-850">B. Kemampuan Komunikasi</p>
                    <span className="text-[9px] text-slate-400 font-bold font-mono">Weight: 20%</span>
                  </div>
                  <div className="grid grid-cols-[1fr_56px] gap-3 items-center">
                    <input
                      type="range" min="1" max="100" value={commVal}
                      onChange={(e) => setCommVal(Number(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer h-1"
                      required
                    />
                    <input 
                      type="number" min="1" max="100" value={commVal}
                      onChange={(e) => {
                        let val = Number(e.target.value);
                        if (val > 100) val = 100;
                        if (val < 1) val = 1;
                        setCommVal(val);
                      }}
                      className="input-box text-center text-blue-600 w-full"
                    />
                  </div>
                </div>

                {/* Score field 3 */}
                <div className="space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <div className="flex justify-between items-end">
                    <p className="text-xs font-bold text-slate-850">C. Visual & Penyampaian</p>
                    <span className="text-[9px] text-slate-400 font-bold font-mono">Weight: 20%</span>
                  </div>
                  <div className="grid grid-cols-[1fr_56px] gap-3 items-center">
                    <input
                      type="range" min="1" max="100" value={visVal}
                      onChange={(e) => setVisVal(Number(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer h-1"
                      required
                    />
                    <input 
                      type="number" min="1" max="100" value={visVal}
                      onChange={(e) => {
                        let val = Number(e.target.value);
                        if (val > 100) val = 100;
                        if (val < 1) val = 1;
                        setVisVal(val);
                      }}
                      className="input-box text-center text-blue-600 w-full"
                    />
                  </div>
                </div>

                {/* Score field 4 */}
                <div className="space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <div className="flex justify-between items-end">
                    <p className="text-xs font-bold text-slate-850">D. Profesionalisme</p>
                    <span className="text-[9px] text-slate-400 font-bold font-mono">Weight: 20%</span>
                  </div>
                  <div className="grid grid-cols-[1fr_56px] gap-3 items-center">
                    <input
                      type="range" min="1" max="100" value={profVal}
                      onChange={(e) => setProfVal(Number(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer h-1"
                      required
                    />
                    <input 
                      type="number" min="1" max="100" value={profVal}
                      onChange={(e) => {
                        let val = Number(e.target.value);
                        if (val > 100) val = 100;
                        if (val < 1) val = 1;
                        setProfVal(val);
                      }}
                      className="input-box text-center text-blue-600 w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Feedback text notes */}
              <div className="space-y-1 bg-white p-2.5 border border-slate-200 rounded-lg">
                <p className="label-caps">Assessor Qualitative Feedback</p>
                <textarea
                  rows={3}
                  placeholder="Enter feedback here to explain strengths, challenges & recommendations..."
                  value={feedbackNotes}
                  onChange={(e) => setFeedbackNotes(e.target.value)}
                  className="w-full text-xs p-2 border rounded border-slate-200 text-slate-800 bg-slate-50 focus:bg-white focus:outline-none"
                  required
                />
              </div>

              {/* Partner evaluation status */}
              <div className="form-card p-2.5 rounded-lg bg-slate-50/75 text-xs text-slate-600">
                <span className="label-caps text-slate-500 mb-1">Co-Partner Status ({partnerRole})</span>
                {partnerGraded ? (
                  <div className="text-[11px]">
                    <span className="text-emerald-700 font-bold flex items-center gap-1">✓ Graded Successful</span>
                    <p className="text-slate-500 italic leading-snug mt-0.5">{partnerNotes}</p>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400 italic">Waiting for co-partner to complete scoring.</div>
                )}
              </div>
            </div>

            {/* Bottom composite summation section */}
            <div className="mt-auto bg-slate-900 text-white p-4 rounded-xl space-y-3.5 shrink-0">
              <div className="flex justify-between items-center">
                <div>
                  <span className="label-caps text-slate-400">Current Composite</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-mono font-black text-white">{liveAverage}</span>
                    <span className="text-[10px] text-emerald-400 font-semibold font-mono">/ 100.0</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="label-caps text-slate-400">Section status</span>
                  <span className="text-[11px] text-blue-300 font-bold font-mono">75% Evaluated</span>
                </div>
              </div>

              <button
                id="splitscreen-btn-submit"
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow"
              >
                <Send className="w-3.5 h-3.5" />
                <span>SUBMIT FINAL EVALUATION</span>
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
