export type ComplaintSource = 'Çözüm Masası' | 'CİMER' | 'Dilekçe' | 'Diğer';

export interface Complaint {
  id?: string;
  observationId?: string;
  source: ComplaintSource;
  otherSourceDescription?: string;
  applicationNumber?: string;
  complaintDate?: string;
  subject?: string;
  description?: string;
  priority?: 'Düşük' | 'Normal' | 'Yüksek' | 'Acil';
  transferredBy?: string;
}

export interface Problem {
  id: string;
  observationId?: string;
  category: string;
  stage: string;
  description: string;
  timeLoss: number;
  severity: number;
  personnelComment?: string;
  createdAt: string;
}

export interface DigitalizationOpportunity {
  id: string;
  observationId?: string;
  description: string;
  currentProcess: string;
  proposedSolution: string;
  benefits: string[];
  priority: number;
  createdAt: string;
}

export interface Photo {
  id: string;
  observationId?: string;
  timestamp: string;
  latitude?: number;
  longitude?: number;
  fileReference?: string; // base64 or blob id
  processMatching?: string;
}

export interface Observation {
  id: string;
  date: string;
  time: string;
  team: string;
  observer: string;
  taskType: string;
  taskSource?: string;
  taskGivenBy: string;
  taskDeliveryMethod?: string;
  taskInformation: string[];
  dispatchDuration: number;

  departureLocation?: string;
  departureCoordinates?: { lat: number; lng: number };
  location?: string; // Varış konumu
  locationCoordinates?: { lat: number; lng: number };
  arrivalMethod?: string;
  arrivalProblem?: boolean;
  arrivalProblemDescription?: string;
  arrivalProblemTimeLoss?: number;

  firstAction?: string;
  checkedInfo?: string[];
  infoLocation?: string;
  inspectionChecklist: string[];
  customChecklistItems?: string[];

  hasPhotos?: boolean;
  photoCount?: number;
  photosWhereSaved?: string;
  photoProcessMatching?: string;
  photoLocationImportant?: string;
  otherEvidence?: string[];

  reportRequired?: boolean;
  reportPreparation?: string;
  reportContent?: string;
  signatureRequired?: boolean;
  whoSigns?: string;
  howSigned?: string;
  reportDestination?: string;

  result?: string;
  whoApproves?: string;
  transferredToOtherDept?: boolean;
  otherDeptName?: string;
  citizenInformed?: boolean;
  howCitizenInformed?: string;

  status: 'draft' | 'completed';
  createdAt: string;
  updatedAt: string;

  // Draft related fields for wizard
  complaintData?: Partial<Complaint>;
  otherFields?: Record<string, string>;

  // Genel notlar
  notes?: string;
}

export interface Note {
  id: string;
  text: string;
  createdAt: string;
}
