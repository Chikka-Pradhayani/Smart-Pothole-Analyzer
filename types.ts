
export interface BoundingBox {
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
}

export enum Severity {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High'
}

export interface PotholeDetection {
  id: number;
  box_2d: [number, number, number, number]; // [ymin, xmin, ymax, xmax]
  label: string;
  confidence: number;
  severity: Severity;
}

export interface DetectionResult {
  potholes: PotholeDetection[];
  summary: string;
}

export interface LocationData {
  latitude?: number;
  longitude?: number;
  address?: string;
  timestamp: number;
}

export interface AppState {
  image: string | null;
  isAnalyzing: boolean;
  results: DetectionResult | null;
  location: LocationData | null;
  isLocating: boolean;
  error: string | null;
}
