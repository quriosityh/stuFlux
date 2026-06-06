'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ListingFormData } from './types';
import { StepIndicator } from './StepIndicator';

// Step components (to be implemented)
import { Step1Photos } from './steps/Step1Photos';
import { Step2CategoryTitle } from './steps/Step2CategoryTitle';
import { Step3DescriptionSpecs } from './steps/Step3DescriptionSpecs';
import { Step4PricingTerms } from './steps/Step4PricingTerms';
import { Step5Area } from './steps/Step5Area';
import { Step6Availability } from './steps/Step6Availability';
import { Step7Review } from './steps/Step7Review';

type ListingFormWizardProps = {
  mode: 'create' | 'edit';
  listingId?: string;
  defaultValues?: Partial<ListingFormData>;
};

const INITIAL_DATA: ListingFormData = {
  photo_urls: [],
  category_id: 0,
  title: '',
  description: '',
  condition: '',
  specs: {},
  daily_rate: 0,
  security_deposit: 0,
  min_rental_days: 1,
  max_rental_days: 30,
  delivery_available: false,
  delivery_fee: 0,
  rental_rules: '',
  area: '',
  blocked_dates: [],
  status: 'draft',
};

export function ListingFormWizard({ mode, listingId, defaultValues = {} }: ListingFormWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ListingFormData>({ ...INITIAL_DATA, ...defaultValues });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateFormData = (newData: Partial<ListingFormData>) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };

  // Periodic Auto-save (debounced 5 seconds)
  useEffect(() => {
    const timer = setTimeout(() => {
      // In a real app, this would be a PUT request to /listings/:id
      // with { ...formData, status: 'draft' }
      if (formData.photo_urls.length > 0) {
        console.log('[Auto-save] Draft saved:', formData.title || 'Untitled');
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [formData]);

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, 7));
  const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1));
  const handleSkip = () => handleNext(); // For optional steps like availability

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      console.log('Publishing listing:', { ...formData, status: 'active' });
      // API call to publish
      await new Promise(resolve => setTimeout(resolve, 1500));
      const mockId = listingId || 'new-listing-123';
      router.push(`/listings/${mockId}` as any);
    } catch (error) {
      console.error('Failed to publish listing:', error);
      setIsSubmitting(false);
    }
  };

  // Step 7 Review uses full width
  if (currentStep === 7) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="max-w-5xl mx-auto px-4 pt-8">
          <StepIndicator currentStep={currentStep} totalSteps={7} />
          <div className="mt-8">
            <Step7Review
              data={formData}
              onBack={handleBack}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex justify-center py-6 sm:py-12 px-4">
      {/* Container */}
      <div className="w-full max-w-[1000px] flex flex-col lg:flex-row gap-8 lg:gap-12">
        
        {/* Left Side: Progress & Preview (Sticky on desktop) */}
        <div className="lg:w-1/3 flex flex-col gap-6 lg:sticky lg:top-12 h-fit">
          <div className="chrome-card rounded-[2rem] p-6 shadow-2xl">
            <h1 className="text-xl font-display font-bold mb-6 text-foreground/90">
              {mode === 'create' ? 'Create a Listing' : 'Edit Listing'}
            </h1>
            <StepIndicator currentStep={currentStep} totalSteps={7} />
          </div>

          {/* Live Preview Card */}
          <div className="hidden lg:block chrome-card rounded-[2rem] p-6 shadow-2xl">
            <h3 className="text-sm font-display font-semibold text-foreground/50 mb-4 uppercase tracking-wider">Live Preview</h3>
            {/* Very basic live preview representation */}
            <div className="aspect-[4/3] rounded-xl bg-surface/50 mb-4 overflow-hidden relative">
              {formData.photo_urls.length > 0 ? (
                <img src={formData.photo_urls[0]} alt="Cover" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-foreground/20">No Photos</div>
              )}
            </div>
            <h2 className="font-bold text-lg text-foreground truncate">
              {formData.title || 'Listing Title'}
            </h2>
            <div className="text-accent font-semibold mt-1">
              Rs. {formData.daily_rate || 0} / day
            </div>
            {formData.area && (
              <div className="text-sm text-foreground/50 mt-2 flex items-center gap-1">
                📍 {formData.area}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Step Content */}
        <div className="lg:w-2/3 chrome-card rounded-[2rem] shadow-2xl flex flex-col min-h-[500px]">
          <div className="flex-1 p-6 sm:p-10">
            {currentStep === 1 && (
              <Step1Photos data={formData} updateData={updateFormData} onNext={handleNext} />
            )}
            {currentStep === 2 && (
              <Step2CategoryTitle data={formData} updateData={updateFormData} onNext={handleNext} onBack={handleBack} />
            )}
            {currentStep === 3 && (
              <Step3DescriptionSpecs data={formData} updateData={updateFormData} onNext={handleNext} onBack={handleBack} />
            )}
            {currentStep === 4 && (
              <Step4PricingTerms data={formData} updateData={updateFormData} onNext={handleNext} onBack={handleBack} />
            )}
            {currentStep === 5 && (
              <Step5Area data={formData} updateData={updateFormData} onNext={handleNext} onBack={handleBack} />
            )}
            {currentStep === 6 && (
              <Step6Availability data={formData} updateData={updateFormData} onNext={handleNext} onBack={handleBack} onSkip={handleSkip} />
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
