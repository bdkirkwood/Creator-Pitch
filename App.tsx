import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import LeadBoard from './components/LeadBoard';
import OnboardingModal from './components/OnboardingModal';
import TodoList from './components/TodoList';
import { Lead, LeadStage, CreatorSettings, TodoItem } from './types';
import { LEAD_STAGES, PlusIcon, SettingsIcon, ArchiveIcon, DuplicateIcon, MailIcon, CopyIcon, EditIcon, DollarSignIcon, CalendarIcon, ExportIcon, ImportIcon, SearchIcon, XCircleIcon, QuestionMarkCircleIcon, ChevronRightIcon, TrashIcon, LogoutIcon, ListIcon, UnarchiveIcon, DotsVerticalIcon, CheckIcon } from './constants';
import { getLeadSummary, generatePitchEmail, generateInvoiceReminderEmail } from './services/geminiService';
import { loadLeads, saveLeads, loadSettings, saveSettings, clearAllData, initialCreatorSettings, initialCreatorSettings, isOnboardingComplete, setOnboardingComplete, loadTodos, saveTodos } from './services/storageService';

const linkify = (text: string) => {
    if (!text) return '';
    const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    // Basic email regex to avoid complex validation, just looks for string@string.string
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/ig;
    let linkedText = text.replace(urlRegex, (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:underline">${url}</a>`);
    linkedText = linkedText.replace(emailRegex, (email) => `<a href="mailto:${email}" class="text-blue-400 hover:underline">${email}</a>`);
    return linkedText;
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

if (isLoading) {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-slate-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mx-auto mb-4"></div>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Loading your pipeline...</p>
      </div>
    </div>
  );
}
    
  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in-scale-up" onClick={handleModalContentClick}>
        <div className="p-6">
          <div className="flex justify-between items-center border-b pb-3 mb-6 border-gray-200 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{lead.companyName}</h2>
              <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-3xl leading-none">&times;</button>
          </div>
          
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-200 dark:border-slate-700 space-y-3">
                    <h3 className="font-semibold text-sm text-slate-500 dark:text-slate-400">Contact Information</h3>
                    <div className="text-sm"><strong>Contact:</strong> {lead.contactName}</div>
                    <div className="text-sm"><strong>Email:</strong> <a href={`mailto:${lead.email}`} className="text-blue-500 hover:underline">{lead.email}</a></div>
                    <div className="text-sm"><strong>Phone:</strong> {lead.phone ? <a href={`tel:${lead.phone}`} className="text-blue-500 hover:underline">{lead.phone}</a> : 'N/A'}</div>
                    {lead.prFirmName && <div className="text-sm"><strong>PR Firm:</strong> {lead.prFirmName}</div>}
                </div>
                 <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-200 dark:border-slate-700 space-y-3">
                    <h3 className="font-semibold text-sm text-slate-500 dark:text-slate-400">Collaboration Details</h3>
                    <div className="text-sm"><strong>Stage:</strong> {lead.stage}</div>
                    <div>
                        <strong className="text-sm">Value:</strong>{' '}
                        {['Contract', 'Invoice', 'Paid'].includes(lead.stage) && lead.value === 0 ? (
                            <span className="text-lg font-bold text-purple-600 dark:text-purple-400">In-Kind Collab</span>
                        ) : (
                            <span className="text-lg font-bold">${lead.value.toLocaleString()}</span>
                        )}
                      {creatorSettings.agentModeEnabled && creatorSettings.agentPercentage > 0 && !lead.agentSplitDisabled && (
                        <div className="mt-2 p-2 bg-gray-100 dark:bg-slate-700/50 rounded-md text-xs space-y-1">
                            <div className="flex justify-between">
                                <span className="text-slate-500 dark:text-slate-400">Creator Payout ({100 - creatorSettings.agentPercentage}%):</span>
                                <strong className="text-green-600 dark:text-green-400">${(lead.value * (1 - creatorSettings.agentPercentage / 100)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500 dark:text-slate-400">Agent Fee ({creatorSettings.agentPercentage}%):</span>
                                <strong className="text-slate-800 dark:text-slate-200">${(lead.value * (creatorSettings.agentPercentage / 100)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                            </div>
                        </div>
                      )}
                    </div>
                </div>
            </div>
            
            <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-200 dark:border-slate-700 space-y-3 mb-6">
                <h3 className="font-semibold text-sm text-slate-500 dark:text-slate-400">Key Dates & Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
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
                </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-sm text-slate-500 dark:text-slate-400 mb-2">Notes</h3>
              <div className="p-3 bg-gray-100 dark:bg-slate-700/50 rounded-lg whitespace-pre-wrap break-words min-h-[50px] text-sm" dangerouslySetInnerHTML={{ __html: linkify(lead.notes) }} />
            </div>

          <div className="space-y-8">
            <div>
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-600 dark:text-slate-400 text-lg">AI Summary & Next Steps</h3>
                <button onClick={handleSummary} disabled={isLoadingSummary} className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300">
                  {isLoadingSummary ? 'Generating...' : 'Generate'}
                </button>
              </div>
              {summary && <div className="mt-3 p-3 bg-gray-100 dark:bg-slate-700/50 rounded-md"><pre className="whitespace-pre-wrap font-sans text-sm">{summary}</pre></div>}
            </div>
            
            {(lead.stage === 'Lead' || lead.stage === 'Pitch') && (
              <div>
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-slate-600 dark:text-slate-400 text-lg">AI-Generated Pitch Email</h3>
                  <button onClick={handleEmail} disabled={isLoadingEmail} className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-green-300">
                    {isLoadingEmail ? 'Generating...' : 'Generate Pitch'}
                  </button>
                </div>
                {email && (
                  <div className="mt-3 p-3 bg-gray-100 dark:bg-slate-700/50 rounded-md text-sm">
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
                    <h3 className="font-bold text-slate-600 dark:text-slate-400 text-lg">Invoice Reminder</h3>
                    <button onClick={handleReminderEmail} disabled={isLoadingReminder} className="px-3 py-1 text-sm bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-purple-300">
                      {isLoadingReminder ? 'Generating...' : 'Create Reminder Email'}
                    </button>
                  </div>
                  {reminderEmail && (
                    <div className="mt-3 p-3 bg-gray-100 dark:bg-slate-700/50 rounded-md text-sm">
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
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in-scale-up" onClick={e => e.stopPropagation()}>
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

const AccordionItem: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-gray-200 dark:border-slate-700">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center text-left py-4 px-2 hover:bg-gray-50 dark:hover:bg-slate-700/50"
            >
                <span className="font-semibold">{title}</span>
                <span className={`transform transition-transform duration-200 ${isOpen ? 'rotate-90' : 'rotate-0'}`}>
                    <ChevronRightIcon />
                </span>
            </button>
            {isOpen && (
                <div className="p-4 bg-gray-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-300">
                    {children}
                </div>
            )}
        </div>
    );
};


function App() {
const [leads, setLeads] = useState<Lead[]>([]);
const [creatorSettings, setCreatorSettings] = useState<CreatorSettings>(initialCreatorSettings);
const [todos, setTodos] = useState<TodoItem[]>([]);
const [showOnboarding, setShowOnboarding] = useState(false);
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  const init = async () => {
    const [loadedLeads, loadedSettings, loadedTodos, onboardingDone] = await Promise.all([
      loadLeads(),
      loadSettings(),
      loadTodos(),
      isOnboardingComplete(),
    ]);
    setLeads(loadedLeads);
    setCreatorSettings(loadedSettings);
    setTodos(loadedTodos);
    setShowOnboarding(!onboardingDone);
    setIsLoading(false);
  };
  init();
}, []);

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [isEditLeadModalOpen, setIsEditLeadModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isFinancialsModalOpen, setIsFinancialsModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isResetConfirmModalOpen, setIsResetConfirmModalOpen] = useState(false);
  const [isLogoutConfirmModalOpen, setIsLogoutConfirmModalOpen] = useState(false);
  const [isTodoListOpen, setIsTodoListOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showFollowUpAlerts, setShowFollowUpAlerts] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const [movingLeadId, setMovingLeadId] = useState<string | null>(null);
  const [completingTodoId, setCompletingTodoId] = useState<string | null>(null);
  
  const [addLeadState, setAddLeadState] = useState<'idle' | 'adding' | 'added'>('idle');
  const [editLeadState, setEditLeadState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [settingsSaveStatus, setSettingsSaveStatus] = useState<'idle' | 'saved'>('idle');
  const isInitialSettingsLoad = useRef(true);
  
useEffect(() => {
  if (!isLoading) saveLeads(leads);
}, [leads, isLoading]);

useEffect(() => {
  if (isInitialSettingsLoad.current) {
    isInitialSettingsLoad.current = false;
    return;
  }
  if (!isLoading) {
    saveSettings(creatorSettings);
    setSettingsSaveStatus('saved');
    const timer = setTimeout(() => setSettingsSaveStatus('idle'), 2000);
    return () => clearTimeout(timer);
  }
}, [creatorSettings, isLoading]);

useEffect(() => {
  if (!isLoading) saveTodos(todos);
}, [todos, isLoading]);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
            setIsMobileMenuOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

const handleOnboardingComplete = useCallback(async () => {
  await setOnboardingComplete();
  setShowOnboarding(false);
  const [leads, todos] = await Promise.all([loadLeads(), loadTodos()]);
  setLeads(leads);
  setTodos(todos);
}, []);


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

  const financialMetrics = useMemo(() => {
    const calculateMetricsForLeads = (filteredLeads: Lead[]) => {
        let total = 0;
        let creatorPayout = 0;
        let agentFee = 0;

        for (const l of filteredLeads) {
            total += l.value;
            const isSplitApplicable = creatorSettings.agentModeEnabled && !l.agentSplitDisabled;
            if (isSplitApplicable && creatorSettings.agentPercentage > 0) {
                const agentDecimal = creatorSettings.agentPercentage / 100;
                creatorPayout += l.value * (1 - agentDecimal);
                agentFee += l.value * agentDecimal;
            } else {
                creatorPayout += l.value;
            }
        }
        return { total, creatorPayout, agentFee };
    };

    const contractedLeads = leads.filter(l => l.stage === 'Contract');
    const invoicedLeads = leads.filter(l => l.stage === 'Invoice');
    const currentYear = new Date().getFullYear();
    const paidLeadsThisYear = leads.filter(l => l.stage === 'Paid' && new Date(l.lastContacted).getFullYear() === currentYear);

    return {
        contracted: calculateMetricsForLeads(contractedLeads),
        invoiced: calculateMetricsForLeads(invoicedLeads),
        paidThisYear: calculateMetricsForLeads(paidLeadsThisYear)
    };
  }, [leads, creatorSettings.agentModeEnabled, creatorSettings.agentPercentage]);

  const hasOverdueTasks = useMemo(() => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return todos.some(t => !t.isCompleted && !t.isArchived && t.dueDate && new Date(t.dueDate) < today);
  }, [todos]);

  const handleOpenLead = (lead: Lead) => setSelectedLead(lead);
  const handleCloseModal = () => setSelectedLead(null);
  
  const handleOpenEditModal = (lead: Lead) => {
    setSelectedLead(lead);
    setIsEditLeadModalOpen(true);
  }

  const handleMoveStage = useCallback((leadId: string, direction: 'forward' | 'backward') => {
    setMovingLeadId(leadId);
    setTimeout(() => setMovingLeadId(null), 700); // Duration of the animation

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
    setAddLeadState('adding');
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
        agentSplitDisabled: creatorSettings.agentModeEnabled ? formData.get('agentSplitDisabled') === 'on' : false,
    };
    setLeads(prev => [newLead, ...prev]);
    setAddLeadState('added');
    
    setTimeout(() => {
        setIsAddLeadModalOpen(false);
        setAddLeadState('idle');
    }, 1500);
  };
  
  const handleUpdateLead = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEditLeadState('saving');
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
        agentSplitDisabled: creatorSettings.agentModeEnabled ? formData.get('agentSplitDisabled') === 'on' : selectedLead!.agentSplitDisabled,
    };
    setLeads(prev => prev.map(l => l.id === updatedLead.id ? updatedLead : l));
    setSelectedLead(updatedLead);
    setEditLeadState('saved');

    setTimeout(() => {
        setEditLeadState('idle');
    }, 2000);
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
    } else {
        setCreatorSettings(prev => ({
            ...prev,
            [name]: e.target.type === 'number' ? Number(value) : value,
        }));
    }
  };

  const handleSocialMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setCreatorSettings(prev => {
        const currentNetworks = prev.socialMediaNetworks || [];
        if (checked) {
            return { ...prev, socialMediaNetworks: [...currentNetworks, name] };
        } else {
            return { ...prev, socialMediaNetworks: currentNetworks.filter(network => network !== name) };
        }
    });
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
        'originalStage', 'emailThreadLink', 'prFirmName', 'invoiceLink', 'invoiceDueDate',
        'agentSplitDisabled',
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
    link.setAttribute('download', `creator_pitch_export_${timestamp}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  const handleDownloadTemplate = () => {
    const headers: (keyof Omit<Lead, 'id' | 'isArchived' | 'originalStage'>)[] = [
      'companyName', 'contactName', 'email', 'phone', 'stage', 'value', 
      'lastContacted', 'notes', 'emailThreadLink', 'prFirmName', 
      'invoiceLink', 'invoiceDueDate', 'agentSplitDisabled'
    ];
    const csvString = headers.join(',');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `creator_pitch_template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  const handleImportLeads = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
        const text = event.target?.result as string;
        if (!text) return;

        const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
        if (lines.length < 2) {
            alert("CSV file is empty or contains only a header.");
            return;
        }

        const headerLine = lines.shift()!.split(',').map(h => h.trim());
        const importedLeads: Lead[] = [];
        let skippedCount = 0;

        lines.forEach(line => {
            const data = line.split(',');
            const row: any = {};
            headerLine.forEach((header, index) => {
                row[header] = data[index] ? data[index].trim() : '';
            });

            // Basic validation
            if (!row.companyName || !row.contactName || !row.email || !row.value) {
                skippedCount++;
                return;
            }

            const value = parseFloat(row.value);
            if (isNaN(value)) {
                skippedCount++;
                return;
            }
            
            const stage = LEAD_STAGES.includes(row.stage as LeadStage) ? row.stage : 'Lead';
            const lastContacted = row.lastContacted && !isNaN(new Date(row.lastContacted).getTime()) ? new Date(row.lastContacted).toISOString() : new Date().toISOString();
            
            const newLead: Lead = {
                id: `${Date.now()}-${importedLeads.length}`,
                companyName: row.companyName,
                contactName: row.contactName,
                email: row.email,
                phone: row.phone || '',
                stage: stage,
                value: value,
                lastContacted: lastContacted,
                notes: row.notes || '',
                isArchived: false,
                emailThreadLink: row.emailThreadLink || undefined,
                prFirmName: row.prFirmName || undefined,
                invoiceLink: row.invoiceLink || undefined,
                invoiceDueDate: row.invoiceDueDate && !isNaN(new Date(row.invoiceDueDate).getTime()) ? new Date(row.invoiceDueDate).toISOString() : undefined,
                agentSplitDisabled: row.agentSplitDisabled === 'true',
            };
            importedLeads.push(newLead);
        });

        if (importedLeads.length > 0) {
            setLeads(prev => [...importedLeads, ...prev]);
        }

        alert(`Import complete!\n\nSuccessfully imported: ${importedLeads.length} leads.\nSkipped rows (missing required data): ${skippedCount}`);
        setIsImportModalOpen(false);
        setSelectedFile(null);
    };
    reader.readAsText(file);
  };

  const handleResetAccountData = () => {
    clearAllData();
    // After clearing storage, reset the React state to the initial default values.
    setLeads([]);
    setCreatorSettings(initialCreatorSettings);
    setTodos([]);
    
    setIsResetConfirmModalOpen(false);
    setIsSettingsModalOpen(false);
    // Show onboarding again after a reset
    setShowOnboarding(true);
  };

  const handleLogout = useCallback(() => {
    // Placeholder for Firebase authentication signOut.
    // This will be replaced by the developer implementing the backend.
    // For now, it simply closes the modals.
    setIsLogoutConfirmModalOpen(false);
    setIsSettingsModalOpen(false);
  }, []);

  const handleAddTodo = useCallback((subject: string, description: string, dueDate?: string) => {
    const newTodo: TodoItem = {
        id: Date.now().toString(),
        subject,
        description,
        dueDate,
        isCompleted: false,
        isArchived: false,
        order: (todos.length > 0 ? Math.max(...todos.map(t => t.order)) : 0) + 1,
    };
    setTodos(prev => [newTodo, ...prev]);
  }, [todos]);

  const handleUpdateTodo = useCallback((updatedTodo: TodoItem) => {
      setTodos(prev => prev.map(t => t.id === updatedTodo.id ? updatedTodo : t));
  }, []);

  const handleToggleCompleteTodo = useCallback((todoId: string) => {
    const todo = todos.find(t => t.id === todoId);
    if (!todo) return;
    
    if (todo.isCompleted) {
        // If un-completing
        handleUpdateTodo({ ...todo, isCompleted: false, completedAt: undefined });
    } else {
        // If completing
        setCompletingTodoId(todoId);
        setTimeout(() => {
            handleUpdateTodo({ ...todo, isCompleted: true, completedAt: new Date().toISOString() });
            setCompletingTodoId(null);
        }, 300); // Animation duration
    }
  }, [todos, handleUpdateTodo]);

  const handleDeleteTodo = useCallback((todoId: string) => {
      setTodos(prev => prev.filter(t => t.id !== todoId));
  }, []);

  const handleDuplicateTodo = useCallback((todoId: string) => {
    const todoToDuplicate = todos.find(t => t.id === todoId);
    if (todoToDuplicate) {
        const newTodo: TodoItem = {
            ...todoToDuplicate,
            id: Date.now().toString(),
            subject: `${todoToDuplicate.subject} (Copy)`,
            isCompleted: false,
            completedAt: undefined,
            isArchived: false,
            order: (todos.length > 0 ? Math.max(...todos.map(t => t.order)) : 0) + 1,
        };
        setTodos(prev => [newTodo, ...prev]);
    }
  }, [todos]);

  const handleReorderTodo = useCallback((todoId: string, direction: 'up' | 'down') => {
      setTodos(prevTodos => {
          const activeTodos = prevTodos
            .filter(t => !t.isCompleted && !t.isArchived)
            .sort((a, b) => a.order - b.order);

          const currentIndex = activeTodos.findIndex(t => t.id === todoId);
          if (currentIndex === -1) return prevTodos;

          const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
          if (newIndex < 0 || newIndex >= activeTodos.length) return prevTodos;
          
          const newTodos = [...prevTodos];
          const taskToMove = newTodos.find(t => t.id === activeTodos[currentIndex].id)!;
          const taskToSwapWith = newTodos.find(t => t.id === activeTodos[newIndex].id)!;
          
          // Swap order properties
          [taskToMove.order, taskToSwapWith.order] = [taskToSwapWith.order, taskToMove.order];

          return newTodos;
      });
  }, []);

  return (
    <div className="bg-gray-50 dark:bg-slate-900 h-screen text-slate-900 dark:text-slate-50 flex flex-col">
      {showOnboarding && <OnboardingModal onComplete={handleOnboardingComplete} />}

      <header className="p-4 bg-white dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">CreatorPitch.io</h1>
            <div className="relative w-40 md:w-64 lg:w-96">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                    type="text"
                    placeholder={isMobile ? "Search" : "Search by company, contact, email, or notes..."}
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
            {isMobile ? (
                <>
                    <button onClick={() => setIsAddLeadModalOpen(true)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700" aria-label="Add Lead">
                        <PlusIcon />
                    </button>
                    <div className="relative" ref={mobileMenuRef}>
                        <button onClick={() => setIsMobileMenuOpen(prev => !prev)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 relative" aria-label="More actions">
                            <DotsVerticalIcon />
                             {hasOverdueTasks && (
                                <span className="absolute top-1 right-1 flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                </span>
                            )}
                        </button>
                        {isMobileMenuOpen && (
                            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-md shadow-lg z-50 border border-gray-200 dark:border-slate-700 animate-fade-in-scale-up origin-top-right">
                                <ul className="py-1">
                                    <li>
                                        <button onClick={() => { setIsTodoListOpen(prev => !prev); setIsMobileMenuOpen(false); }} className="w-full flex items-center justify-between px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700">
                                            <span>To-Do List</span>
                                            {hasOverdueTasks && <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>}
                                        </button>
                                    </li>
                                    <li><button onClick={() => { setIsFinancialsModalOpen(true); setIsMobileMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700">Financials</button></li>
                                    <li><button onClick={() => { setIsHelpModalOpen(true); setIsMobileMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700">Help & FAQ</button></li>
                                    <li><button onClick={() => { setIsSettingsModalOpen(true); setIsMobileMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700">Creator Settings</button></li>
                                </ul>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <>
                    <button onClick={() => setIsTodoListOpen(prev => !prev)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 relative" aria-label="Toggle To-Do List">
                        <ListIcon />
                        {hasOverdueTasks && (
                            <span className="absolute top-1 right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                            </span>
                        )}
                    </button>
                    <button onClick={() => setIsFinancialsModalOpen(true)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700" aria-label="View Financials">
                        <DollarSignIcon />
                    </button>
                    <button onClick={() => setIsAddLeadModalOpen(true)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700" aria-label="Add Lead">
                        <PlusIcon />
                    </button>
                    <button onClick={() => setIsHelpModalOpen(true)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700" aria-label="Help & FAQ">
                        <QuestionMarkCircleIcon />
                    </button>
                    <button onClick={() => setIsSettingsModalOpen(true)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700" aria-label="Creator Settings">
                        <SettingsIcon />
                    </button>
                </>
            )}
        </div>
      </header>
      
      <div className="flex-grow flex flex-row overflow-hidden">
        <div className={`h-full flex-grow transition-all duration-300 ease-in-out min-w-0 ${isTodoListOpen && !isMobile ? 'w-2/3 lg:w-3/4' : 'w-full'}`}>
            <LeadBoard leads={activeLeads} onOpenLead={handleOpenLead} onMoveStage={handleMoveStage} showFollowUpAlerts={showFollowUpAlerts} movingLeadId={movingLeadId} />
        </div>
        {!isMobile && (
            <div className={`h-full transition-all duration-300 ease-in-out flex-shrink-0 border-l border-gray-200 dark:border-slate-700 ${isTodoListOpen ? 'w-1/3 lg:w-1/4 max-w-md' : 'w-0'}`} style={{ overflow: 'hidden' }}>
                 <TodoList
                    todos={todos}
                    onAdd={handleAddTodo}
                    onUpdate={handleUpdateTodo}
                    onDelete={handleDeleteTodo}
                    onDuplicate={handleDuplicateTodo}
                    onReorder={handleReorderTodo}
                    onClose={() => setIsTodoListOpen(false)}
                    onToggleComplete={handleToggleCompleteTodo}
                    completingTodoId={completingTodoId}
                />
            </div>
        )}
      </div>

      {isMobile && isTodoListOpen && (
        <div className="fixed inset-0 z-40 bg-gray-50 dark:bg-slate-900 animate-fade-in-scale-up">
             <TodoList
                todos={todos}
                onAdd={handleAddTodo}
                onUpdate={handleUpdateTodo}
                onDelete={handleDeleteTodo}
                onDuplicate={handleDuplicateTodo}
                onReorder={handleReorderTodo}
                onClose={() => setIsTodoListOpen(false)}
                onToggleComplete={handleToggleCompleteTodo}
                completingTodoId={completingTodoId}
            />
        </div>
      )}
      
      <div className="fixed bottom-6 right-6 z-20 flex flex-col space-y-3">
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
              {creatorSettings.agentModeEnabled && (
                <div className="flex items-center justify-between bg-gray-50 dark:bg-slate-700/50 p-3 rounded-md">
                  <div>
                    <label htmlFor="agentSplitDisabled" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Disable Agent Commission
                    </label>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Check this if this lead is a direct deal and not subject to agent fees.</p>
                  </div>
                  <input
                    id="agentSplitDisabled"
                    name="agentSplitDisabled"
                    type="checkbox"
                    className="h-5 w-5 rounded border-gray-300 dark:border-slate-500 text-blue-600 focus:ring-blue-500 bg-white dark:bg-slate-600"
                  />
                </div>
              )}
              <button
                type="submit"
                className={`w-full p-2 rounded transition-colors duration-200 flex items-center justify-center ${
                    addLeadState === 'added'
                        ? 'bg-green-500 text-white'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                } disabled:bg-opacity-70 disabled:cursor-not-allowed`}
                disabled={addLeadState !== 'idle'}
              >
                {addLeadState === 'idle' && 'Add Lead'}
                {addLeadState === 'adding' && 'Adding...'}
                {addLeadState === 'added' && (
                    <>
                        <CheckIcon className="h-5 w-5 mr-2" />
                        Lead Added!
                    </>
                )}
              </button>
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
              {creatorSettings.agentModeEnabled && (
                <div className="flex items-center justify-between bg-gray-50 dark:bg-slate-700/50 p-3 rounded-md">
                  <div>
                    <label htmlFor="agentSplitDisabledEdit" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Disable Agent Commission
                    </label>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Check this if this lead is a direct deal and not subject to agent fees.</p>
                  </div>
                  <input
                    id="agentSplitDisabledEdit"
                    name="agentSplitDisabled"
                    type="checkbox"
                    defaultChecked={selectedLead?.agentSplitDisabled}
                    className="h-5 w-5 rounded border-gray-300 dark:border-slate-500 text-blue-600 focus:ring-blue-500 bg-white dark:bg-slate-600"
                  />
                </div>
              )}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditLeadModalOpen(false)}
                  className="px-4 py-2 bg-white hover:bg-gray-100 border border-gray-300 dark:bg-slate-600 text-slate-700 dark:text-slate-200 rounded dark:hover:bg-slate-500 dark:border-slate-500"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded transition-colors duration-200 flex items-center justify-center w-32 ${
                    editLeadState === 'saved'
                    ? 'bg-green-500 text-white'
                    : 'bg-green-500 text-white hover:bg-green-600'
                  } disabled:bg-opacity-70 disabled:cursor-not-allowed`}
                  disabled={editLeadState !== 'idle'}
                >
                  {editLeadState === 'idle' && 'Save Changes'}
                  {editLeadState === 'saving' && 'Saving...'}
                  {editLeadState === 'saved' && (
                      <>
                          <CheckIcon className="h-5 w-5 mr-2" />
                          Saved!
                      </>
                  )}
                </button>
              </div>
          </form>
      </Modal>
      )}

      <Modal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} title="Creator Settings">
          <div className="space-y-6">
            <div className="space-y-4">
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
            </div>
            
            <div className="space-y-4 pt-6">
                <h3 className="text-lg font-semibold border-b pb-2 dark:border-slate-600">Social Media & Content Performance</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Social Media Networks</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-4">
                            {['Instagram', 'Facebook', 'TikTok', 'YouTube', 'Threads', 'Twitter', 'Snapchat', 'LinkedIn', 'Pinterest'].map(network => (
                                <label key={network} className="flex items-center space-x-2 text-sm font-normal">
                                    <input
                                        type="checkbox"
                                        name={network}
                                        checked={creatorSettings.socialMediaNetworks.includes(network)}
                                        onChange={handleSocialMediaChange}
                                        className="h-4 w-4 rounded border-gray-300 dark:border-slate-500 text-blue-600 focus:ring-blue-500 bg-white dark:bg-slate-700"
                                    />
                                    <span>{network}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <FormInput label="Total Follower Count" name="totalFollowers" type="number" value={creatorSettings.totalFollowers} onChange={handleSettingsChange} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <FormInput label="Top 3 Countries" name="demographics.topCountries" value={creatorSettings.demographics.topCountries} onChange={handleSettingsChange} />
                     <FormInput label="Ages" name="demographics.ages" value={creatorSettings.demographics.ages} onChange={handleSettingsChange} />
                     <FormInput label="Gender Split" name="demographics.genderSplit" value={creatorSettings.demographics.genderSplit} onChange={handleSettingsChange} />
                </div>
                 <FormInput label="Content Style Keywords" name="contentStyleKeywords" value={creatorSettings.contentStyleKeywords} onChange={handleSettingsChange} />
                 <FormTextarea label="List of Past Collaborations" name="pastCollaborations" value={creatorSettings.pastCollaborations} onChange={handleSettingsChange} rows={3}/>
            </div>
            
            <div className="space-y-4 pt-6">
                <h3 className="text-lg font-semibold border-b pb-2 dark:border-slate-600">Communication Style</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput label="Tone Preference" name="tonePreference" value={creatorSettings.tonePreference} onChange={handleSettingsChange} />
                    <FormInput label="Level of Formality" name="formality" value={creatorSettings.formality} onChange={handleSettingsChange} />
                </div>
                <FormTextarea label="Signature Style" name="signatureStyle" value={creatorSettings.signatureStyle} onChange={handleSettingsChange} rows={2} />
                <FormTextarea label="Email Persona Examples (sample emails)" name="emailPersonaExamples" value={creatorSettings.emailPersonaExamples} onChange={handleSettingsChange} rows={4}/>
            </div>
            
            <div className="space-y-4 pt-6">
                <h3 className="text-lg font-semibold border-b pb-2 dark:border-slate-600">Productivity</h3>
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
            </div>

            <div className="space-y-4 pt-6">
                <h3 className="text-lg font-semibold border-b pb-2 dark:border-slate-600">Financials</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <label htmlFor="agentModeToggle" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Enable Agent/Management Mode
                            </label>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Calculate and display creator/agent payment splits.</p>
                        </div>
                        <button
                            id="agentModeToggle"
                            role="switch"
                            aria-checked={creatorSettings.agentModeEnabled}
                            onClick={() => setCreatorSettings(prev => ({ ...prev, agentModeEnabled: !prev.agentModeEnabled }))}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-800 ${creatorSettings.agentModeEnabled ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-600'}`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${creatorSettings.agentModeEnabled ? 'translate-x-6' : 'translate-x-1'}`}
                            />
                        </button>
                    </div>
                    {creatorSettings.agentModeEnabled && (
                        <FormInput 
                            label="Agent/Manager Percentage (%)" 
                            name="agentPercentage" 
                            type="number" 
                            value={creatorSettings.agentPercentage} 
                            onChange={handleSettingsChange} 
                            min="0"
                            max="100"
                            step="0.1"
                        />
                    )}
                </div>
            </div>

            <div className="space-y-4 pt-6">
                <h3 className="text-lg font-semibold border-b pb-2 dark:border-slate-600">Data Management</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Import Leads
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Import new leads from a formatted CSV file.</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                setIsSettingsModalOpen(false);
                                setIsImportModalOpen(true);
                            }}
                            className="flex items-center px-3 py-2 text-sm bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                        >
                            <ImportIcon className="h-5 w-5 mr-2" />
                            Import Data
                        </button>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Export Leads
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Export all lead data to a CSV file as a backup.</p>
                        </div>
                        <button
                            type="button"
                            onClick={handleExportData}
                            className="flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                        >
                            <ExportIcon className="h-5 w-5 mr-2" />
                            Export Data
                        </button>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Reset All Data
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Permanently delete all leads and settings.</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsResetConfirmModalOpen(true)}
                            className="flex items-center px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        >
                            <TrashIcon className="h-5 w-5 mr-2" />
                            Reset Data
                        </button>
                    </div>
                </div>
            </div>

            <div className="space-y-4 pt-6">
                <h3 className="text-lg font-semibold border-b pb-2 dark:border-slate-600">Account</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Change Subscription
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Switch between monthly, yearly, etc. once deployed.</p>
                        </div>
                        <button
                            type="button"
                            disabled
                            className="flex items-center px-3 py-2 text-sm bg-gray-500 text-white rounded-md transition-colors disabled:bg-gray-400 dark:disabled:bg-slate-600 dark:disabled:text-slate-400 disabled:cursor-not-allowed"
                        >
                            Change Plan
                        </button>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Cancel Subscription
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">This will be enabled to stop future payments once deployed.</p>
                        </div>
                        <button
                            type="button"
                            disabled
                            className="flex items-center px-3 py-2 text-sm bg-red-600 text-white rounded-md transition-colors disabled:bg-red-400 dark:disabled:bg-red-800 dark:disabled:text-red-400 disabled:cursor-not-allowed"
                        >
                            Cancel Subscription
                        </button>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Logout
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">You will be logged out of your account on this device.</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsLogoutConfirmModalOpen(true)}
                            className="flex items-center px-3 py-2 text-sm bg-white hover:bg-gray-100 border border-gray-300 dark:bg-slate-600 text-slate-700 dark:text-slate-200 rounded dark:hover:bg-slate-500 dark:border-slate-500"
                        >
                            <LogoutIcon className="h-5 w-5 mr-2" />
                            Logout
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="flex justify-end items-center space-x-4 pt-4">
                 <div className={`text-sm text-green-500 transition-opacity duration-300 ${settingsSaveStatus === 'saved' ? 'opacity-100' : 'opacity-0'}`}>
                    Changes saved automatically!
                </div>
                <button 
                    type="button" 
                    onClick={() => setIsSettingsModalOpen(false)} 
                    className="px-6 py-2 bg-white hover:bg-gray-100 border border-gray-300 dark:bg-slate-600 text-slate-700 dark:text-slate-200 rounded dark:hover:bg-slate-500 dark:border-slate-500"
                >
                    Close
                </button>
            </div>
          </div>
      </Modal>

      <Modal isOpen={isFinancialsModalOpen} onClose={() => setIsFinancialsModalOpen(false)} title="Financials">
          <div className="space-y-4">
              <div className="p-4 bg-gray-100 dark:bg-slate-700 rounded-lg">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Current Contracted Value</p>
                  <p className="text-3xl font-bold text-indigo-500">${financialMetrics.contracted.total.toLocaleString()}</p>
                  {creatorSettings.agentModeEnabled && creatorSettings.agentPercentage > 0 && (
                        <div className="text-xs mt-2 pt-2 border-t border-gray-200 dark:border-slate-600 space-y-1">
                            <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                                <span>Creator Payout:</span>
                                <span className="font-semibold text-green-600 dark:text-green-400">${financialMetrics.contracted.creatorPayout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                                <span>Agent Fee:</span>
                                <span className="font-semibold">${financialMetrics.contracted.agentFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    )}
              </div>
              <div className="p-4 bg-gray-100 dark:bg-slate-700 rounded-lg">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Total Invoiced Value</p>
                  <p className="text-3xl font-bold text-yellow-500">${financialMetrics.invoiced.total.toLocaleString()}</p>
                  {creatorSettings.agentModeEnabled && creatorSettings.agentPercentage > 0 && (
                        <div className="text-xs mt-2 pt-2 border-t border-gray-200 dark:border-slate-600 space-y-1">
                            <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                                <span>Creator Payout:</span>
                                <span className="font-semibold text-green-600 dark:text-green-400">${financialMetrics.invoiced.creatorPayout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                                <span>Agent Fee:</span>
                                <span className="font-semibold">${financialMetrics.invoiced.agentFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    )}
              </div>
              <div className="p-4 bg-gray-100 dark:bg-slate-700 rounded-lg">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Paid (This Calendar Year)</p>
                  <p className="text-3xl font-bold text-green-500">${financialMetrics.paidThisYear.total.toLocaleString()}</p>
                  {creatorSettings.agentModeEnabled && creatorSettings.agentPercentage > 0 && (
                        <div className="text-xs mt-2 pt-2 border-t border-gray-200 dark:border-slate-600 space-y-1">
                            <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                                <span>Creator Payout:</span>
                                <span className="font-semibold text-green-600 dark:text-green-400">${financialMetrics.paidThisYear.creatorPayout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                                <span>Agent Fee:</span>
                                <span className="font-semibold">${financialMetrics.paidThisYear.agentFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    )}
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
      
      <Modal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} title="Help & FAQ">
        <div>
            <AccordionItem title="What is Creator Pitch?">
                <p>Creator Pitch is a Customer Relationship Management (CRM) tool designed specifically for content creators. It helps you manage your brand partnerships from the initial lead to final payment, using a visual pipeline. It also features AI tools to help you write emails and summarize lead information.</p>
            </AccordionItem>
            <AccordionItem title="Is my data private?">
                <p>Yes. All of your lead and settings data is stored <strong>only in your web browser's local storage</strong>. It is never sent to any server or seen by anyone else. This means your data is completely private, but it also means you should export your data regularly as a backup.</p>
            </AccordionItem>
            <AccordionItem title="How do the AI features work?">
                <p>The AI features (Summary, Pitch Email, Invoice Reminder) use the Google Gemini API. To use them, you must have a valid Google AI Studio API key configured for this environment. If the AI features aren't working, please ensure your API key is set up correctly.</p>
            </AccordionItem>
            <AccordionItem title="What do the alerts on the cards mean?">
                <ul className="list-disc list-inside space-y-2">
                    <li><strong className="text-orange-500">Orange Dot:</strong> A follow-up reminder. It appears on leads in the 'Pitch' or 'Negotiation' stage if you haven't contacted them in over 3 days. You can disable this in Settings.</li>
                    <li><strong className="text-red-500">Red Dot:</strong> Indicates an invoice payment is overdue.</li>
                    <li><strong className="text-purple-500">Purple Dot:</strong> A reminder that an invoice is due within the next 3 business days.</li>
                </ul>
            </AccordionItem>
            <AccordionItem title="How do I backup or move my data?">
                <p>Use the "Export Data" button (the upward-pointing arrow icon) on the main screen. This will download a CSV file of all your leads. You can use this file as a backup or to import your data into other applications. There is currently no import feature.</p>
            </AccordionItem>
            <AccordionItem title="Can I customize the lead stages?">
                <p>The lead stages ('Lead', 'Pitch', 'Negotiation', etc.) are fixed and cannot be changed at this time. This is to ensure the pipeline logic works correctly for all users.</p>
            </AccordionItem>
             <AccordionItem title="How are the Financials calculated?">
                <ul className="list-disc list-inside space-y-2">
                    <li><strong>Contracted:</strong> The total value of all leads currently in the 'Contract' stage.</li>
                    <li><strong>Invoiced:</strong> The total value of all leads currently in the 'Invoice' stage.</li>
                    <li><strong>Paid (This Calendar Year):</strong> The total value of all leads moved to the 'Paid' stage within the current calendar year.</li>
                </ul>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Note: These calculations include archived leads. To exclude a lead, edit its value to $0.</p>
            </AccordionItem>
        </div>
      </Modal>

      <Modal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} title="Import Leads from CSV">
        <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">Upload a CSV file to add new leads. Make sure your file matches the required format. Download the template to get started.</p>
            <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-2 rounded-md">
                <strong>Important:</strong> The import functionality assumes fields do not contain commas. If a field (like 'notes') has a comma, it may cause the row to be imported incorrectly.
            </p>
            <button
                onClick={handleDownloadTemplate}
                className="w-full text-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
                Download CSV Template
            </button>
            <div className="mt-4">
                <label htmlFor="csv-upload" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Upload File:</label>
                <input
                    id="csv-upload"
                    type="file"
                    accept=".csv"
                    onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                    className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-slate-700 dark:file:text-slate-200 dark:hover:file:bg-slate-600"
                />
            </div>
            <button
                onClick={() => selectedFile && handleImportLeads(selectedFile)}
                disabled={!selectedFile}
                className="w-full mt-6 bg-green-500 text-white p-2 rounded-md hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
                Import Leads
            </button>
        </div>
      </Modal>

      <Modal isOpen={isResetConfirmModalOpen} onClose={() => setIsResetConfirmModalOpen(false)} title="Confirm Data Reset">
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Are you absolutely sure you want to proceed? This will <strong className="text-red-500">permanently delete</strong> all of your leads and creator settings from your browser's storage.
          </p>
          <p className="text-sm font-semibold text-red-600 dark:text-red-400">This action cannot be undone.</p>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => setIsResetConfirmModalOpen(false)}
              className="px-4 py-2 bg-white hover:bg-gray-100 border border-gray-300 dark:bg-slate-600 text-slate-700 dark:text-slate-200 rounded dark:hover:bg-slate-500 dark:border-slate-500"
            >
              Cancel
            </button>
            <button
              onClick={handleResetAccountData}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Yes, Reset My Account
            </button>
          </div>
        </div>
      </Modal>
      
      <Modal isOpen={isLogoutConfirmModalOpen} onClose={() => setIsLogoutConfirmModalOpen(false)} title="Confirm Logout">
        <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Are you sure you want to log out?
            </p>
             <p className="text-xs text-slate-500 dark:text-slate-400">
                Note: In a future version with user accounts, your data will be saved. For now, this action is the same as resetting data.
            </p>
            <div className="flex justify-end space-x-3 pt-4">
            <button
                onClick={() => setIsLogoutConfirmModalOpen(false)}
                className="px-4 py-2 bg-white hover:bg-gray-100 border border-gray-300 dark:bg-slate-600 text-slate-700 dark:text-slate-200 rounded dark:hover:bg-slate-500 dark:border-slate-500"
            >
                Cancel
            </button>
            <button
                onClick={handleLogout}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
                Logout
            </button>
            </div>
        </div>
      </Modal>

    </div>
  );
}

export default App;
