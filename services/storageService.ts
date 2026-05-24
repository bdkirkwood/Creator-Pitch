import { Lead, CreatorSettings, TodoItem } from '../types';
 
// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
// Set APPS_SCRIPT_URL in your .env.local file:
//   APPS_SCRIPT_URL=https://script.google.com/macros/s/<YOUR_SCRIPT_ID>/exec
//
// The Apps Script web app must implement:
//   GET  ?action=getLeads      → JSON Lead[]
//   GET  ?action=getSettings   → JSON CreatorSettings
//   GET  ?action=getTodos      → JSON TodoItem[]
//   POST body: { action: 'saveLeads',    leads: Lead[] }
//   POST body: { action: 'saveSettings', settings: CreatorSettings }
//   POST body: { action: 'saveTodos',    todos: TodoItem[] }
//   POST body: { action: 'clearData' }
// ---------------------------------------------------------------------------
const APPS_SCRIPT_URL: string = process.env.APPS_SCRIPT_URL ?? '';
 
// Onboarding flag stays in localStorage — it's device-specific, not user data.
const ONBOARDING_STORAGE_KEY = 'creator-pitch-onboarding-complete';
 
// ---------------------------------------------------------------------------
// Default / seed data
// ---------------------------------------------------------------------------
const daysFromNow = (days: number) =>
  new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
 
const initialLeads: Lead[] = [
  { id: '1', companyName: 'Innovate Inc.', contactName: 'Alex Johnson', email: 'alex@innovate.com', phone: '123-456-7890', stage: 'Contract', value: 50000, lastContacted: '2023-10-15T10:00:00Z', notes: 'Interested in Q4 campaign. Follow up next week.', isArchived: false, emailThreadLink: 'https://mail.google.com/mail/u/0/#inbox/12345', prFirmName: 'Marketing Masters', agentSplitDisabled: true },
  { id: '2', companyName: 'Solutions Co.', contactName: 'Maria Garcia', email: 'maria@solutions.co', phone: '234-567-8901', stage: 'Pitch', value: 75000, lastContacted: '2023-10-20T14:30:00Z', notes: 'Had initial call. Sent over brochure. Needs pricing.', isArchived: false, agentSplitDisabled: false },
  { id: '3', companyName: 'Creative LLC', contactName: 'David Chen', email: 'david@creative.llc', phone: '345-678-9012', stage: 'Invoice', value: 30000, lastContacted: '2023-10-22T11:00:00Z', notes: 'Proposal sent. Reviewing with their team.', isArchived: false, invoiceLink: 'https://quickbooks.intuit.com/invoice/12345', invoiceDueDate: daysFromNow(2) },
  { id: '4', companyName: 'Tech Forward', contactName: 'Sarah Kim', email: 'sarah@techforward.io', phone: '456-789-0123', stage: 'Negotiation', value: 120000, lastContacted: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), notes: 'Negotiating terms. Wants a 10% discount.', isArchived: false },
  { id: '5', companyName: 'Global Corp', contactName: 'Michael Brown', email: 'michael@global.corp', phone: '567-890-1234', stage: 'Paid', value: 95000, lastContacted: new Date().toISOString(), notes: 'Contract signed. Project kickoff next month.', isArchived: false },
  { id: '6', companyName: 'Market Makers', contactName: 'Jessica Williams', email: 'jess@marketmakers.com', phone: '678-901-2345', stage: 'Lost', value: 60000, lastContacted: '2023-10-18T12:00:00Z', notes: 'Chose a competitor. Budget constraints cited.', isArchived: false },
  { id: '7', companyName: 'Archived Biz', contactName: 'Old Contact', email: 'old@contact.com', phone: '789-012-3456', stage: 'Lost', value: 20000, lastContacted: '2022-01-01T12:00:00Z', notes: 'Deal went cold a long time ago.', isArchived: true, originalStage: 'Negotiation' },
  { id: '8', companyName: 'Past Due Payments', contactName: 'John Doe', email: 'john@pastdue.com', phone: '890-123-4567', stage: 'Invoice', value: 15000, lastContacted: daysFromNow(-30), notes: 'Invoice sent last month.', isArchived: false, invoiceLink: 'https://quickbooks.intuit.com/invoice/67890', invoiceDueDate: daysFromNow(-5) },
];
 
export const initialCreatorSettings: CreatorSettings = {
  fullName: 'Your Name',
  pronouns: 'they/them',
  bio: 'I help tech brands grow their audience through high-quality video content and strategic social media campaigns.',
  location: 'San Francisco, CA, USA',
  niche: 'Tech and AI',
  usp: 'Making complex tech topics accessible to everyone.',
  brandVoiceKeywords: 'Informative, engaging, slightly humorous',
  professionalTitle: 'Content Creator & Strategist',
  socialMediaNetworks: ['YouTube', 'TikTok', 'Instagram'],
  totalFollowers: 150000,
  demographics: {
    topCountries: 'USA, UK, Canada',
    ages: '18-34',
    genderSplit: '60% Male, 40% Female',
  },
  contentStyleKeywords: 'cinematic, educational, fast-paced',
  pastCollaborations: 'Worked with major brands like TechForward and Innovate Inc.',
  tonePreference: 'Friendly',
  formality: 'Conversational',
  signatureStyle: 'Best,\nYour Name',
  emailPersonaExamples: 'Hey [Name], just wanted to follow up on...',
  agentModeEnabled: false,
  agentPercentage: 15,
};
 
