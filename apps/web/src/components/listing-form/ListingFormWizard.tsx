'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApiClient } from '@/lib/api-client';
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
import { WizardFooter } from './WizardFooter';

type ListingFormWizardProps = {
  mode: 'create' | 'edit';
  listingId?: string;
  defaultValues?: Partial<ListingFormData>;
};

const INITIAL_DATA: ListingFormData = {
  photos: [],
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

function ListingFormWizardInner({ mode, listingId, defaultValues = {} }: ListingFormWizardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const api = useApiClient();
  const initialStep = Math.min(Math.max(Number(searchParams.get('step')) || 1, 1), 7);
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [formData, setFormData] = useState<ListingFormData>({ ...INITIAL_DATA, ...defaultValues });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const updateFormData = (newData: Partial<ListingFormData>) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, 7));
  const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1));
  const handleSkip = () => handleNext();

  // Build the API payload from form data
  const buildPayload = (status: 'active' | 'draft') => ({
    title: formData.title,
    description: formData.description,
    category_id: formData.category_id,
    daily_rate: formData.daily_rate,
    area: formData.area,
    condition: formData.condition,
    rental_rules: formData.rental_rules,
    specs: formData.specs,
    min_rental_days: formData.min_rental_days,
    max_rental_days: formData.max_rental_days,
    delivery_available: formData.delivery_available,
    delivery_fee: formData.delivery_fee,
    security_deposit: formData.security_deposit,
    status,
    // Send full photo objects — width/height/size_kb/mime_type are stored in DB
    photos: formData.photos.map((photo, i) => ({
      url: photo.url,
      secure_url: photo.secure_url,
      width: photo.width,
      height: photo.height,
      size_kb: photo.size_kb,
      mime_type: photo.mime_type,
      is_primary: i === 0,
      position: i,
    })),
  });

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      let finalId: string;

      if (mode === 'edit' && listingId) {
        // Edit: PUT existing listing
        const res = await api
          .put(`listings/${listingId}`, { json: buildPayload('active') })
          .json<{ data: { id: string } }>();
        finalId = res.data.id;

        // Save blocked dates separately if any were set
        if (formData.blocked_dates.length > 0) {
          await api
            .put(`listings/${listingId}/blocked-dates`, {
              json: { blocked_dates: formData.blocked_dates },
            })
            .json();
        }
      } else {
        // Create: POST new listing
        const res = await api
          .post('listings', { json: buildPayload('active') })
          .json<{ data: { id: string } }>();
        finalId = res.data.id;

        // Save blocked dates for the new listing
        if (formData.blocked_dates.length > 0) {
          await api
            .put(`listings/${finalId}/blocked-dates`, {
              json: { blocked_dates: formData.blocked_dates },
            })
            .json();
        }
      }

      router.push(`/listings/${finalId}` as any);
    } catch (error: any) {
      console.error('Failed to publish listing:', error);
      setSubmitError(
        error?.message ?? 'Something went wrong. Please check your details and try again.'
      );
      setIsSubmitting(false);
    }
  };

  const [canProceed, setCanProceed] = useState(false);
  const [showTips, setShowTips] = useState(false);

  // Reset canProceed when step changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCanProceed(false);
  }, [currentStep]);

  // Step 7 Review uses full width
  if (currentStep === 7) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="max-w-5xl mx-auto px-4 pt-8">
          <StepIndicator currentStep={currentStep} totalSteps={7} />
          {submitError && (
            <div className="mt-6 rounded-2xl border border-red-400/30 bg-red-400/8 px-5 py-4 text-sm text-red-400">
              {submitError}
            </div>
          )}
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

  // Step rendering
  return (
    <div className="min-h-screen bg-background text-foreground flex justify-center py-8 sm:py-14 px-4">
      {/* Container */}
      <div className="w-full max-w-[980px] flex flex-col lg:flex-row gap-12 lg:gap-16">

        {/* Left Side: Sticky nav column */}
        <div className="lg:w-[200px] flex-shrink-0 flex flex-col gap-10 lg:sticky lg:top-14 h-fit">
          <div>
            <p className="hidden lg:block text-[10px] font-display font-bold uppercase tracking-[0.2em] text-foreground/40 mb-5">
              {mode === 'create' ? 'New Listing' : 'Edit Listing'}
            </p>
            <StepIndicator currentStep={currentStep} totalSteps={7} />
          </div>

          {/* Contextual Tips */}
          <StepTips currentStep={currentStep} />
        </div>

        {/* Right Side: Open form surface */}
        <div className="flex-1 flex flex-col min-h-[500px]  lg:border-l border-foreground/10">
          <div className="flex-1 lg:pl-12 pt-2 pb-24 lg:pb-0">
            {currentStep === 1 && (
              <Step1Photos data={formData} updateData={updateFormData} onValidChange={setCanProceed} />
            )}
            {currentStep === 2 && (
              <Step2CategoryTitle data={formData} updateData={updateFormData} onValidChange={setCanProceed} />
            )}
            {currentStep === 3 && (
              <Step3DescriptionSpecs data={formData} updateData={updateFormData} onValidChange={setCanProceed} />
            )}
            {currentStep === 4 && (
              <Step4PricingTerms data={formData} updateData={updateFormData} onValidChange={setCanProceed} />
            )}
            {currentStep === 5 && (
              <Step5Area data={formData} updateData={updateFormData} onValidChange={setCanProceed} />
            )}
            {currentStep === 6 && (
              <Step6Availability data={formData} updateData={updateFormData} onValidChange={setCanProceed} onSkip={handleSkip} />
            )}
          </div>
          {/* Universal sticky footer */}
          <WizardFooter
            step={currentStep}
            totalSteps={7}
            canProceed={canProceed}
            onBack={handleBack}
            onNext={handleNext}
            onSkip={handleSkip}
            isSubmitting={isSubmitting}
            onShowTips={STEP_TIPS[currentStep] ? () => setShowTips(true) : undefined}
          />

          {/* Mobile Tips Bottom Sheet */}
          {showTips && (
            <>
              <div
                className="lg:hidden fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm"
                onClick={() => setShowTips(false)}
              />
              <div className="lg:hidden fixed bottom-0 inset-x-0 z-[70] bg-background rounded-t-3xl p-6 pb-10 animate-in slide-in-from-bottom-4 duration-300 shadow-2xl">
                <div className="w-10 h-1 bg-border/50 rounded-full mx-auto mb-6" />
                <MobileTipsSheet currentStep={currentStep} onClose={() => setShowTips(false)} />
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}

// ─── Step-specific contextual tips ───────────────────────────────────────────

const STEP_TIPS: Record<number, {
  emoji: string;
  headline: string;
  tips: string[];
  stat?: string;
}> = {
  1: {
    emoji: '📸',
    headline: 'Photos do the selling',
    tips: [
      'Natural light near a window beats any flash',
      'Show the actual condition — renters appreciate honesty',
      'Include accessories in the frame so they know what\'s included',
    ],
    stat: '3+ photos → 70% more booking requests',
  },
  2: {
    emoji: '🔍',
    headline: 'Make it findable',
    tips: [
      'Lead with brand and model — "Sony A7III" not "camera"',
      'Think about what you\'d type if you were searching for this',
      'The right category gets you in front of the right people',
    ],
    stat: 'Specific titles rank higher and convert better',
  },
  3: {
    emoji: '💬',
    headline: 'Answer before they ask',
    tips: [
      'List everything included in the kit',
      'Mention minor wear upfront — it builds trust, not doubt',
      'Specs matter to serious renters, don\'t skip them',
    ],
    stat: 'Thorough descriptions lead to 5× fewer disputes',
  },
  4: {
    emoji: '💰',
    headline: 'Price with confidence',
    tips: [
      'Browse similar listings to find the sweet spot',
      'A deposit protects you and signals quality to renters',
      'Delivery opens you up to students without transport',
    ],
    stat: '10–20% below retail value books the fastest',
  },
  5: {
    emoji: '📍',
    headline: 'Your address stays private',
    tips: [
      'Pick the area you\'re most often available in',
      'DHA, Gulberg, and Johar Town have the highest renter activity',
    ],
  },
  6: {
    emoji: '📅',
    headline: 'Block now, stress less later',
    tips: [
      'Block any personal trips or busy periods ahead of time',
      'You can always open dates back up from your dashboard',
      'Renters trust listers whose availability is up to date',
    ],
    stat: 'Kept calendars get significantly fewer cancellations',
  },
};

function StepTips({ currentStep }: { currentStep: number }) {
  const tip = STEP_TIPS[currentStep];
  if (!tip) return null;

  return (
    <div className="hidden lg:flex flex-col gap-3.5 pl-3 border-l-2 border-accent/40 animate-in fade-in duration-500">
      <div>
        <span className="text-2xl block mb-2">{tip.emoji}</span>
        <p className="font-display text-sm font-bold uppercase tracking-wider text-foreground/70 leading-snug">{tip.headline}</p>
      </div>

      <ul className="flex flex-col gap-2">
        {tip.tips.map((t, i) => (
          <li key={i} className="text-xs text-foreground/55 leading-relaxed">
            {t}
          </li>
        ))}
      </ul>

      {tip.stat && (
        <p className="text-[11px] text-accent font-semibold leading-snug pt-1 opacity-70">
          ↗ {tip.stat}
        </p>
      )}
    </div>
  );
}

function MobileTipsSheet({ currentStep, onClose }: { currentStep: number; onClose: () => void }) {
  const tip = STEP_TIPS[currentStep];
  if (!tip) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-3xl block mb-2">{tip.emoji}</span>
          <p className="font-display text-base font-bold uppercase tracking-wider text-foreground/80 leading-snug">
            {tip.headline}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-foreground/30 hover:text-foreground transition-colors p-1 rounded-full"
        >
          ✕
        </button>
      </div>

      <ul className="flex flex-col gap-3">
        {tip.tips.map((t, i) => (
          <li key={i} className="flex gap-2.5 text-sm text-foreground/60 leading-relaxed">
            <span className="text-accent mt-0.5 flex-shrink-0">•</span>
            {t}
          </li>
        ))}
      </ul>

      {tip.stat && (
        <p className="text-xs text-accent font-semibold leading-snug pt-1 border-t border-border/20">
          ↗ {tip.stat}
        </p>
      )}
    </div>
  );
}

export function ListingFormWizard(props: ListingFormWizardProps) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <ListingFormWizardInner {...props} />
    </Suspense>
  );
}
