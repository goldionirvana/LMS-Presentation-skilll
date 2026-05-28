import { Participant, RMUser, AssessorUser, NotificationLog } from './types';

export const INITIAL_RMS: RMUser[] = [
  { id: 'RM-001', name: 'Budi Santoso', department: 'Operations Jawa Timur' },
  { id: 'RM-002', name: 'Siti Rahma', department: 'Operations Jawa Barat' },
  { id: 'RM-003', name: 'Joko Susilo', department: 'Operations DKI Jakarta' },
  { id: 'RM-004', name: 'Lina Wijaya', department: 'Operations Jawa Tengah' }
];

export const INITIAL_ASSESSORS: AssessorUser[] = [
  { id: 'AS-001', name: 'Ahmad Fauzi', department: 'Gacoan Learning Academy' },
  { id: 'AS-002', name: 'Rian Pratama', department: 'Gacoan Learning Academy' },
  { id: 'AS-003', name: 'Indah Lestari', department: 'People Development' },
  { id: 'AS-004', name: 'Ferry Hermawan', department: 'Quality Assurance Academy' }
];

export const MOCK_SLIDES_TEMPLATES = {
  standard: [
    "Slide 1: Optimization of Store Cleanliness and Service Standards\nPresented by: {name}\nNIK: {nik}\nGacoan Academy Certification Program",
    "Slide 2: Background & Problem Statement\n- High queue times during peak lunch hours: Average 24 minutes.\n- Bottleneck identified in beverage preparation and payment cashier lines.\n- Equipment and workspace layout issues causing friction.",
    "Slide 3: Implementation Strategy & Technical Solution\n- Redesigned Cashier workflow to parallel stations.\n- Implemented preemptive prep scheduling for high-demand menus.\n- Reallocated staff responsibilities with direct visual aids.",
    "Slide 4: Standard Operating Procedures (SOP) Training\n- Visual guides added for all new staff.\n- Cleanliness check matrix updated to 15-minute intervals.\n- Live tracking dashboard of ticket preparation times initiated.",
    "Slide 5: Expected Outcomes & Business Impact\n- Target queue time reduction: down to 14 minutes (41.6% improvement).\n- Estimated table turnover rate: +15% during peak hours.\n- Zero customer escalations regarding speed of service."
  ],
  advanced: [
    "Slide 1: Strategic Inventory Control and Supply Chain Efficiency\nPresented by: {name}\nNIK: {nik}\nGacoan Academy Management Trainee",
    "Slide 2: Current Inventory Dilemmas\n- Buffer inventory variance at 8.4% monthly.\n- Fresh ingredient shelf-life deterioration causing material waste.\n- Storage space constraints in cold storage units.",
    "Slide 3: Actionable Solutions and Standardizations\n- Introduced FIFO barcode scanners.\n- Renegotiated local supplier delivery schedules to 3 times weekly.\n- Enhanced 온도 (Temperature) control logs with automatic IoT telemetry alerts.",
    "Slide 4: Cost Analysis & Efficiency Results\n- Calculated reduction in direct material waste by 18%.\n- Reclaimed warehouse area optimization of 4.5 square meters.\n- Total savings projection: Rp 12.500.000 per month per outlet.",
    "Slide 5: Implementation Timeline & Rollout Plan\n- Phase 1: Pilot store audit (W1-W2)\n- Phase 2: Crew retraining and certification logs (W3)\n- Phase 3: Comprehensive dashboard tracking (W4 onwards)"
  ]
};

