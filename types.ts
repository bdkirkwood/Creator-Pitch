export type LeadStage = 'Lead' | 'Pitch' | 'Negotiation' | 'Contract' | 'Invoice' | 'Paid' | 'Lost';

export interface Lead {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  stage: LeadStage;
  value: number;
  lastContacted: string; // ISO date string
  notes: string;
  isArchived: boolean;
  originalStage?: LeadStage;
  emailThreadLink?: string;
  prFirmName?: string;
  invoiceLink?: string;
  invoiceDueDate?: string; // ISO date string
}

export interface CreatorSettings {
  fullName: string;
  pronouns: string;
  bio: string;
  location: string;
  niche: string;
  usp: string; // Unique Selling Proposition
  brandVoiceKeywords: string;
  professionalTitle: string;
  platformHandles: string[];
  totalFollowers: number;
  demographics: {
    topCountries: string;
    ages: string;
    genderSplit: string;
  };
  contentStyleKeywords: string;
  pastCollaborations: string;
  tonePreference: string;
  formality: string;
  signatureStyle: string;
  emailPersonaExamples: string;
}