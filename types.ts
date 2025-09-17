export enum Tone {
  PROFESSIONAL = 'Professional',
  CASUAL = 'Casual',
  CONFIDENT = 'Confident',
  FRIENDLY = 'Friendly',
  CONCISE = 'Concise',
  CREATIVE = 'Creative',
  FORMAL = 'Formal',
  INFORMAL = 'Informal',
}

export interface LoadingState {
  correct: boolean;
  enhance: boolean;
  chat: boolean;
}

interface Part {
  text: string;
}

export interface Message {
  role: 'user' | 'model';
  parts: Part[];
}

export interface InteractionHistoryItem {
  id: string;
  type: 'Correction' | 'Enhancement';
  original: string;
  corrected: string;
  tone?: Tone;
  timestamp: string;
}

export type Formatting = 'bold' | 'italic' | 'underline';
