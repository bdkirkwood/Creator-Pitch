import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import LeadBoard from './components/LeadBoard';
import { Lead, LeadStage, CreatorSettings } from './types';
import { LEAD_STAGES, PlusIcon, SettingsIcon, ArchiveIcon, DuplicateIcon, MailIcon, CopyIcon, EditIcon, DollarSignIcon, CalendarIcon, ExportIcon, SearchIcon, XCircleIcon } from './constants';
import { getLeadSummary, generatePitchEmail, generateInvoiceReminderEmail } from './services/geminiService';

// Mock Data - Helper for creating dates
const daysFromNow = (days: number) => new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

const initialLeads: Lead[] = [
  { id: '1', companyName: 'Innovate Inc.', contactName: 'Alex Johnson', email: 'alex@innovate.com', phone: '123-456-7890', stage: 'Contract', value: 50000, lastContacted: '2023-10-15T10:00:00Z', notes: 'Interested in Q4 campaign. Follow up next week.', isArchived: false, emailThreadLink: 'https://mail.google.com/mail/u/0/#inbox/12345', prFirmName: 'Marketing Masters' },
  { id: '2', companyName: 'Solutions Co.', contactName: 'Maria Garcia', email: 'maria@solutions.co', phone: '234-567-8901', stage: 'Pitch', value: 75000, lastContacted: '2023-10-20T14:30:00Z', notes: 'Had initial call. Sent over brochure. Needs pricing.', isArchived: false },
  { id: '3', companyName: 'Creative LLC', contactName: 'David Chen', email: 'david@creative.llc', phone: '345-678-9012', stage: 'Invoice', value: 30000, lastContacted: '2023-10-22T11:00:00Z', notes: 'Proposal sent. Reviewing with their team.', isArchived: false, invoiceLink: 'https://quickbooks.intuit.com/invoice/12345', invoiceDueDate: daysFromNow(2) },
  { id: '4', companyName: 'Tech Forward', contactName: 'Sarah Kim', email: 'sarah@techforward.io', phone: '456-789-0123', stage: 'Negotiation', value: 120000, lastContacted: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), notes: 'Negotiating terms. Wants a 10% discount.', isArchived: false },
  { id: '5', companyName: 'Global Corp', contactName: 'Michael Brown', email: 'michael@global.corp', phone: '567-890-1234', stage: 'Paid', value: 95000, lastContacted: new Date().toISOString(), notes: 'Contract signed. Project kickoff next month.', isArchived: false },
  { id: '6', companyName: 'Market Makers', contactName: 'Jessica Williams', email: 'jess@marketmakers.com', phone: '678-901-2345', stage: 'Lost', value: 60000, lastContacted: '2023-10-18T12:00:00Z', notes: 'Chose a competitor. Budget constraints cited.', isArchived: false },
  { id: '7', companyName: 'Archived Biz', contactName: 'Old Contact', email: 'old@contact.com', phone: '789-012-3456', stage: 'Lost', value: 20000, lastContacted: '2022-01-01T12:00:00Z', notes: 'Deal went cold a long time ago.', isArchived: true, originalStage: 'Negotiation' },
  { id: '8', companyName: 'Past Due Payments', contactName: 'John Doe', email: 'john@pastdue.com', phone: '890-123-4567', stage: 'Invoice', value: 15000, lastContacted: daysFromNow(-30), notes: 'Invoice sent last month.', isArchived: false, invoiceLink: 'https://quickbooks.intuit.com/invoice/67890', invoiceDueDate: daysFromNow(-5) },
];

const initialCreatorSettings: CreatorSettings = {
    fullName: 'Your Name',
    pronouns: 'they/them',
    bio: 'I help tech brands grow their audience through high-quality video content and strategic social media campaigns.',
    location: 'San Francisco, CA, USA',
    niche: 'Tech and AI',
    usp: 'Making complex tech topics accessible to everyone.',
    brandVoiceKeywords: 'Informative, engaging, slightly humorous',
    professionalTitle: 'Content Creator & Strategist',
    platformHandles: ['@yourhandle_youtube', '@yourhandle_tiktok'],
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
};

