import React from 'react';
import { LeadStage } from './types';

export const LEAD_STAGES: LeadStage[] = ['Lead', 'Pitch', 'Negotiation', 'Contract', 'Invoice', 'Paid', 'Lost'];

export const STAGE_COLORS: Record<LeadStage, string> = {
  'Lead': 'bg-blue-500',
  'Pitch': 'bg-sky-500',
  'Negotiation': 'bg-purple-500',
  'Contract': 'bg-indigo-500',
  'Invoice': 'bg-yellow-500',
  'Paid': 'bg-green-500',
  'Lost': 'bg-red-500',
};

export const ChevronLeftIcon: React.FC = () => (
  React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: "2" },
    React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M15 19l-7-7 7-7" })
  )
);

export const ChevronRightIcon: React.FC = () => (
  React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: "2" },
    React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M9 5l7 7-7 7" })
  )
);

export const PlusIcon: React.FC = () => (
    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: "2" },
      React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 4v16m8-8H4" })
    )
);

export const SettingsIcon: React.FC = () => (
    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: "2" },
        React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" }),
        React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z" })
    )
);

export const ArchiveIcon: React.FC<{className?: string}> = ({className}) => (
  React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: className || "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: "2" },
    React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" })
  )
);

export const UnarchiveIcon: React.FC<{className?: string}> = ({className}) => (
    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: className || "h-5 w-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: "2" },
      React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h16" })
    )
);

export const ExportIcon: React.FC<{className?: string}> = ({className}) => (
  React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: className || "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: "2" },
    React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" })
  )
);

export const ImportIcon: React.FC<{className?: string}> = ({className}) => (
    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: className || "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: "2" },
      React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" })
    )
);

export const DuplicateIcon: React.FC<{className?: string}> = ({className}) => (
    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: className || "h-5 w-5 mr-2", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: "2" },
        React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" })
    )
);

export const CopyIcon: React.FC = () => (
    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5 mr-2", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: "2" },
        React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" })
    )
);

export const MailIcon: React.FC = () => (
    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5 mr-2", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: "2" },
        React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" })
    )
);

export const EditIcon: React.FC<{className?: string}> = ({className}) => (
    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: className || "h-5 w-5 mr-2", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: "2" },
        React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L15.232 5.232z" })
    )
);

export const DollarSignIcon: React.FC<{className?: string}> = ({className}) => (
    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: className || "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: "2" },
        React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H7" })
    )
);

export const CalendarIcon: React.FC<{className?: string}> = ({className}) => (
    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: className || "h-5 w-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: "2" },
        React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" })
    )
);

export const SearchIcon: React.FC<{className?: string}> = ({className}) => (
    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: className || "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: "2" },
        React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" })
    )
);

export const XCircleIcon: React.FC<{className?: string}> = ({className}) => (
    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: className || "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: "2" },
        React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" })
    )
);

export const QuestionMarkCircleIcon: React.FC = () => (
    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: "2" },
        React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" })
    )
);

export const TrashIcon: React.FC<{className?: string}> = ({className}) => (
    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: className || "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: "2" },
        React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" })
    )
);

export const LogoutIcon: React.FC<{className?: string}> = ({className}) => (
    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: className || "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: "2" },
        React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" })
    )
);

export const SparklesIcon: React.FC<{className?: string}> = ({className}) => (
    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: className || "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: "2" },
        React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" })
    )
);

export const ListIcon: React.FC = () => (
    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: "2" },
        React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M4 6h16M4 10h16M4 14h16M4 18h16" })
    )
);

export const ArrowUpIcon: React.FC<{className?: string}> = ({className}) => (
    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: className || "h-5 w-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: "2" },
        React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M5 15l7-7 7 7" })
    )
);

export const ArrowDownIcon: React.FC<{className?: string}> = ({className}) => (
    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: className || "h-5 w-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: "2" },
        React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M19 9l-7 7-7-7" })
    )
);

export const DotsVerticalIcon: React.FC = () => (
    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: "2" },
        React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" })
    )
);

export const CheckIcon: React.FC<{className?: string}> = ({className}) => (
    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: className || "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: "2" },
        React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M5 13l4 4L19 7" })
    )
);