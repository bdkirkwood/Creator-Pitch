import React, { useState } from 'react';
import { SettingsIcon, PlusIcon, SparklesIcon, ChevronLeftIcon, ChevronRightIcon } from '../constants';

interface OnboardingModalProps {
  onComplete: () => void;
}

const steps = [
  {
    icon: <SparklesIcon className="h-12 w-12 text-blue-500" />,
    title: 'Welcome to Creator Pitch!',
    description: "Your new command center for managing brand partnerships. Let's take a quick tour to get you set up.",
  },
  {
    icon: <SettingsIcon />,
    title: 'Personalize Your Pitches',
    description: "Go to Creator Settings (the ⚙️ icon in the header) to fill out your creator profile. This is the secret sauce the AI uses to write emails in your unique voice.",
  },
  {
    icon: <div className="text-3xl">🗂️</div>, // Using emoji as an icon
    title: 'Track Your Deals',
    description: "The dashboard is your lead board. Use the arrows to move them through the pipeline, from initial pitch to getting paid.",
  },
  {
    icon: <PlusIcon />,
    title: 'Add Your First Lead',
    description: "Click the plus (+) icon in the header to add your first brand deal to the board and start tracking your progress.",
  },
];

const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full max-w-md text-center p-8 m-4">
        <div className="flex justify-center items-center h-20 w-20 mx-auto bg-blue-100 dark:bg-slate-700 rounded-full mb-6">
          {step.icon}
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">{step.title}</h2>
        <p className="text-slate-600 dark:text-slate-300 mb-8">{step.description}</p>
        
        {/* Step Indicators */}
        <div className="flex justify-center space-x-2 mb-8">
            {steps.map((_, index) => (
                <div 
                    key={index} 
                    className={`h-2 w-2 rounded-full transition-colors ${index === currentStep ? 'bg-blue-500' : 'bg-gray-300 dark:bg-slate-600'}`}
                ></div>
            ))}
        </div>
        
        <div className="flex justify-between items-center">
            <button 
                onClick={handlePrev}
                disabled={isFirstStep}
                className="p-2 rounded-full text-slate-500 hover:bg-gray-200 dark:hover:bg-slate-700 disabled:opacity-0 disabled:cursor-not-allowed transition-opacity"
                aria-label="Previous Step"
            >
                <ChevronLeftIcon />
            </button>
            
            {isLastStep ? (
              <button 
                  onClick={onComplete}
                  className="bg-blue-500 text-white font-bold py-3 px-8 rounded-full hover:bg-blue-600 transition-transform transform hover:scale-105"
              >
                  Get Started
              </button>
            ) : (
                <button 
                    onClick={handleNext}
                    className="bg-blue-500 text-white font-bold py-3 px-8 rounded-full hover:bg-blue-600 transition-transform transform hover:scale-105"
                >
                    Next
                </button>
            )}

            <button 
                onClick={handleNext}
                disabled={isLastStep}
                className="p-2 rounded-full text-slate-500 hover:bg-gray-200 dark:hover:bg-slate-700 disabled:opacity-0 disabled:cursor-not-allowed transition-opacity"
                aria-label="Next Step"
            >
                <ChevronRightIcon />
            </button>
        </div>

        <button 
            onClick={onComplete}
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 mt-6"
        >
            Skip for now
        </button>

      </div>
    </div>
  );
};

export default OnboardingModal;