const LeadDetailModal: React.FC<{
  lead: Lead | null;
  onClose: () => void;
  onGenerateSummary: (lead: Lead) => Promise<string>;
  onGenerateEmail: (lead: Lead, settings: CreatorSettings) => Promise<{ subject: string; body: string; }>;
  onGenerateReminder: (lead: Lead, settings: CreatorSettings) => Promise<{ subject: string; body: string; }>;
  creatorSettings: CreatorSettings;
  onArchive: (leadId: string) => void;
  onUnarchive: (leadId: string) => void;
  onDuplicate: (leadId: string) => void;
  onEdit: (lead: Lead) => void;
  onUpdateLastContacted: (leadId: string, newDate: string) => void;
}> = ({ lead, onClose, onGenerateSummary, onGenerateEmail, onGenerateReminder, creatorSettings, onArchive, onUnarchive, onDuplicate, onEdit, onUpdateLastContacted }) => {
  const [summary, setSummary] = useState('');
  const [email, setEmail] = useState<{ subject: string; body: string; } | null>(null);
  const [reminderEmail, setReminderEmail] = useState<{ subject: string; body: string; } | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);
  const [isLoadingReminder, setIsLoadingReminder] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isEditingDate, setIsEditingDate] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingDate) {
        dateInputRef.current?.focus();
    }
  }, [isEditingDate]);

  if (!lead) return null;

  const handleSummary = async () => {
    setIsLoadingSummary(true);
    setSummary('');
    const result = await onGenerateSummary(lead);
    setSummary(result);
    setIsLoadingSummary(false);
  };

  const handleEmail = async () => {
    setIsLoadingEmail(true);
    setEmail(null);
    const result = await onGenerateEmail(lead, creatorSettings);
    setEmail(result);
    setIsLoadingEmail(false);
  };
  
  const handleReminderEmail = async () => {
    setIsLoadingReminder(true);
    setReminderEmail(null);
    const result = await onGenerateReminder(lead, creatorSettings);
    setReminderEmail(result);
    setIsLoadingReminder(false);
  };

  const handleCopyToClipboard = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };
  
  const handleSendViaGmail = (emailContent: { subject: string; body: string; }) => {
      const gmailUrl = new URL("https://mail.google.com/mail/?view=cm&fs=1");
      gmailUrl.searchParams.append("to", lead.email);
      gmailUrl.searchParams.append("su", emailContent.subject);
      gmailUrl.searchParams.append("body", emailContent.body);
      window.open(gmailUrl, "_blank");
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (lead && e.target.value) {
      // Create date in UTC to avoid timezone-related date shifts.
      // The input value is "YYYY-MM-DD".
      const [year, month, day] = e.target.value.split('-').map(Number);
      const selectedDate = new Date(Date.UTC(year, month - 1, day));
      onUpdateLastContacted(lead.id, selectedDate.toISOString());
    }
    setIsEditingDate(false);
  };

  const handleModalContentClick = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={handleModalContentClick}>
        <div className="p-6">
          <div className="flex justify-between items-center border-b pb-3 mb-4 border-gray-200 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{lead.companyName}</h2>
              <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-3xl leading-none">&times;</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-6">
              <div><strong>Contact:</strong> {lead.contactName}</div>
              <div><strong>Email:</strong> {lead.email}</div>
              <div><strong>Phone:</strong> {lead.phone}</div>
              {lead.prFirmName && <div><strong>PR/Marketing Firm:</strong> {lead.prFirmName}</div>}
              <div><strong>Stage:</strong> {lead.stage}</div>
              <div><strong>Value:</strong> ${lead.value.toLocaleString()}</div>
              <div>
                <strong>Last Contacted:</strong>{' '}
                {isEditingDate ? (
                  <input
                    type="date"
                    ref={dateInputRef}
                    onChange={handleDateChange}
                    onBlur={() => setIsEditingDate(false)}
                    defaultValue={lead.lastContacted.split('T')[0]}
                    className="bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md px-2 py-0.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <>
                    {new Date(lead.lastContacted).toLocaleDateString()}
                    <button 
                      onClick={() => setIsEditingDate(true)} 
                      className="ml-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 inline-flex items-center justify-center align-middle" 
                      aria-label="Update last contacted date"
                    >
                        <CalendarIcon className="h-4 w-4 text-slate-500" />
                    </button>
                  </>
                )}
              </div>
              {lead.invoiceDueDate && <div><strong>Invoice Due:</strong> {new Date(lead.invoiceDueDate).toLocaleDateString()}</div>}
              {lead.emailThreadLink && <div className="md:col-span-2"><strong>Email Thread:</strong> <a href={lead.emailThreadLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline break-all">{lead.emailThreadLink}</a></div>}
              {lead.invoiceLink && <div className="md:col-span-2"><strong>Invoice Link:</strong> <a href={lead.invoiceLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline break-all">{lead.invoiceLink}</a></div>}
              <div className="md:col-span-2"><strong>Notes:</strong> <p className="mt-1 p-2 bg-gray-100 dark:bg-slate-700 rounded">{lead.notes}</p></div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg text-slate-700 dark:text-slate-200">AI Summary & Next Steps</h3>
                <button onClick={handleSummary} disabled={isLoadingSummary} className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300">
                  {isLoadingSummary ? 'Generating...' : 'Generate'}
                </button>
              </div>
              {summary && <div className="mt-2 p-3 bg-gray-100 dark:bg-slate-700/50 rounded-md"><pre className="whitespace-pre-wrap font-sans text-sm">{summary}</pre></div>}
            </div>
            
            {(lead.stage === 'Lead' || lead.stage === 'Pitch') && (
              <div>
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-lg text-slate-700 dark:text-slate-200">AI-Generated Pitch Email</h3>
                  <button onClick={handleEmail} disabled={isLoadingEmail} className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-green-300">
                    {isLoadingEmail ? 'Generating...' : 'Generate Pitch'}
                  </button>
                </div>
                {email && (
                  <div className="mt-2 p-3 bg-gray-100 dark:bg-slate-700/50 rounded-md text-sm">
                    <p><strong>Subject:</strong> {email.subject}</p>
                    <hr className="my-2 dark:border-slate-600" />
                    <p className="whitespace-pre-wrap">{email.body}</p>
                     <div className="flex space-x-2 mt-4">
                        <button onClick={() => handleCopyToClipboard(email.body)} className="flex items-center px-3 py-1 text-sm bg-white hover:bg-gray-100 border border-gray-300 dark:bg-slate-600 text-slate-700 dark:text-slate-200 rounded dark:hover:bg-slate-500 dark:border-slate-500">
                          <CopyIcon /> {isCopied ? 'Copied!' : 'Copy'}
                        </button>
                        <button onClick={() => handleSendViaGmail(email)} className="flex items-center px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
                          <MailIcon /> Send via Gmail
                        </button>
                     </div>
                  </div>
                )}
              </div>
            )}
            
            {lead.stage === 'Invoice' && (
                <div>
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg text-slate-700 dark:text-slate-200">Invoice Reminder</h3>
                    <button onClick={handleReminderEmail} disabled={isLoadingReminder} className="px-3 py-1 text-sm bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-purple-300">
                      {isLoadingReminder ? 'Generating...' : 'Create Reminder Email'}
                    </button>
                  </div>
                  {reminderEmail && (
                    <div className="mt-2 p-3 bg-gray-100 dark:bg-slate-700/50 rounded-md text-sm">
                      <p><strong>Subject:</strong> {reminderEmail.subject}</p>
                      <hr className="my-2 dark:border-slate-600" />
                      <p className="whitespace-pre-wrap">{reminderEmail.body}</p>
                       <div className="flex space-x-2 mt-4">
                          <button onClick={() => handleCopyToClipboard(reminderEmail.body)} className="flex items-center px-3 py-1 text-sm bg-white hover:bg-gray-100 border border-gray-300 dark:bg-slate-600 text-slate-700 dark:text-slate-200 rounded dark:hover:bg-slate-500 dark:border-slate-500">
                            <CopyIcon /> {isCopied ? 'Copied!' : 'Copy'}
                          </button>
                          <button onClick={() => handleSendViaGmail(reminderEmail)} className="flex items-center px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
                            <MailIcon /> Send via Gmail
                          </button>
                       </div>
                    </div>
                  )}
                </div>
            )}
          </div>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-200 dark:border-slate-700 flex justify-end space-x-3">
            <button onClick={() => onEdit(lead)} className="flex items-center px-4 py-2 text-sm bg-white hover:bg-gray-100 border border-gray-300 dark:bg-slate-600 text-slate-700 dark:text-slate-200 rounded dark:hover:bg-slate-500 dark:border-slate-500">
                <EditIcon /> Edit
            </button>
            <button onClick={() => onDuplicate(lead.id)} className="flex items-center px-4 py-2 text-sm bg-white hover:bg-gray-100 border border-gray-300 dark:bg-slate-600 text-slate-700 dark:text-slate-200 rounded dark:hover:bg-slate-500 dark:border-slate-500">
                <DuplicateIcon /> Duplicate
            </button>
            {lead.isArchived ? (
                 <button onClick={() => onUnarchive(lead.id)} className="flex items-center px-4 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600">
                    Unarchive
                </button>
            ) : (
                <button onClick={() => onArchive(lead.id)} className="flex items-center px-4 py-2 text-sm bg-amber-500 text-white rounded hover:bg-amber-600">
                    <ArchiveIcon /> Archive
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

// Generic Modal Component
const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; }> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold">{title}</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-3xl leading-none">&times;</button>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
};

// Moved component definitions outside of the App component to prevent re-creation on every render.
// This fixes the issue where input fields lose focus after typing one character.
const FormInput: React.FC<any> = ({ label, name, value, onChange, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
        <input name={name} value={value} onChange={onChange} {...props} className="w-full p-2 border border-gray-300 rounded bg-white dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
    </div>
);
  
const FormTextarea: React.FC<any> = ({ label, name, value, onChange, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
        <textarea name={name} value={value} onChange={onChange} {...props} className="w-full p-2 border border-gray-300 rounded bg-white dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
    </div>
);

function App() {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [isEditLeadModalOpen, setIsEditLeadModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isFinancialsModalOpen, setIsFinancialsModalOpen] = useState(false);
  const [creatorSettings, setCreatorSettings] = useState<CreatorSettings>(initialCreatorSettings);
  const [showFollowUpAlerts, setShowFollowUpAlerts] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
        const storedTheme = window.localStorage.getItem('theme');
        if (storedTheme === 'light' || storedTheme === 'dark') {
            return storedTheme;
        }
    }
    return 'system';
  });
  
  const activeLeads = useMemo(() => {
    const nonArchived = leads.filter(lead => !lead.isArchived);
    if (!searchQuery) {
        return nonArchived;
    }
    const lowercasedQuery = searchQuery.toLowerCase();
    return nonArchived.filter(lead =>
        lead.companyName.toLowerCase().includes(lowercasedQuery) ||
        lead.contactName.toLowerCase().includes(lowercasedQuery) ||
        lead.email.toLowerCase().includes(lowercasedQuery) ||
        (lead.notes && lead.notes.toLowerCase().includes(lowercasedQuery))
    );
  }, [leads, searchQuery]);

  const archivedLeads = useMemo(() => leads.filter(lead => lead.isArchived), [leads]);

  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    root.classList.toggle('dark', isDark);
    localStorage.setItem('theme', theme);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
        if (theme === 'system') {
            root.classList.toggle('dark', e.matches);
        }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const financialMetrics = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const contracted = leads.filter(l => l.stage === 'Contract').reduce((sum, l) => sum + l.value, 0);
    const invoiced = leads.filter(l => l.stage === 'Invoice').reduce((sum, l) => sum + l.value, 0);
    const paidThisYear = leads.filter(l => l.stage === 'Paid' && new Date(l.lastContacted).getFullYear() === currentYear).reduce((sum, l) => sum + l.value, 0);
    return { contracted, invoiced, paidThisYear };
  }, [leads]);

  const handleOpenLead = (lead: Lead) => setSelectedLead(lead);
  const handleCloseModal = () => setSelectedLead(null);
  
  const handleOpenEditModal = (lead: Lead) => {
    setSelectedLead(lead);
    setIsEditLeadModalOpen(true);
  }

  const handleMoveStage = useCallback((leadId: string, direction: 'forward' | 'backward') => {
    setLeads(prevLeads => {
      const leadIndex = prevLeads.findIndex(l => l.id === leadId);
      if (leadIndex === -1) return prevLeads;
      
      const lead = prevLeads[leadIndex];
      const currentStageIndex = LEAD_STAGES.indexOf(lead.stage);
      
      let nextStageIndex = currentStageIndex;
      if (direction === 'forward' && currentStageIndex < LEAD_STAGES.length - 1) {
        nextStageIndex++;
      } else if (direction === 'backward' && currentStageIndex > 0) {
        nextStageIndex--;
      }

      if (nextStageIndex === currentStageIndex) return prevLeads;

      const nextStage = LEAD_STAGES[nextStageIndex];
      let invoiceLink = lead.invoiceLink;
      let invoiceDueDate = lead.invoiceDueDate;

      // Prompt for invoice details only when moving *into* the Invoice stage
      if (nextStage === 'Invoice' && lead.stage !== 'Invoice') {
          const linkResult = window.prompt(`Please enter the invoice link for ${lead.companyName}. You can leave this blank.`);
          if (linkResult !== null) {
              invoiceLink = linkResult;
          }
          
          const dateResult = window.prompt(`Please enter the invoice due date for ${lead.companyName}. (YYYY-MM-DD)`);
          if (dateResult && /^\d{4}-\d{2}-\d{2}$/.test(dateResult)) {
              const [year, month, day] = dateResult.split('-').map(Number);
              const utcDate = new Date(Date.UTC(year, month - 1, day));
              invoiceDueDate = utcDate.toISOString();
          } else if (dateResult !== null && dateResult !== "") {
              alert("Invalid date format. Please use YYYY-MM-DD. The due date was not set.");
          }
      }
      
      const updatedLead = { 
        ...lead, 
        stage: nextStage, 
        lastContacted: new Date().toISOString(),
        invoiceLink,
        invoiceDueDate,
      };

      const newLeads = [...prevLeads];
      newLeads[leadIndex] = updatedLead;
      return newLeads;
    });
  }, []);
  
  const handleAddLead = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newLead: Lead = {
        id: Date.now().toString(),
        companyName: formData.get('companyName') as string,
        contactName: formData.get('contactName') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
        value: Number(formData.get('value')),
        prFirmName: formData.get('prFirmName') as string,
        stage: 'Lead',
        notes: '',
        lastContacted: new Date().toISOString(),
        isArchived: false,
    };
    setLeads(prev => [newLead, ...prev]);
    setIsAddLeadModalOpen(false);
  };
  
  const handleUpdateLead = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const dueDateValue = formData.get('invoiceDueDate') as string;
    
    const updatedLead: Lead = {
        ...selectedLead!,
        companyName: formData.get('companyName') as string,
        contactName: formData.get('contactName') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
        value: Number(formData.get('value')),
        prFirmName: formData.get('prFirmName') as string,
        invoiceLink: formData.get('invoiceLink') as string,
        invoiceDueDate: dueDateValue ? new Date(dueDateValue).toISOString() : undefined,
        notes: formData.get('notes') as string,
        emailThreadLink: formData.get('emailThreadLink') as string,
    };
    setLeads(prev => prev.map(l => l.id === updatedLead.id ? updatedLead : l));
    // The modal is no longer closed on save, giving the user control.
    setSelectedLead(updatedLead);
  };

  const handleUpdateLastContacted = useCallback((leadId: string, newDate: string) => {
    setLeads(prevLeads => {
      const updatedLeads = prevLeads.map(lead => {
        if (lead.id === leadId) {
          return { ...lead, lastContacted: newDate };
        }
        return lead;
      });
      
      if (selectedLead?.id === leadId) {
        setSelectedLead(prevSelected => prevSelected ? { ...prevSelected, lastContacted: newDate } : null);
      }
      return updatedLeads;
    });
  }, [selectedLead]);

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('demographics.')) {
        const key = name.split('.')[1];
        setCreatorSettings(prev => ({
            ...prev,
            demographics: { ...prev.demographics, [key]: value }
        }));
    } else if (name === 'platformHandles') {
        setCreatorSettings(prev => ({ ...prev, platformHandles: value.split(',').map(h => h.trim()) }));
    } else {
        setCreatorSettings(prev => ({
            ...prev,
            [name]: e.target.type === 'number' ? Number(value) : value,
        }));
    }
  };

  const handleArchiveLead = (leadId: string) => {
    setLeads(prev => prev.map(l => l.id === leadId ? {...l, isArchived: true, originalStage: l.stage} : l));
    handleCloseModal();
  };

  const handleUnarchiveLead = (leadId: string) => {
     setLeads(prev => prev.map(l => l.id === leadId ? {...l, isArchived: false, stage: l.originalStage || 'Lead' } : l));
     if (selectedLead?.id === leadId) {
        handleCloseModal();
     }
  };

  const handleDuplicateLead = (leadId: string) => {
      const leadToDuplicate = leads.find(l => l.id === leadId);
      if (leadToDuplicate) {
          const newLead: Lead = {
              ...leadToDuplicate,
              id: Date.now().toString(),
              stage: 'Lead',
              value: 0,
              notes: `Duplicate of lead for ${leadToDuplicate.companyName}.`,
              lastContacted: new Date().toISOString(),
              isArchived: false,
          };
          setLeads(prev => [newLead, ...prev]);
          handleCloseModal();
      }
  };

  const handleExportData = () => {
    if (leads.length === 0) {
        alert("No lead data to export.");
        return;
    }

    const headers: (keyof Lead)[] = [
        'id', 'companyName', 'contactName', 'email', 'phone', 
        'stage', 'value', 'lastContacted', 'notes', 'isArchived', 
        'originalStage', 'emailThreadLink', 'prFirmName', 'invoiceLink', 'invoiceDueDate'
    ];

    const escapeCsvField = (field: any): string => {
        if (field === null || field === undefined) return '';
        const stringField = String(field);
        if (/[",\n]/.test(stringField)) {
            return `"${stringField.replace(/"/g, '""')}"`;
        }
        return stringField;
    };

    const csvRows = [
        headers.join(','),
        ...leads.map(lead => 
            headers.map(header => escapeCsvField(lead[header])).join(',')
        )
    ];

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    link.setAttribute('download', `creator_crm_export_${timestamp}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-gray-50 dark:bg-slate-900 h-screen text-slate-900 dark:text-slate-50 flex flex-col">
      <header className="p-4 bg-white dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">Creator CRM</h1>
            <div className="relative max-w-sm lg:max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                    type="text"
                    placeholder="Search by company, contact, email, or notes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-2 pl-10 border border-gray-300 rounded-lg bg-white dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery('')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        aria-label="Clear search"
                    >
                        <XCircleIcon className="h-5 w-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" />
                    </button>
                )}
            </div>
        </div>
        <div className="flex items-center space-x-2">
            <button onClick={() => setIsFinancialsModalOpen(true)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700" aria-label="View Financials">
                <DollarSignIcon />
            </button>
            <button onClick={() => setIsAddLeadModalOpen(true)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700" aria-label="Add Lead">
                <PlusIcon />
            </button>
            <button onClick={() => setIsSettingsModalOpen(true)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700" aria-label="Creator Settings">
                <SettingsIcon />
            </button>
        </div>
      </header>
      <LeadBoard leads={activeLeads} onOpenLead={handleOpenLead} onMoveStage={handleMoveStage} showFollowUpAlerts={showFollowUpAlerts} />
      
      <div className="fixed bottom-6 right-6 z-20 flex flex-col space-y-3">
        <button onClick={handleExportData} className="p-4 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700" aria-label="Export Data">
          <ExportIcon />
        </button>
        <button onClick={() => setIsArchiveModalOpen(true)} className="p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700" aria-label="Open Archives">
          <ArchiveIcon />
        </button>
      </div>


      {selectedLead && !isEditLeadModalOpen && (
        <LeadDetailModal 
          lead={selectedLead} 
          onClose={handleCloseModal}
          onGenerateSummary={getLeadSummary}
          onGenerateEmail={generatePitchEmail}
          onGenerateReminder={generateInvoiceReminderEmail}
          creatorSettings={creatorSettings}
          onArchive={handleArchiveLead}
          onUnarchive={handleUnarchiveLead}
          onDuplicate={handleDuplicateLead}
          onEdit={() => handleOpenEditModal(selectedLead)}
          onUpdateLastContacted={handleUpdateLastContacted}
        />
      )}
      
      <Modal isOpen={isAddLeadModalOpen} onClose={() => setIsAddLeadModalOpen(false)} title="Add New Lead">
          <form onSubmit={handleAddLead} className="space-y-4">
              <input name="companyName" placeholder="Company Name" required className="w-full p-2 border border-gray-300 rounded bg-white dark:bg-slate-700 dark:border-slate-600" />
              <input name="contactName" placeholder="Contact Name" required className="w-full p-2 border border-gray-300 rounded bg-white dark:bg-slate-700 dark:border-slate-600" />
              <input name="email" type="email" placeholder="Email" required pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$" title="Please enter a valid email address." className="w-full p-2 border border-gray-300 rounded bg-white dark:bg-slate-700 dark:border-slate-600" />
              <input name="phone" type="tel" placeholder="Phone" className="w-full p-2 border border-gray-300 rounded bg-white dark:bg-slate-700 dark:border-slate-600" />
              <input name="value" type="number" placeholder="Deal Value ($)" required className="w-full p-2 border border-gray-300 rounded bg-white dark:bg-slate-700 dark:border-slate-600" />
              <input name="prFirmName" placeholder="PR or Marketing Firm (optional)" className="w-full p-2 border border-gray-300 rounded bg-white dark:bg-slate-700 dark:border-slate-600" />
              <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">Add Lead</button>
          </form>
      </Modal>

      {selectedLead && (
      <Modal isOpen={isEditLeadModalOpen} onClose={() => setIsEditLeadModalOpen(false)} title={`Edit ${selectedLead.companyName}`}>
          <form onSubmit={handleUpdateLead} className="space-y-4">
              <input name="companyName" defaultValue={selectedLead.companyName} placeholder="Company Name" required className="w-full p-2 border border-gray-300 rounded bg-white dark:bg-slate-700 dark:border-slate-600" />
              <input name="contactName" defaultValue={selectedLead.contactName} placeholder="Contact Name" required className="w-full p-2 border border-gray-300 rounded bg-white dark:bg-slate-700 dark:border-slate-600" />
              <input name="email" type="email" defaultValue={selectedLead.email} placeholder="Email" required pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$" title="Please enter a valid email address." className="w-full p-2 border border-gray-300 rounded bg-white dark:bg-slate-700 dark:border-slate-600" />
              <input name="phone" type="tel" defaultValue={selectedLead.phone} placeholder="Phone" className="w-full p-2 border border-gray-300 rounded bg-white dark:bg-slate-700 dark:border-slate-600" />
              <input name="value" type="number" defaultValue={selectedLead.value} placeholder="Deal Value ($)" required className="w-full p-2 border border-gray-300 rounded bg-white dark:bg-slate-700 dark:border-slate-600" />
              <input name="prFirmName" defaultValue={selectedLead.prFirmName} placeholder="PR or Marketing Firm" className="w-full p-2 border border-gray-300 rounded bg-white dark:bg-slate-700 dark:border-slate-600" />
              <input name="emailThreadLink" type="url" defaultValue={selectedLead.emailThreadLink} placeholder="Email Thread Link" className="w-full p-2 border border-gray-300 rounded bg-white dark:bg-slate-700 dark:border-slate-600" />
              <input name="invoiceLink" type="url" defaultValue={selectedLead.invoiceLink} placeholder="Invoice Link" className="w-full p-2 border border-gray-300 rounded bg-white dark:bg-slate-700 dark:border-slate-600" />
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Invoice Due Date</label>
                <input name="invoiceDueDate" type="date" defaultValue={selectedLead.invoiceDueDate?.split('T')[0]} placeholder="Invoice Due Date" className="w-full p-2 border border-gray-300 rounded bg-white dark:bg-slate-700 dark:border-slate-600" />
              </div>
              <textarea name="notes" defaultValue={selectedLead.notes} placeholder="Notes" rows={4} className="w-full p-2 border border-gray-300 rounded bg-white dark:bg-slate-700 dark:border-slate-600" />
              <button type="submit" className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600">Save Changes</button>
          </form>
      </Modal>
      )}

      <Modal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} title="Creator Settings">
          <div className="space-y-6">
            <h3 className="text-lg font-semibold border-b pb-2 dark:border-slate-600">Creator Identity & Brand</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput label="Full Name" name="fullName" value={creatorSettings.fullName} onChange={handleSettingsChange} />
                <FormInput label="Pronouns" name="pronouns" value={creatorSettings.pronouns} onChange={handleSettingsChange} />
                <FormInput label="Location / Home Base" name="location" value={creatorSettings.location} onChange={handleSettingsChange} />
                <FormInput label="Niche / Category" name="niche" value={creatorSettings.niche} onChange={handleSettingsChange} />
                <FormInput label="Brand Voice Keywords" name="brandVoiceKeywords" value={creatorSettings.brandVoiceKeywords} onChange={handleSettingsChange} />
                <FormInput label="Professional Title" name="professionalTitle" value={creatorSettings.professionalTitle} onChange={handleSettingsChange} />
            </div>
            <FormTextarea label="Short Bio / Elevator Pitch" name="bio" value={creatorSettings.bio} onChange={handleSettingsChange} rows={3} />
            <FormTextarea label="Unique Selling Proposition (USP)" name="usp" value={creatorSettings.usp} onChange={handleSettingsChange} rows={2} />
            
            <h3 className="text-lg font-semibold border-b pb-2 pt-4 dark:border-slate-600">Social Media & Content Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput label="Platform Handles (comma-separated)" name="platformHandles" value={creatorSettings.platformHandles.join(', ')} onChange={handleSettingsChange} />
                <FormInput label="Total Follower Count" name="totalFollowers" type="number" value={creatorSettings.totalFollowers} onChange={handleSettingsChange} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <FormInput label="Top 3 Countries" name="demographics.topCountries" value={creatorSettings.demographics.topCountries} onChange={handleSettingsChange} />
                 <FormInput label="Ages" name="demographics.ages" value={creatorSettings.demographics.ages} onChange={handleSettingsChange} />
                 <FormInput label="Gender Split" name="demographics.genderSplit" value={creatorSettings.demographics.genderSplit} onChange={handleSettingsChange} />
            </div>
             <FormInput label="Content Style Keywords" name="contentStyleKeywords" value={creatorSettings.contentStyleKeywords} onChange={handleSettingsChange} />
             <FormTextarea label="List of Past Collaborations" name="pastCollaborations" value={creatorSettings.pastCollaborations} onChange={handleSettingsChange} rows={3}/>
            
            <h3 className="text-lg font-semibold border-b pb-2 pt-4 dark:border-slate-600">Communication Style</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput label="Tone Preference" name="tonePreference" value={creatorSettings.tonePreference} onChange={handleSettingsChange} />
                <FormInput label="Level of Formality" name="formality" value={creatorSettings.formality} onChange={handleSettingsChange} />
            </div>
            <FormTextarea label="Signature Style" name="signatureStyle" value={creatorSettings.signatureStyle} onChange={handleSettingsChange} rows={2} />
            <FormTextarea label="Email Persona Examples (sample emails)" name="emailPersonaExamples" value={creatorSettings.emailPersonaExamples} onChange={handleSettingsChange} rows={4}/>
            
            <h3 className="text-lg font-semibold border-b pb-2 pt-4 dark:border-slate-600">Appearance</h3>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Theme</label>
                <div className="flex space-x-2 rounded-lg bg-gray-100 dark:bg-slate-700 p-1">
                    <button type="button" onClick={() => setTheme('light')} className={`w-full rounded-md py-1.5 text-sm font-medium transition-colors ${ theme === 'light' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-800/50' }`}>
                        Light
                    </button>
                    <button type="button" onClick={() => setTheme('dark')} className={`w-full rounded-md py-1.5 text-sm font-medium transition-colors ${ theme === 'dark' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-800/50' }`}>
                        Dark
                    </button>
                    <button type="button" onClick={() => setTheme('system')} className={`w-full rounded-md py-1.5 text-sm font-medium transition-colors ${ theme === 'system' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-800/50' }`}>
                        System
                    </button>
                </div>
            </div>

            <h3 className="text-lg font-semibold border-b pb-2 pt-4 dark:border-slate-600">Productivity</h3>
            <div className="flex items-center justify-between">
                <div>
                    <label htmlFor="followUpToggle" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Show Follow-Up Reminders
                    </label>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Display an alert for leads in Pitch/Negotiation stages untouched for over 3 days.</p>
                </div>
                <button
                    id="followUpToggle"
                    role="switch"
                    aria-checked={showFollowUpAlerts}
                    onClick={() => setShowFollowUpAlerts(!showFollowUpAlerts)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-800 ${showFollowUpAlerts ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-600'}`}
                >
                    <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showFollowUpAlerts ? 'translate-x-6' : 'translate-x-1'}`}
                    />
                </button>
            </div>
            
            <div className="flex justify-end items-center space-x-4 pt-4">
                <button 
                    type="button" 
                    onClick={() => setIsSettingsModalOpen(false)} 
                    className="px-6 py-2 bg-white hover:bg-gray-100 border border-gray-300 dark:bg-slate-600 text-slate-700 dark:text-slate-200 rounded dark:hover:bg-slate-500 dark:border-slate-500"
                >
                    Close
                </button>
                <button 
                    type="button" 
                    className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Save Settings
                </button>
            </div>
          </div>
      </Modal>

      <Modal isOpen={isFinancialsModalOpen} onClose={() => setIsFinancialsModalOpen(false)} title="Financials">
          <div className="space-y-4">
              <div className="p-4 bg-gray-100 dark:bg-slate-700 rounded-lg">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Current Contracted Value</p>
                  <p className="text-3xl font-bold text-indigo-500">${financialMetrics.contracted.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-gray-100 dark:bg-slate-700 rounded-lg">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Total Invoiced Value</p>
                  <p className="text-3xl font-bold text-yellow-500">${financialMetrics.invoiced.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-gray-100 dark:bg-slate-700 rounded-lg">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Paid (This Calendar Year)</p>
                  <p className="text-3xl font-bold text-green-500">${financialMetrics.paidThisYear.toLocaleString()}</p>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 pt-2 text-center">
                Note: Financial metrics include archived leads. To exclude an archived lead from these totals, please edit its value to $0.
              </p>
          </div>
      </Modal>

      <Modal isOpen={isArchiveModalOpen} onClose={() => setIsArchiveModalOpen(false)} title="Archived Leads">
          <div className="space-y-3">
              {archivedLeads.length > 0 ? archivedLeads.map(lead => (
                  <div key={lead.id} className="flex justify-between items-center p-3 bg-gray-100 dark:bg-slate-700 rounded-md">
                      <div>
                          <p className="font-semibold">{lead.companyName}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{lead.contactName}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => { handleOpenLead(lead); setIsArchiveModalOpen(false); }} 
                          className="px-3 py-1 text-sm bg-white hover:bg-gray-100 border border-gray-300 dark:bg-slate-600 text-slate-700 dark:text-slate-200 rounded dark:hover:bg-slate-500 dark:border-slate-500">
                            View Details
                        </button>
                        <button onClick={() => handleUnarchiveLead(lead.id)} className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600">
                            Unarchive
                        </button>
                      </div>
                  </div>
              )) : (
                  <p>No archived leads.</p>
              )}
          </div>
      </Modal>
    </div>
  );
}

export default App;