export interface QuestionItem {
  id: number;
  key: 'q1' | 'q2' | 'q3' | 'q4' | 'q5';
  title: string;
  subtitle: string;
  shortLabel: string;
}

export interface SurveyResponse {
  id: string;
  timestamp: number;
  q1: number;
  q2: number;
  q3: number;
  q4: number;
  q5: number;
  average: number;
  feedback?: string;
  deviceId?: string;
}

export interface DashboardStats {
  totalRespondents: number;
  overallAverage: number;
  interpretation: string;
  questionAverages: number[];
  starDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export type AppView = 'survey' | 'dashboard' | 'code-guide';
