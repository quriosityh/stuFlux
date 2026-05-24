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

  const handleNext = () => {
    setCurrentStep(prev => Math.min(prev + 1, 4));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (finalData: Partial<ListingFormData>) => {
    const completeData = { ...formData, ...finalData };
    setIsSubmitting(true);
    
    // Simulate API call for now (Frontend UI focus)
    try {
      console.log('Submitting data:', completeData);
      
      // Fake delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In real implementation, we'd use useApiClient here and route to actual ID
      // const api = useApiClient();
      // const res = await api.post('listings', { json: completeData }).json();
      // router.push(`/listings/${res.id}`);
      
      // Mock redirect for UI testing
      const mockId = listingId || 'new-listing-123';
      router.push(`/listings/${mockId}`);
      
    } catch (error) {
      console.error('Failed to submit listing:', error);
      setIsSubmitting(false);
      alert('Failed to submit listing. Check console.');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      <div className="w-full max-w-4xl mx-auto px-4 md:px-8 pt-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <button 
            onClick={() => router.back()} 
            className="text-foreground/60 hover:text-foreground font-semibold flex items-center gap-1 transition-colors"
          >
            ✕ Cancel
          </button>
          <div className="font-display font-bold text-sm tracking-widest uppercase opacity-50">
            {mode === 'create' ? 'New Listing' : 'Edit Listing'}
          </div>
        </div>

        {/* Wizard Indicator */}
        <StepIndicator currentStep={currentStep} totalSteps={4} />

        {/* Active Step Content */}
        <div className="mt-8 max-w-2xl mx-auto">
          {currentStep === 1 && (
            <Step1Basics 
              data={formData} 
              updateData={updateFormData} 
              onNext={handleNext} 
            />
          )}
          {currentStep === 2 && (
            <Step2Details 
              data={formData} 
              updateData={updateFormData} 
              onNext={handleNext} 
              onBack={handleBack} 
            />
          )}
          {currentStep === 3 && (
            <Step3Availability 
              data={formData} 
              updateData={updateFormData} 
              onNext={handleNext} 
              onBack={handleBack} 
            />
          )}
          {currentStep === 4 && (
            <Step4Photos 
              data={formData} 
              onSubmit={handleSubmit} 
              onBack={handleBack}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
        
      </div>
    </div>
  );
}
