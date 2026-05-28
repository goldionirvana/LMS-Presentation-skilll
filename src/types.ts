export type UserRole = 'ADMIN' | 'RM' | 'ASSESSOR' | 'PESERTA';

export interface Participant {
  id: string;
  name: string;
  nik: string;
  department: string;
  assignedRMId: string;
  assignedRMName: string;
  assignedAssessorId: string;
  assignedAssessorName: string;
  status: 'PENDING_SCHEDULE' | 'PENDING_EVIDENCE' | 'READY_TO_ASSESS' | 'COMPLETED';
  scheduleDate?: string; // Format: YYYY-MM-DD
  scheduleTimeSlot?: string; // Format: HH:MM - HH:MM
  evidenceFile?: {
    name: string;
    uploadedAt: string;
    size: string;
    slideCount: number;
    slides: string[]; // custom mock images or labels for slides
  };
  evaluation?: {
    rmScore: CriteriaScores;
    rmNotes: string;
    rmCompletedAt?: string;
    assessorScore: CriteriaScores;
    assessorNotes: string;
    assessorCompletedAt?: string;
    finalAverage?: number; // Average of RM and Assessor
  };
}

export interface CriteriaScores {
  technical: number; // 1-100
  communication: number; // 1-100
  visual: number; // 1-100
  professionalism: number; // 1-100
}

export interface RMUser {
  id: string;
  name: string;
  department: string;
}

export interface AssessorUser {
  id: string;
  name: string;
  department: string;
}

export interface NotificationLog {
  id: string;
  userId: string;
  userName: string;
  role: UserRole;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  type: 'INFO' | 'WARNING' | 'SUCCESS';
}
