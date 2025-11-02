import React, { useState, useMemo } from 'react';
import { Lead, LeadStage } from '../types';
import { LEAD_STAGES, STAGE_COLORS, ChevronLeftIcon, ChevronRightIcon } from '../constants';

interface LeadCardProps {
  lead: Lead;
  onOpen: (lead: Lead) => void;
  onMoveStage: (leadId: string, direction: 'forward' | 'backward') => void;
  showFollowUpAlerts: boolean;
}

const LeadCard: React.FC<LeadCardProps> = ({ lead, onOpen, onMoveStage, showFollowUpAlerts }) => {
  const currentStageIndex = LEAD_STAGES.indexOf(lead.stage);

  const shouldShowAlert = useMemo(() => {
    if (!showFollowUpAlerts) return false;
    if (lead.stage !== 'Pitch' && lead.stage !== 'Negotiation') return false;

    const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;
    const lastContactDate = new Date(lead.lastContacted).getTime();
    const currentDate = new Date().getTime();

    return (currentDate - lastContactDate) > threeDaysInMs;
  }, [lead.stage, lead.lastContacted, showFollowUpAlerts]);

  const invoiceAlert = useMemo(() => {
    if (lead.stage !== 'Invoice' || !lead.invoiceDueDate) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day for comparison
    const dueDate = new Date(lead.invoiceDueDate);
    dueDate.setHours(0, 0, 0, 0); // Also normalize due date

    // Overdue check
    if (today > dueDate) {
      return { type: 'overdue', color: 'bg-red-500', message: 'Payment overdue' };
    }

    // Upcoming check (3 business days)
    let reminderStartDate = new Date(dueDate);
    let businessDaysToCount = 3;
    while (businessDaysToCount > 0) {
      reminderStartDate.setDate(reminderStartDate.getDate() - 1);
      const dayOfWeek = reminderStartDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday or Saturday
        businessDaysToCount--;
      }
    }
    
    // If today is within the reminder window (and not overdue)
    if (today >= reminderStartDate) {
      return { type: 'upcoming', color: 'bg-purple-500', message: 'Invoice due in three business days' };
    }

    return null;
  }, [lead.stage, lead.invoiceDueDate]);


  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 mb-4 transition-shadow hover:shadow-md">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-slate-800 dark:text-slate-100">{lead.companyName}</h4>
            {invoiceAlert && (
                <div title={invoiceAlert.message} className="flex-shrink-0">
                    <span className="relative flex h-3 w-3">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${invoiceAlert.color} opacity-75`}></span>
                        <span className={`relative inline-flex rounded-full h-3 w-3 ${invoiceAlert.color}`}></span>
                    </span>
                </div>
            )}
            {shouldShowAlert && !invoiceAlert && (
                <div title="Follow-up needed: last contacted over 3 days ago." className="flex-shrink-0">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                    </span>
                </div>
            )}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{lead.contactName}</p>
        </div>
        <div className="flex space-x-1">
           <button 
            onClick={() => onMoveStage(lead.id, 'backward')}
            disabled={currentStageIndex === 0}
            className="p-1 rounded-full text-slate-500 hover:bg-gray-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed">
            <ChevronLeftIcon />
          </button>
           <button 
            onClick={() => onMoveStage(lead.id, 'forward')}
            disabled={currentStageIndex === LEAD_STAGES.length - 1}
            className="p-1 rounded-full text-slate-500 hover:bg-gray-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed">
            <ChevronRightIcon />
          </button>
        </div>
      </div>
      <p className="text-xs text-slate-400 mt-3">Last contact: {new Date(lead.lastContacted).toLocaleDateString()}</p>
      <button 
        onClick={() => onOpen(lead)}
        className="w-full mt-4 text-sm bg-white hover:bg-gray-50 text-gray-700 dark:text-slate-200 py-2 rounded-md transition-colors border border-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 dark:border-slate-600">
        View Details
      </button>
    </div>
  );
};

interface LeadColumnProps {
  stage: LeadStage;
  leads: Lead[];
  onOpenLead: (lead: Lead) => void;
  onMoveStage: (leadId: string, direction: 'forward' | 'backward') => void;
  showFollowUpAlerts: boolean;
}

const LeadColumn: React.FC<LeadColumnProps> = ({ stage, leads, onOpenLead, onMoveStage, showFollowUpAlerts }) => {
  const color = STAGE_COLORS[stage];
  return (
    <div className="bg-gray-100 dark:bg-slate-800/50 rounded-lg p-3 w-full md:w-64 lg:w-80 flex-shrink-0 h-full flex flex-col">
      <div className={`flex items-center justify-between px-2 py-1 rounded-md mb-4 ${color} flex-shrink-0`}>
        <h3 className="font-bold text-sm text-white">{stage}</h3>
        <span className="text-xs font-semibold text-white bg-black/20 rounded-full px-2 py-0.5">{leads.length}</span>
      </div>
      <div className="flex-grow overflow-y-auto pr-1">
        {leads.map(lead => (
          <LeadCard key={lead.id} lead={lead} onOpen={onOpenLead} onMoveStage={onMoveStage} showFollowUpAlerts={showFollowUpAlerts} />
        ))}
      </div>
    </div>
  );
};


interface LeadBoardProps {
  leads: Lead[];
  onOpenLead: (lead: Lead) => void;
  onMoveStage: (leadId: string, direction: 'forward' | 'backward') => void;
  showFollowUpAlerts: boolean;
}

const LeadBoard: React.FC<LeadBoardProps> = ({ leads, onOpenLead, onMoveStage, showFollowUpAlerts }) => {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);

  const handlePrevStage = () => {
    setCurrentStageIndex(prev => Math.max(0, prev - 1));
  };

  const handleNextStage = () => {
    setCurrentStageIndex(prev => Math.min(LEAD_STAGES.length - 1, prev + 1));
  };
  
  const currentStageForMobileNav = LEAD_STAGES[currentStageIndex];
  const mobileNavColor = STAGE_COLORS[currentStageForMobileNav];

  return (
    <main className="flex-grow p-4 md:p-6 flex flex-col">
      {/* Mobile navigation */}
      <div className="md:hidden mb-4 flex-shrink-0">
        <div className="flex justify-between items-center bg-gray-100 dark:bg-slate-800/50 p-2 rounded-lg">
          <button 
            onClick={handlePrevStage} 
            disabled={currentStageIndex === 0}
            className="p-2 rounded-full text-slate-500 hover:bg-gray-200 dark:hover:bg-slate-700 disabled:opacity-30"
            aria-label="Previous Stage"
          >
            <ChevronLeftIcon />
          </button>
          <div className="text-center">
             <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-md ${mobileNavColor}`}>
                <h3 className="font-bold text-sm text-white">{currentStageForMobileNav}</h3>
                <span className="text-xs font-semibold text-white bg-black/20 rounded-full px-2 py-0.5">
                    {leads.filter(lead => lead.stage === currentStageForMobileNav).length}
                </span>
             </div>
             <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{currentStageIndex + 1} of {LEAD_STAGES.length}</p>
          </div>
          <button 
            onClick={handleNextStage} 
            disabled={currentStageIndex === LEAD_STAGES.length - 1}
            className="p-2 rounded-full text-slate-500 hover:bg-gray-200 dark:hover:bg-slate-700 disabled:opacity-30"
            aria-label="Next Stage"
          >
            <ChevronRightIcon />
          </button>
        </div>
      </div>

      {/* Board container */}
      <div className="flex-grow overflow-hidden">
        {/* Desktop: horizontal scroll */}
        <div className="hidden md:flex h-full space-x-4 overflow-x-auto pb-4 custom-scrollbar">
          {LEAD_STAGES.map(stage => {
            const stageLeads = leads.filter(lead => lead.stage === stage);
            return <LeadColumn key={stage} stage={stage} leads={stageLeads} onOpenLead={onOpenLead} onMoveStage={onMoveStage} showFollowUpAlerts={showFollowUpAlerts} />;
          })}
        </div>

        {/* Mobile: carousel */}
        <div className="md:hidden h-full">
          <div className="h-full flex transition-transform duration-300 ease-in-out" style={{ transform: `translateX(-${currentStageIndex * 100}%)` }}>
            {LEAD_STAGES.map(stage => {
              const stageLeads = leads.filter(lead => lead.stage === stage);
              return (
                <div key={stage} className="w-full flex-shrink-0 h-full p-0.5">
                  <LeadColumn stage={stage} leads={stageLeads} onOpenLead={onOpenLead} onMoveStage={onMoveStage} showFollowUpAlerts={showFollowUpAlerts} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
};

export default LeadBoard;