export const INITIAL_PARTICIPANTS: Participant[] = [
  {
    id: 'P001',
    name: 'Dimas Adi Nugroho',
    nik: 'GAC-2024-0012',
    department: 'Operations (Store Manager)',
    assignedRMId: 'RM-001',
    assignedRMName: 'Budi Santoso',
    assignedAssessorId: 'AS-001',
    assignedAssessorName: 'Ahmad Fauzi',
    status: 'COMPLETED',
    scheduleDate: '2026-05-25',
    scheduleTimeSlot: '09:00 - 10:30',
    evidenceFile: {
      name: 'Ops_Excellence_Dimas.pptx',
      uploadedAt: '2026-05-24T06:12:00Z',
      size: '4.8 MB',
      slideCount: 5,
      slides: MOCK_SLIDES_TEMPLATES.standard.map(s => s.replace('{name}', 'Dimas Adi Nugroho').replace('{nik}', 'GAC-2024-0012'))
    },
    evaluation: {
      rmScore: { technical: 88, communication: 90, visual: 85, professionalism: 92 },
      rmNotes: 'Dimas menunjukkan keahlian teknis yang sangat baik. Presentasinya sistematis, terutama strategi pemecahan masalah antrean kasir sangat pragmatis dan langsung siap diimplementasikan.',
      rmCompletedAt: '2026-05-25T03:15:00Z',
      assessorScore: { technical: 85, communication: 88, visual: 90, professionalism: 90 },
      assessorNotes: 'Sangat percaya diri dan artikulatif. Desain slide terstruktur dengan data yang sangat valid. Sedikit catatan di estimasi timeline agar diperjelas.',
      assessorCompletedAt: '2026-05-25T03:18:00Z',
      finalAverage: 88.5
    }
  },
  {
    id: 'P002',
    name: 'Siti Aminah',
    nik: 'GAC-2024-0034',
    department: 'Operations (Assistant Store Manager)',
    assignedRMId: 'RM-002',
    assignedRMName: 'Siti Rahma',
    assignedAssessorId: 'AS-002',
    assignedAssessorName: 'Rian Pratama',
    status: 'READY_TO_ASSESS',
    scheduleDate: '2026-05-26',
    scheduleTimeSlot: '13:00 - 14:30',
    evidenceFile: {
      name: 'SupplyChain_SitiAminah.pptx',
      uploadedAt: '2026-05-25T08:30:00Z',
      size: '5.2 MB',
      slideCount: 5,
      slides: MOCK_SLIDES_TEMPLATES.advanced.map(s => s.replace('{name}', 'Siti Aminah').replace('{nik}', 'GAC-2024-0034'))
    },
    evaluation: {
      rmScore: { technical: 0, communication: 0, visual: 0, professionalism: 0 },
      rmNotes: '',
      assessorScore: { technical: 0, communication: 0, visual: 0, professionalism: 0 },
      assessorNotes: ''
    }
  },
  {
    id: 'P003',
    name: 'Rian Hidayat',
    nik: 'GAC-2024-0091',
    department: 'Kitchen Prep (Team Leader)',
    assignedRMId: 'RM-001',
    assignedRMName: 'Budi Santoso',
    assignedAssessorId: 'AS-003',
    assignedAssessorName: 'Indah Lestari',
    status: 'PENDING_EVIDENCE',
    scheduleDate: '2026-05-27',
    scheduleTimeSlot: '10:00 - 11:30'
  },
  {
    id: 'P004',
    name: 'Eka Putri Lestari',
    nik: 'GAC-2024-0104',
    department: 'Service Crew (Trainer)',
    assignedRMId: 'RM-003',
    assignedRMName: 'Joko Susilo',
    assignedAssessorId: 'AS-004',
    assignedAssessorName: 'Ferry Hermawan',
    status: 'PENDING_SCHEDULE'
  },
  {
    id: 'P005',
    name: 'Faisal Akbar',
    nik: 'GAC-2024-0118',
    department: 'Store Supervisor',
    assignedRMId: 'RM-004',
    assignedRMName: 'Lina Wijaya',
    assignedAssessorId: 'AS-001',
    assignedAssessorName: 'Ahmad Fauzi',
    status: 'PENDING_SCHEDULE'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationLog[] = [
  {
    id: 'n-001',
    userId: 'RM-001',
    userName: 'Budi Santoso',
    role: 'RM',
    title: 'Penjadwalan Diperlukan',
    message: 'Anda telah di-assign sebagai Regional Manager untuk Faisal Akbar. Mohon segera mengonfirmasi jadwal slot kosong.',
    timestamp: '2026-05-26T08:00:00Z',
    isRead: false,
    type: 'WARNING'
  },
  {
    id: 'n-002',
    userId: 'P003',
    userName: 'Rian Hidayat',
    role: 'PESERTA',
    title: 'Unggah file PPT Anda!',
    message: 'Jadwal presentasi Anda telah ditetapkan pada 27 Mei 2026. Segera upload file presentasi (evidence) Anda sebelum sesi dimulai.',
    timestamp: '2026-05-26T07:30:00Z',
    isRead: false,
    type: 'INFO'
  },
  {
    id: 'n-003',
    userId: 'AS-001',
    userName: 'Ahmad Fauzi',
    role: 'ASSESSOR',
    title: 'Reminder Sesi Besok',
    message: 'Sesi presentasi untuk Siti Aminah dijadwalkan besok 26 Mei pukul 13:00. Evidence file PPT sudah diunggah oleh peserta.',
    timestamp: '2026-05-25T13:00:00Z',
    isRead: true,
    type: 'INFO'
  }
];
