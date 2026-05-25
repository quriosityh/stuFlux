'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ListingFormData } from './types';
import { StepIndicator } from './StepIndicator';
import { Step1Basics } from './Step1Basics';
import { Step2Details } from './Step2Details';
import { Step3Availability } from './Step3Availability';
import { Step4Photos } from './Step4Photos';

type ListingFormWizardProps = {
  mode: 'create' | 'edit';
  listingId?: string;
  defaultValues?: Partial<ListingFormData>;
};

export function ListingFormWizard({ mode, listingId, defaultValues = {} }: ListingFormWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<ListingFormData>>(defaultValues);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateFormData = (newData: Partial<ListingFormData>) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async (finalData: Partial<ListingFormData>) => {
    const completeData = { ...formData, ...finalData };
    setIsSubmitting(true);
    try {
      console.log('Submitting data:', completeData);
      await new Promise(resolve => setTimeout(resolve, 1500));
      const mockId = listingId || 'new-listing-123';
      router.push(`/listings/${mockId}`);
    } catch (error) {
      console.error('Failed to submit listing:', error);
      setIsSubmitting(false);
    }
  };

  // Step 4 (Photos+Preview) is full-screen — render it differently
  if (currentStep === 4) {
    return (
      <Step4Photos
        data={formData}
        onSubmit={handleSubmit}
        onBack={handleBack}
        isSubmitting={isSubmitting}
      />
    );
  }

  return (
    /* Dark overlay background */
    <div className="min-h-screen relative flex items-start justify-center pt-8 sm:pt-12 pb-16 px-4 bg-[#0B0B13] overflow-hidden">
      {/* Background ambient glow matching the image */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Centered modal card */}
      <div
        className="w-full relative z-10 bg-[#0D0D16]/90 backdrop-blur-xl border border-[#2A2A35] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden"
        style={{ maxWidth: '820px' }}
      >

        {/* ── Step Indicator inside card ── */}
        <div className="px-4 sm:px-8 pt-6 sm:pt-10 pb-2">
          <StepIndicator currentStep={currentStep} totalSteps={4} />
        </div>

        {/* ── Scrollable form body ── */}
        <div className="px-4 sm:px-10 pb-6 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" style={{ maxHeight: 'calc(100vh - 280px)' }}>
          {currentStep === 1 && (
            <Step1Basics
              data={formData}
              updateData={updateFormData}
              onNext={handleNext}
              hideFooter
            />
          )}
          {currentStep === 2 && (
            <Step2Details
              data={formData}
              updateData={updateFormData}
              onNext={handleNext}
              onBack={handleBack}
              hideFooter
            />
          )}
          {currentStep === 3 && (
            <Step3Availability
              data={formData}
              updateData={updateFormData}
              onNext={handleNext}
              onBack={handleBack}
              hideFooter
            />
          )}
        </div>

        {/* ── Card Footer ── */}
        <CardFooter
          currentStep={currentStep}
          onBack={handleBack}
          onNext={() => {
            // Trigger the step's own handleNext which validates + calls onNext
            const triggerBtn = document.getElementById('step-next-trigger');
            if (triggerBtn) triggerBtn.click();
          }}
        />
      </div>
    </div>
  );
}

function CardFooter({
  currentStep,
  onBack,
  onNext,
}: {
  currentStep: number;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-4 sm:px-10 py-5 sm:py-6 bg-[#0D0D16] border-t border-[#2A2A35] rounded-b-[2rem]">
      <button
        onClick={onBack}
        disabled={currentStep === 1}
        className="flex items-center gap-2 font-semibold text-xs sm:text-sm text-white/50 hover:text-white transition-all duration-200 disabled:opacity-0 disabled:pointer-events-none"
      >
        ← <span className="hidden sm:inline">Back to Previous</span><span className="sm:hidden">Back</span>
      </button>

      <button
        id="card-next-btn"
        onClick={onNext}
        className="liquid-button px-6 sm:px-8 py-2.5 sm:py-3 font-bold text-xs sm:text-sm text-black"
      >
        {currentStep === 3 ? 'Next: Photos →' : 'Next Step →'}
      </button>
    </div>
  );
}
