import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import AdminDashboard from './components/AdminDashboard';
import RMDashboard from './components/RMDashboard';
import AssessorDashboard from './components/AssessorDashboard';
import PesertaDashboard from './components/PesertaDashboard';
import SplitScreenAssessment from './components/SplitScreenAssessment';
import NotificationCenter from './components/NotificationCenter';

import { 
  Participant, 
  RMUser, 
  AssessorUser, 
  NotificationLog, 
  UserRole 
} from './types';

import { 
  INITIAL_RMS, 
  INITIAL_ASSESSORS, 
  INITIAL_PARTICIPANTS, 
  INITIAL_NOTIFICATIONS,
  MOCK_SLIDES_TEMPLATES
} from './data';

export default function App() {
  
  // 1. Core LMS Database State Hooks loading from localStorage or standard template fallback
  const [rms, setRms] = useState<RMUser[]>(() => {
    const saved = localStorage.getItem('LMS_COMPETENCY_RMS');
    return saved ? JSON.parse(saved) : INITIAL_RMS;
  });

  const [assessors, setAssessors] = useState<AssessorUser[]>(() => {
    const saved = localStorage.getItem('LMS_COMPETENCY_ASSESSORS');
    return saved ? JSON.parse(saved) : INITIAL_ASSESSORS;
  });

  const [participants, setParticipants] = useState<Participant[]>(() => {
    const saved = localStorage.getItem('LMS_COMPETENCY_PARTICIPANTS');
    return saved ? JSON.parse(saved) : INITIAL_PARTICIPANTS;
  });

  const [notifications, setNotifications] = useState<NotificationLog[]>(() => {
    const saved = localStorage.getItem('LMS_COMPETENCY_NOTIFICATIONS');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  // 2. Client navigation & persona states
  const [currentRole, setCurrentRole] = useState<UserRole>('ADMIN');
  const [selectedUserId, setSelectedUserId] = useState<string>(''); // Used for RM selected, Assessor selected or Active Peserta
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // 3. Live split-screen assessment state
  const [splitScreenParticipantId, setSplitScreenParticipantId] = useState<string | null>(null);

  // 4. Persistence backup runner
  useEffect(() => {
    localStorage.setItem('LMS_COMPETENCY_RMS', JSON.stringify(rms));
    localStorage.setItem('LMS_COMPETENCY_ASSESSORS', JSON.stringify(assessors));
    localStorage.setItem('LMS_COMPETENCY_PARTICIPANTS', JSON.stringify(participants));
    localStorage.setItem('LMS_COMPETENCY_NOTIFICATIONS', JSON.stringify(notifications));
  }, [rms, assessors, participants, notifications]);

  // Count unread notifications helper
  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  // 5. Utility action functions
  
  // A. Admin adds a new participant and assigns cross-function team
  const handleAddParticipant = (pData: Omit<Participant, 'id' | 'status'>) => {
    const newId = 'P' + String(participants.length + 100).padStart(3, '0');
    const newParticipant: Participant = {
      ...pData,
      id: newId,
      status: 'PENDING_SCHEDULE'
    };

    setParticipants(prev => [newParticipant, ...prev]);

    // Push automated system notification to the assigned RM
    const newLog: NotificationLog = {
      id: 'n-new-' + Date.now(),
      userId: pData.assignedRMId,
      userName: pData.assignedRMName,
      role: 'RM',
      title: 'Tugas Penjadwalan Baru',
      message: `${pData.name} (${pData.nik}) telah ditugaskan kepada Anda. Silakan isi slot jadwal presentasi Anda.`,
      timestamp: new Date().toISOString(),
      isRead: false,
      type: 'WARNING'
    };

    setNotifications(prev => [newLog, ...prev]);
  };

  // A2. Admin adds multiple participants in bulk (Excel/CSV mode)
  const handleAddParticipantsBulk = (pDataArray: Omit<Participant, 'id' | 'status'>[]) => {
    const newParticipantsArray: Participant[] = [];
    const newLogs: NotificationLog[] = [];

    pDataArray.forEach((pData, index) => {
      const newId = 'P' + String(participants.length + 100 + index).padStart(3, '0');
      const newParticipant: Participant = {
        ...pData,
        id: newId,
        status: 'PENDING_SCHEDULE'
      };
      newParticipantsArray.push(newParticipant);

      // Automated system notification to the assigned RM
      newLogs.push({
        id: 'n-new-bulk-' + Date.now() + '-' + index,
        userId: pData.assignedRMId,
        userName: pData.assignedRMName,
        role: 'RM',
        title: 'Tugas Penjadwalan Baru (Massal)',
        message: `${pData.name} (${pData.nik}) telah ditugaskan kepada Anda secara massal. Silakan isi slot jadwal presentasi Anda.`,
        timestamp: new Date().toISOString(),
        isRead: false,
        type: 'WARNING'
      });
    });

    setParticipants(prev => [...newParticipantsArray, ...prev]);
    setNotifications(prev => [...newLogs, ...prev]);
  };

  // B. Delete a participant profile
  const handleDeleteParticipant = (id: string) => {
    setParticipants(prev => prev.filter(p => p.id !== id));
  };

  // C. Update participants evaluator team
  const handleUpdateParticipantEvaluator = (pId: string, rmId: string, assessorId: string) => {
    const matchedRM = rms.find(r => r.id === rmId);
    const matchedAssessor = assessors.find(a => a.id === assessorId);

    setParticipants(prev => prev.map(p => {
      if (p.id === pId) {
        return {
          ...p,
          assignedRMId: rmId,
          assignedRMName: matchedRM ? matchedRM.name : p.assignedRMName,
          assignedAssessorId: assessorId,
          assignedAssessorName: matchedAssessor ? matchedAssessor.name : p.assignedAssessorName
        };
      }
      return p;
    }));
  };

  // D. RM schedule slot selection
  const handleSetSchedule = (pId: string, date: string, timeSlot: string) => {
    setParticipants(prev => prev.map(p => {
      if (p.id === pId) {
        return {
          ...p,
          scheduleDate: date,
          scheduleTimeSlot: timeSlot,
          status: 'PENDING_EVIDENCE'
        };
      }
      return p;
    }));

    // Find the participant to customized alert message
    const targetPart = participants.find(p => p.id === pId);
    if (targetPart) {
      // Alert targeting active participant to submit slide evidence
      const newLog: NotificationLog = {
        id: 'n-sched-' + Date.now(),
        userId: targetPart.id,
        userName: targetPart.name,
        role: 'PESERTA',
        title: 'Jadwal Konfirmasi: Kumpul Evidence',
        message: `Sesi presentasi Anda telah dijadwalkan pada ${date} pukul ${timeSlot}. Segera unggah/submit file PowerPoint Anda sebelum dimulai.`,
        timestamp: new Date().toISOString(),
        isRead: false,
        type: 'INFO'
      };
      setNotifications(prev => [newLog, ...prev]);
    }
  };

  // E. Peserta uploads PPT/PDF evidence (Simulated upload action)
  const handleUploadEvidence = (pId: string, fileName: string, fileSize: string) => {
    // Select standard template content based on name or random
    const randTmp = fileName.toLowerCase().includes('supply') ? MOCK_SLIDES_TEMPLATES.advanced : MOCK_SLIDES_TEMPLATES.standard;
    const activePart = participants.find(p => p.id === pId);
    const resolvedName = activePart ? activePart.name : 'Peserta Gacoan';
    const resolvedNik = activePart ? activePart.nik : 'GAC-2026';

    const cleanSlides = randTmp.map(s => s.replace('{name}', resolvedName).replace('{nik}', resolvedNik));

    setParticipants(prev => prev.map(p => {
      if (p.id === pId) {
        return {
          ...p,
          status: 'READY_TO_ASSESS', // Progress to Ready state
          evidenceFile: {
            name: fileName,
            uploadedAt: new Date().toISOString(),
            size: fileSize,
            slideCount: cleanSlides.length,
            slides: cleanSlides
          }
        };
      }
      return p;
    }));

    // Dispatch notification to RM and Assessor warning them PPT is ready
    if (activePart) {
      const rmLog: NotificationLog = {
        id: 'n-ppt-rm-' + Date.now(),
        userId: activePart.assignedRMId,
        userName: activePart.assignedRMName,
        role: 'RM',
        title: 'LMS Evidence Tersubmit',
        message: `${resolvedName} telah mengunggah file presentasi ${fileName}. Sesi siap dinilai.`,
        timestamp: new Date().toISOString(),
        isRead: false,
        type: 'SUCCESS'
      };

      const asLog: NotificationLog = {
        id: 'n-ppt-as-' + Date.now(),
        userId: activePart.assignedAssessorId,
        userName: activePart.assignedAssessorName,
        role: 'ASSESSOR',
        title: 'LMS Evidence Tersubmit',
        message: `${resolvedName} telah mengunggah file presentasi ${fileName}. Sesi siap dinilai.`,
        timestamp: new Date().toISOString(),
        isRead: false,
        type: 'SUCCESS'
      };

      setNotifications(prev => [rmLog, asLog, ...prev]);
    }
  };

  // F. RM/Assessor submits evaluation scores (Scale 1-100)
  const handleSubmitEvaluation = (
    pId: string, 
    role: UserRole, 
    scores: { technical: number; communication: number; visual: number; professionalism: number }, 
    notes: string
  ) => {
    setParticipants(prev => prev.map(p => {
      if (p.id === pId) {
        const currentEval = p.evaluation || {
          rmScore: { technical: 0, communication: 0, visual: 0, professionalism: 0 },
          rmNotes: '',
          assessorScore: { technical: 0, communication: 0, visual: 0, professionalism: 0 },
          assessorNotes: ''
        };

        if (role === 'RM') {
          currentEval.rmScore = scores;
          currentEval.rmNotes = notes;
          currentEval.rmCompletedAt = new Date().toISOString();
        } else if (role === 'ASSESSOR') {
          currentEval.assessorScore = scores;
          currentEval.assessorNotes = notes;
          currentEval.assessorCompletedAt = new Date().toISOString();
        }

        // Determine if both RM and Certified Assessor have scored
        const hasRM = currentEval.rmScore.technical > 0;
        const hasAs = currentEval.assessorScore.technical > 0;

        let resolvedStatus = p.status;
        let resolvedAvg = currentEval.finalAverage;

        if (hasRM && hasAs) {
          resolvedStatus = 'COMPLETED';
          // Calculate average of the average rating of both advisors
          const rmAvg = (currentEval.rmScore.technical + currentEval.rmScore.communication + currentEval.rmScore.visual + currentEval.rmScore.professionalism) / 4;
          const asAvg = (currentEval.assessorScore.technical + currentEval.assessorScore.communication + currentEval.assessorScore.visual + currentEval.assessorScore.professionalism) / 4;
          resolvedAvg = Number(((rmAvg + asAvg) / 2).toFixed(1));
        }

        return {
          ...p,
          status: resolvedStatus,
          evaluation: {
            ...currentEval,
            finalAverage: resolvedAvg
          }
        };
      }
      return p;
    }));

    // Broadcast completed events log if both finished
    const partObj = participants.find(part => part.id === pId);
    if (partObj) {
      const isPartnerGraded = role === 'RM' 
        ? (partObj.evaluation?.assessorScore && partObj.evaluation.assessorScore.technical > 0)
        : (partObj.evaluation?.rmScore && partObj.evaluation.rmScore.technical > 0);

      if (isPartnerGraded) {
        // Trigger complete notice
        const newLog: NotificationLog = {
          id: 'n-comp-' + Date.now(),
          userId: partObj.id,
          userName: partObj.name,
          role: 'PESERTA',
          title: 'Hasil Sertifikasi Terbit!',
          message: `Selamat! Kedua penguji Anda (RM & Assessor) telah merampungkan penginputan nilai. Silakan lihat hasil rekapitulasi Anda.`,
          timestamp: new Date().toISOString(),
          isRead: false,
          type: 'SUCCESS'
        };
        setNotifications(prev => [newLog, ...prev]);
      }
    }
  };

  // G. Trigger manual Meeting H-1 Notification Reminder
  const handleTriggerMockReminder = () => {
    // Generate notification targeting active RM and active Assessor mimicking: "Reminder meeting ke RM dan Assessor 1 hari sebelum sesi dimulai."
    const testPart = participants.find(p => p.status === 'READY_TO_ASSESS') || participants[0];
    
    const rmReminder: NotificationLog = {
      id: 'n-h1-rm-' + Date.now(),
      userId: testPart.assignedRMId,
      userName: testPart.assignedRMName,
      role: 'RM',
      title: '🚨 Reminder H-1 Sesi Presentasi',
      message: `Pengingat: Sesi Technical & Presentation skill untuk ${testPart.name} akan dilaksanakan besok. Mohon siapkan lembar evaluasi Anda.`,
      timestamp: new Date().toISOString(),
      isRead: false,
      type: 'WARNING'
    };

    const asReminder: NotificationLog = {
      id: 'n-h1-as-' + Date.now(),
      userId: testPart.assignedAssessorId,
      userName: testPart.assignedAssessorName,
      role: 'ASSESSOR',
      title: '🚨 Reminder H-1 Sesi Presentasi',
      message: `Pengingat: Sesi Technical & Presentation skill untuk ${testPart.name} akan dilaksanakan besok. Mohon siapkan lembar evaluasi Anda.`,
      timestamp: new Date().toISOString(),
      isRead: false,
      type: 'WARNING'
    };

    setNotifications(prev => [rmReminder, asReminder, ...prev]);
    alert("Berhasil memicu Notifikasi Reminder H-1 Rapat! Silakan periksa Log Notifikasi.");
    setActiveTab('notifications');
  };

  // Notification tools
  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  // Reset database state back to defaults
  const handleRestoreDefaults = () => {
    if (confirm("Kembalikan data stimulasi ke awal? Semua penambahan/perubahan Anda akan diset ulang.")) {
      localStorage.removeItem('LMS_COMPETENCY_RMS');
      localStorage.removeItem('LMS_COMPETENCY_ASSESSORS');
      localStorage.removeItem('LMS_COMPETENCY_PARTICIPANTS');
      localStorage.removeItem('LMS_COMPETENCY_NOTIFICATIONS');
      setRms(INITIAL_RMS);
      setAssessors(INITIAL_ASSESSORS);
      setParticipants(INITIAL_PARTICIPANTS);
      setNotifications(INITIAL_NOTIFICATIONS);
      setCurrentRole('ADMIN');
      setSelectedUserId('');
      setActiveTab('dashboard');
      alert("Database stimulasi Gacoan Academy berhasil diset ulang!");
    }
  };

  // 6. Router dispatcher selecting active screen
  const renderMainContent = () => {
    if (activeTab === 'notifications') {
      return (
        <NotificationCenter
          notifications={notifications}
          onMarkAsRead={handleMarkAsRead}
          onClearAll={handleClearNotifications}
          onTriggerMockReminder={handleTriggerMockReminder}
        />
      );
    }

    switch (currentRole) {
      case 'ADMIN':
        return (
          <AdminDashboard
            participants={participants}
            rms={rms}
            assessors={assessors}
            onAddParticipant={handleAddParticipant}
            onAddParticipantsBulk={handleAddParticipantsBulk}
            onDeleteParticipant={handleDeleteParticipant}
            onUpdateParticipantEvaluator={handleUpdateParticipantEvaluator}
          />
        );
      case 'RM':
        return (
          <RMDashboard
            activeRMId={selectedUserId}
            participants={participants}
            rms={rms}
            onSetSchedule={handleSetSchedule}
            onLaunchSplitScreen={setSplitScreenParticipantId}
            onSubmitInlineEvaluation={(pId, scores, notes) => handleSubmitEvaluation(pId, 'RM', scores, notes)}
          />
        );
      case 'ASSESSOR':
        return (
          <AssessorDashboard
            activeAssessorId={selectedUserId}
            participants={participants}
            assessors={assessors}
            onLaunchSplitScreen={setSplitScreenParticipantId}
            onSubmitInlineEvaluation={(pId, scores, notes) => handleSubmitEvaluation(pId, 'ASSESSOR', scores, notes)}
          />
        );
      case 'PESERTA':
        return (
          <PesertaDashboard
            activePesertaId={selectedUserId}
            participants={participants}
            onUploadEvidence={handleUploadEvidence}
          />
        );
    }
  };

  // Detect split-screen target participant
  const targetSplitScreenParticipant = participants.find(p => p.id === splitScreenParticipantId);

  return (
    <div className="flex bg-[#f8fafc] min-h-screen font-sans antialiased text-[#1e293b]" id="app-wrapper">
      
      {/* 1. LMS Left Nav Bar conforming to UI Design specifications */}
      <Sidebar
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        selectedUserId={selectedUserId}
        setSelectedUserId={setSelectedUserId}
        rms={rms}
        assessors={assessors}
        participants={participants}
        notificationsCount={unreadNotificationsCount}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* 2. Right Side view: Header + Dynamic Body Canvas */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        
        {/* Dynamic header navigation */}
        <Header
          currentRole={currentRole}
          selectedUserId={selectedUserId}
          rms={rms}
          assessors={assessors}
          participants={participants}
          notificationsCount={unreadNotificationsCount}
          activeTab={activeTab}
          onOpenNotifications={() => setActiveTab('notifications')}
        />

        {/* Core display area container */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto overflow-y-auto space-y-6">
          
          {/* Dynamic dashboard content */}
          {renderMainContent()}

          {/* Quick instructions and Reset Utility at the foot */}
          <div className="pt-8 border-t border-slate-150 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 font-medium">
            <span>© 2026 Gacoan Academy LMS System. Built for Dual Evaluator cross-function calibration.</span>
            <button
              onClick={handleRestoreDefaults}
              className="mt-2 sm:mt-0 text-[10px] text-slate-400 hover:text-red-500 hover:underline transition font-semibold cursor-pointer"
              title="Reset data demo ke pengaturan semula"
            >
              [⚠️ Kembalikan Data Awal]
            </button>
          </div>
        </main>
      </div>

      {/* 3. Immersive Live Split-Screen assessment board Modal overlay */}
      {splitScreenParticipantId && targetSplitScreenParticipant && (
        <SplitScreenAssessment
          participant={targetSplitScreenParticipant}
          currentRole={currentRole}
          activeUserId={selectedUserId}
          onClose={() => setSplitScreenParticipantId(null)}
          onSubmitEvaluation={(pId, role, scores, notes) => {
            handleSubmitEvaluation(pId, role, scores, notes);
            setSplitScreenParticipantId(null);
          }}
        />
      )}
    </div>
  );
}