const initialTodos: TodoItem[] = [
  { id: 't1', subject: 'Follow up with Innovate Inc.', description: 'Send them the revised contract.', dueDate: daysFromNow(2), isCompleted: false, isArchived: false, order: 1 },
  { id: 't2', subject: 'Prepare pitch deck for Solutions Co.', description: 'Include new case studies and testimonials.', isCompleted: false, isArchived: false, order: 2 },
  { id: 't3', subject: 'Send thank you note to Michael Brown', description: 'Thank him for the quick payment and successful collaboration.', isCompleted: true, completedAt: daysFromNow(-1), isArchived: false, order: 3 },
  { id: 't4', subject: 'Research new brands in the tech niche', description: '', isCompleted: false, isArchived: true, order: 4 },
];
 
// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------
 
/**
 * Performs a GET request to the Apps Script web app.
 * Returns the parsed JSON body, or null on any error / missing URL.
 */
async function sheetsGet<T>(action: string): Promise<T | null> {
  if (!APPS_SCRIPT_URL) return null;
  try {
    const res = await fetch(
      `${APPS_SCRIPT_URL}?action=${encodeURIComponent(action)}&t=${Date.now()}`
    );
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
    return (await res.json()) as T;
  } catch (err) {
    console.error(`[storageService] GET "${action}" failed:`, err);
    return null;
  }
}
 
/**
 * Performs a POST request to the Apps Script web app.
 * Uses Content-Type text/plain to avoid the CORS preflight that
 * application/json would trigger against an Apps Script endpoint.
 */
async function sheetsPost(body: Record<string, unknown>): Promise<void> {
  if (!APPS_SCRIPT_URL) return;
  try {
    const res = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  } catch (err) {
    console.error(`[storageService] POST "${body.action}" failed:`, err);
  }
}
 
// ---------------------------------------------------------------------------
// Onboarding  (localStorage — device-specific flag, not synced to Sheets)
// ---------------------------------------------------------------------------
 
/** Returns true if the user has completed the onboarding flow on this device. */
export const isOnboardingComplete = (): boolean => {
  try {
    return localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
};
 
/** Marks the onboarding flow as complete on this device. */
export const setOnboardingComplete = (): void => {
  try {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
  } catch {
    // Silently ignore (e.g. private-browsing storage quota exceeded)
  }
};
 
// ---------------------------------------------------------------------------
// Leads
// ---------------------------------------------------------------------------
 
/**
 * Loads leads from Google Sheets via Apps Script.
 * Falls back to seed data (post-onboarding) or an empty array if the URL is
 * not configured or the request fails.
 */
export const loadLeads = async (): Promise<Lead[]> => {
  const data = await sheetsGet<Lead[]>('getLeads');
  if (data !== null) return data;
  return isOnboardingComplete() ? initialLeads : [];
};
 
/** Persists the current leads array to Google Sheets. */
export const saveLeads = async (leads: Lead[]): Promise<void> => {
  await sheetsPost({ action: 'saveLeads', leads });
};
 
// ---------------------------------------------------------------------------
// Creator Settings
// ---------------------------------------------------------------------------
 
/**
 * Loads creator settings from Google Sheets.
 * Falls back to sensible defaults if the request fails.
 */
export const loadSettings = async (): Promise<CreatorSettings> => {
  const data = await sheetsGet<CreatorSettings>('getSettings');
  return data ?? initialCreatorSettings;
};
 
/** Persists the creator settings object to Google Sheets. */
export const saveSettings = async (settings: CreatorSettings): Promise<void> => {
  await sheetsPost({ action: 'saveSettings', settings });
};
 
// ---------------------------------------------------------------------------
// Todos
// ---------------------------------------------------------------------------
 
/**
 * Loads todos from Google Sheets.
 * Handles backwards-compatibility for items that predate the `order` field.
 */
export const loadTodos = async (): Promise<TodoItem[]> => {
  const data = await sheetsGet<TodoItem[]>('getTodos');
  if (data !== null) {
    return data.map((todo: TodoItem, index: number) => ({
      ...todo,
      order: todo.order ?? index + 1,
    }));
  }
  return isOnboardingComplete() ? initialTodos : [];
};
 
/** Persists the current todos array to Google Sheets. */
export const saveTodos = async (todos: TodoItem[]): Promise<void> => {
  await sheetsPost({ action: 'saveTodos', todos });
};
 
// ---------------------------------------------------------------------------
// Account reset
// ---------------------------------------------------------------------------
 
/**
 * Clears all user data from Google Sheets and removes the onboarding flag
 * so the app restarts fresh.
 */
export const clearAllData = async (): Promise<void> => {
  await sheetsPost({ action: 'clearData' });
  try {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
  } catch {
    // ignore
  }
};
