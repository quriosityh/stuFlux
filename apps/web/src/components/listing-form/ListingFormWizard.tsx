'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ListingFormData } from './types';
import { StepIndicator } from './StepIndicator';
import { Step1Photos } from './Step1Photos';
import { Step2Basics } from './Step2Basics';
import { Step3Details } from './Step3Details';
import { Step4Logistics } from './Step4Logistics';
import { Step5Location } from './Step5Location';
import { Step6Review } from './Step6Review';

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
  const [isNextPressed, setIsNextPressed] = useState(false);
  const [publishMoment, setPublishMoment] = useState(false);
  const [published, setPublished] = useState(false);

  const updateFormData = (newData: Partial<ListingFormData>) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, 6));
  const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async (finalData: Partial<ListingFormData>) => {
    const completeData = { ...formData, ...finalData };
    setIsSubmitting(true);
    const isPublishing = finalData.status === 'active' || formData.status === 'active';
    setPublishMoment(isPublishing);
    try {
      console.log('Submitting data:', completeData);
      await new Promise(resolve => setTimeout(resolve, 1500));
      if (isPublishing) {
        setPublished(true);
      } else {
        router.push('/listings' as any);
      }
    } catch (error) {
      console.error('Failed to submit listing:', error);
      setIsSubmitting(false);
      setPublishMoment(false);
    }
  };

  const handlePublishComplete = () => {
    router.push(`/listings/${listingId || 'new-listing-123'}` as any);
  };

  const stepProps = {
    data: formData,
    updateData: updateFormData,
    onNext: handleNext,
    onBack: handleBack,
    hideFooter: true as const,
  };

  return (
    /* Full-viewport container — NO scrolling */
    <div className="fixed inset-0 flex flex-col bg-[#0B0B13] overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-accent/4 rounded-full blur-[100px] pointer-events-none" />

      {/* Card — fills viewport, flex column */}
      <div className="relative z-10 mx-auto w-full flex flex-col h-full bg-[#0D0D16]/90 backdrop-blur-xl border-x border-[#2A2A35] shadow-2xl overflow-hidden" style={{ maxWidth: '820px' }}>

        {/* Step Indicator — compact, fixed top */}
        <div className="flex-none px-5 sm:px-8 pt-4 pb-0">
          <StepIndicator currentStep={currentStep} totalSteps={6} />
        </div>

        {/* Step Content — fills remaining space, NO overflow */}
        <div className="flex-1 min-h-0 px-5 sm:px-8 overflow-hidden">
          {currentStep === 1 && <Step1Photos {...stepProps} />}
          {currentStep === 2 && <Step2Basics {...stepProps} />}
          {currentStep === 3 && <Step3Details {...stepProps} />}
          {currentStep === 4 && <Step4Logistics {...stepProps} />}
          {currentStep === 5 && <Step5Location {...stepProps} />}
          {currentStep === 6 && (
            <Step6Review
              data={formData}
              onSubmit={handleSubmit}
              onBack={handleBack}
              isSubmitting={isSubmitting}
              published={published}
              publishedId={listingId || 'new-listing-123'}
              onPublishComplete={handlePublishComplete}
            />
          )}
        </div>

        {/* Footer nav — fixed at bottom of card */}
        {currentStep < 6 && (
          <div className="flex-none flex items-center justify-between px-5 sm:px-8 py-4 bg-[#0D0D16] border-t border-[#2A2A35]">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className="flex items-center gap-2 font-semibold text-xs sm:text-sm text-white/50 hover:text-white transition-all duration-200 disabled:opacity-0 disabled:pointer-events-none"
            >
              ← <span className="hidden sm:inline">Back</span>
            </button>

            <button
              id="card-next-btn"
              onPointerDown={() => setIsNextPressed(true)}
              onPointerUp={() => setIsNextPressed(false)}
              onPointerCancel={() => setIsNextPressed(false)}
              onBlur={() => setIsNextPressed(false)}
              onClick={() => {
                const triggerBtn = document.getElementById('step-next-trigger');
                if (triggerBtn) triggerBtn.click();
              }}
              className={`liquid-button px-6 sm:px-8 py-2.5 font-bold text-xs sm:text-sm text-black transition-transform duration-150 transform-gpu ${isNextPressed ? 'scale-95' : 'scale-100'}`}
            >
              {currentStep === 1 ? 'Next: Basics →'
                : currentStep === 2 ? 'Next: Details →'
                : currentStep === 3 ? 'Next: Logistics →'
                : currentStep === 4 ? 'Next: Location →'
                : 'Review Listing →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
