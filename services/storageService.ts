import { Lead, CreatorSettings, TodoItem } from '../types';
 
// ============================================================
// Creator Pitch — Storage Service (Google Sheets backend)
// ============================================================
// Set VITE_APPS_SCRIPT_URL in your .env file to your deployed
// Google Apps Script Web App URL.
// ============================================================
 
const SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL as string;
 
if (!SCRIPT_URL) {
  console.error(
    '[storageService] VITE_APPS_SCRIPT_URL is not set. ' +
    'Add it to your .env file and restart the dev server.'
  );
}
 
// --------------- Core fetch helper ---------------
 
async function call<T>(action: string, data?: unknown): Promise<T> {
  const params = new URLSearchParams({ action });
  if (data !== undefined) {
    params.append('data', JSON.stringify(data));
  }
 
  const url = `${SCRIPT_URL}?${params.toString()}`;
 
  // Apps Script Web Apps require a GET even for mutations,
  // because POST with CORS requires a preflight that Apps Script doesn't support.
  const res = await fetch(url, { redirect: 'follow' });
 
  if (!res.ok) {
    throw new Error(`[storageService] HTTP ${res.status} for action "${action}"`);
  }
 
  const json = (await res.json()) as T & { error?: string };
 
  if ('error' in json && json.error) {
    throw new Error(`[storageService] Script error for "${action}": ${json.error}`);
  }
 
  return json;
}
 
// --------------- Default / initial data ---------------
// Kept here so the onboarding flow still works exactly as before.
 
const daysFromNow = (days: number) =>
  new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
 
const initialLeads: Lead[] = [
  { id: '1', companyName: 'Innovate Inc.', contactName: 'Alex Johnson', email: 'alex@innovate.com', phone: '123-456-7890', stage: 'Contract', value: 50000, lastContacted: '2023-10-15T10:00:00Z', notes: 'Interested in Q4 campaign. Follow up next week.', isArchived: false, emailThreadLink: 'https://mail.google.com/mail/u/0/#inbox/12345', prFirmName: 'Marketing Masters', agentSplitDisabled: true },
  { id: '2', companyName: 'Solutions Co.', contactName: 'Maria Garcia', email: 'maria@solutions.co', phone: '234-567-8901', stage: 'Pitch', value: 75000, lastContacted: '2023-10-20T14:30:00Z', notes: 'Had initial call. Sent over brochure. Needs pricing.', isArchived: false, agentSplitDisabled: false },
  { id: '3', companyName: 'Creative LLC', contactName: 'David Chen', email: 'david@creative.llc', phone: '345-678-9012', stage: 'Invoice', value: 30000, lastContacted: '2023-10-22T11:00:00Z', notes: 'Proposal sent. Reviewing with their team.', isArchived: false, invoiceLink: 'https://quickbooks.intuit.com/invoice/12345', invoiceDueDate: daysFromNow(2) },
  { id: '4', companyName: 'Tech Forward', contactName: 'Sarah Kim', email: 'sarah@techforward.io', phone: '456-789-0123', stage: 'Negotiation', value: 120000, lastContacted: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), notes: 'Negotiating terms. Wants a 10% discount.', isArchived: false },
  { id: '5', companyName: 'Global Corp', contactName: 'Michael Brown', email: 'michael@global.corp', phone: '567-890-1234', stage: 'Paid', value: 95000, lastContacted: new Date().toISOString(), notes: 'Contract signed. Project kickoff next month.', isArchived: false },
  { id: '6', companyName: 'Market Makers', contactName: 'Jessica Williams', email: 'jess@marketmakers.com', phone: '678-901-2345', stage: 'Lost', value: 60000, lastContacted: '2023-10-18T12:00:00Z', notes: 'Chose a competitor. Budget constraints cited.', isArchived: false },
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
];
 
// --------------- Onboarding ---------------
 
export const isOnboardingComplete = async (): Promise<boolean> => {
  try {
    const res = await call<{ complete: boolean }>('getOnboarding');
    return res.complete;
  } catch (err) {
    console.error('[storageService] isOnboardingComplete failed', err);
    return false;
  }
};
 
export const setOnboardingComplete = async (): Promise<void> => {
  try {
    await call('setOnboarding');
  } catch (err) {
    console.error('[storageService] setOnboardingComplete failed', err);
  }
};
 
// --------------- Leads ---------------
 
export const loadLeads = async (): Promise<Lead[]> => {
  try {
    const leads = await call<Lead[]>('getLeads');
    if (leads && leads.length > 0) return leads;
    // First run — seed with sample data so onboarding board isn't empty
    return initialLeads;
  } catch (err) {
    console.error('[storageService] loadLeads failed', err);
    return [];
  }
};
 
export const saveLeads = async (leads: Lead[]): Promise<void> => {
  try {
    await call('saveLeads', leads);
  } catch (err) {
    console.error('[storageService] saveLeads failed', err);
  }
};
 
// --------------- Settings ---------------
 
export const loadSettings = async (): Promise<CreatorSettings> => {
  try {
    const settings = await call<CreatorSettings | null>('getSettings');
    return settings ?? initialCreatorSettings;
  } catch (err) {
    console.error('[storageService] loadSettings failed', err);
    return initialCreatorSettings;
  }
};
 
export const saveSettings = async (settings: CreatorSettings): Promise<void> => {
  try {
    await call('saveSettings', settings);
  } catch (err) {
    console.error('[storageService] saveSettings failed', err);
  }
};
 
// --------------- Todos ---------------
 
export const loadTodos = async (): Promise<TodoItem[]> => {
  try {
    const todos = await call<TodoItem[]>('getTodos');
    if (todos && todos.length > 0) {
      return todos.map((todo, index) => ({
        ...todo,
        order: todo.order ?? index + 1,
      }));
    }
    return initialTodos;
  } catch (err) {
    console.error('[storageService] loadTodos failed', err);
    return [];
  }
};
 
export const saveTodos = async (todos: TodoItem[]): Promise<void> => {
  try {
    await call('saveTodos', todos);
  } catch (err) {
    console.error('[storageService] saveTodos failed', err);
  }
};
 
// --------------- Clear all ---------------
 
export const clearAllData = async (): Promise<void> => {
  try {
    await call('clearAll');
  } catch (err) {
    console.error('[storageService] clearAllData failed', err);
  }
};
