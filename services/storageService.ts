import { Lead, CreatorSettings, TodoItem } from '../types';

// --- Constants ---
const LEADS_STORAGE_KEY = 'creator-pitch-leads';
const SETTINGS_STORAGE_KEY = 'creator-pitch-settings';
const ONBOARDING_STORAGE_KEY = 'creator-pitch-onboarding-complete';
const TODO_STORAGE_KEY = 'creator-pitch-todos';

// --- Default Data ---
// This will be used if no data is found in storage.
// In a Firebase implementation, this might be handled by initial user setup logic.

const daysFromNow = (days: number) => new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

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

// --- Firebase Integration Point ---
// The functions below are currently implemented using browser localStorage.
// When connecting to Firebase, you will replace the logic inside these functions
// with calls to Firestore (or another Firebase service) to persist and retrieve data for the logged-in user.
// The rest of the application will not need to change, as it relies on this service
// as the single source of truth for data persistence.

/**
 * Checks if the user has completed the onboarding flow.
 * @returns {boolean} True if onboarding is complete, false otherwise.
 */
export const isOnboardingComplete = (): boolean => {
    try {
        return localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true';
    } catch (error) {
        console.error("Failed to check onboarding status from localStorage", error);
        return false; // Assume not complete if there's an error
    }
};

/**
 * Marks the onboarding flow as complete.
 */
export const setOnboardingComplete = (): void => {
    try {
        localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    } catch (error) {
        console.error("Failed to set onboarding status in localStorage", error);
    }
};


/**
 * Loads leads from storage. For Firebase, this would fetch from a user's collection.
 * @returns {Lead[]} An array of leads.
 */
export const loadLeads = (): Lead[] => {
    try {
        const savedLeads = localStorage.getItem(LEADS_STORAGE_KEY);
        if (savedLeads) return JSON.parse(savedLeads);
        // If no saved leads and onboarding is not complete, start with an empty board.
        return isOnboardingComplete() ? initialLeads : [];
    } catch (error) {
        console.error("Failed to parse leads from localStorage", error);
        return [];
    }
};

/**
 * Saves leads to storage. For Firebase, this would update a user's collection.
 * @param {Lead[]} leads The array of leads to save.
 */
export const saveLeads = (leads: Lead[]): void => {
    try {
        // TODO: Replace with authenticated Firebase call to save user's leads.
        localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(leads));
    } catch (error) {
        console.error("Failed to save leads to localStorage", error);
    }
};

/**
 * Loads creator settings from storage. For Firebase, this would fetch a user's settings document.
 * @returns {CreatorSettings} The creator settings object.
 */
export const loadSettings = (): CreatorSettings => {
    try {
        const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
        // TODO: Replace with authenticated Firebase call to fetch user's settings.
        return savedSettings ? JSON.parse(savedSettings) : initialCreatorSettings;
    } catch (error) {
        console.error("Failed to parse settings from localStorage", error);
        return initialCreatorSettings;
    }
};

/**
 * Saves creator settings to storage. For Firebase, this would update a user's settings document.
 * @param {CreatorSettings} settings The creator settings object to save.
 */
export const saveSettings = (settings: CreatorSettings): void => {
    try {
        // TODO: Replace with authenticated Firebase call to save user's settings.
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
        console.error("Failed to save settings to localStorage", error);
    }
};

/**
 * Loads todos from storage.
 * @returns {TodoItem[]} An array of todos.
 */
export const loadTodos = (): TodoItem[] => {
    try {
        const savedTodos = localStorage.getItem(TODO_STORAGE_KEY);
        if (savedTodos) {
             const parsedTodos = JSON.parse(savedTodos);
             // Backwards compatibility for items without an order property
             return parsedTodos.map((todo: TodoItem, index: number) => ({
                 ...todo,
                 order: todo.order ?? index + 1,
             }));
        }
        return isOnboardingComplete() ? initialTodos : [];
    } catch (error) {
        console.error("Failed to parse todos from localStorage", error);
        return [];
    }
};

/**
 * Saves todos to storage.
 * @param {TodoItem[]} todos The array of todos to save.
 */
export const saveTodos = (todos: TodoItem[]): void => {
    try {
        localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(todos));
    } catch (error) {
        console.error("Failed to save todos to localStorage", error);
    }
};

/**
 * Clears all local data. For Firebase, this might be part of a user deletion function.
 */
export const clearAllData = (): void => {
    try {
        // TODO: Replace with a Firebase function to delete a user's data.
        localStorage.removeItem(LEADS_STORAGE_KEY);
        localStorage.removeItem(SETTINGS_STORAGE_KEY);
        localStorage.removeItem(TODO_STORAGE_KEY);
        // Also clear the onboarding flag on reset
        localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    } catch (error) {
        console.error("Failed to clear data from localStorage", error);
    }
};