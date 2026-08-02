'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApiClient } from '@/lib/api-client';
import { AreaSelector } from '@/components/shared/AreaSelector';
import { Button } from '@/components/ui/Button';
import { ShieldCheck, User, MapPin, Phone } from 'lucide-react';
import { Profile } from '@/components/profile/ProfileClient';
import { useUser } from '@clerk/nextjs';

export function OnboardingFlow() {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [area, setArea] = useState('johar-town');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Clerk Phone Verification State
  const { user } = useUser();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [phoneState, setPhoneState] = useState<'idle' | 'sending' | 'pending' | 'verifying'>('idle');
  const [phoneError, setPhoneError] = useState('');
  
  const api = useApiClient();
  const router = useRouter();

  useEffect(() => {
    api.get('users/me')
      .json<{ data: Profile }>()
      .then((res) => {
        setProfile(res.data);
        if (res.data.display_name && res.data.display_name !== 'User') {
          setDisplayName(res.data.display_name);
        }
        if (res.data.area) {
          setArea(res.data.area);
        }
      })
      .finally(() => setLoading(false));
  }, [api]);

  const handleNext = async () => {
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    // Finish Onboarding
    setSaving(true);
    try {
      await api.put('users/me', {
        json: { display_name: displayName, area }
      });
      router.push('/explore' as any);
      router.refresh();
    } catch (e) {
      console.error('Failed to save profile', e);
    } finally {
      setSaving(false);
    }
  };

  const syncVerificationWithBackend = async () => {
    try {
      await api.put('users/me/verification', {
        json: { phone_verified: true, verification_level: 'verified' }
      });
      setProfile(prev => prev ? { ...prev, phone_verified: true } : prev);
    } catch (e) {
      console.error('Backend sync failed', e);
    }
  };

  const sendVerificationCode = async () => {
    if (!user) return;
    setPhoneError('');
    setPhoneState('sending');
    try {
      let formattedPhone = phoneNumber.trim();
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '+92' + formattedPhone.slice(1);
      } else if (!formattedPhone.startsWith('+')) {
        formattedPhone = '+92' + formattedPhone;
      }
      setPhoneNumber(formattedPhone);

      const phoneRef = await user.createPhoneNumber({ phoneNumber: formattedPhone });
      await phoneRef.prepareVerification();
      setPhoneState('pending');
    } catch (err: any) {
      console.error('Error sending code', err);
      const errorMessage = err.errors?.[0]?.longMessage || err.errors?.[0]?.message || err.message || 'Failed to send verification code. Please check the number format.';
      setPhoneError(errorMessage);
      setPhoneState('idle');
    }
  };

  const verifyCode = async () => {
    if (!user) return;
    setPhoneError('');
    setPhoneState('verifying');
    try {
      const unverifiedPhone = user.phoneNumbers.find(p => p.verification.status === 'unverified' && p.phoneNumber === phoneNumber);
      if (!unverifiedPhone) throw new Error('Phone number reference not found.');
      
      const res = await unverifiedPhone.attemptVerification({ code: verificationCode });
      if (res.verification.status === 'verified') {
        await syncVerificationWithBackend();
        setPhoneState('idle');
      }
    } catch (err: any) {
      console.error('Error verifying code', err);
      setPhoneError(err.errors?.[0]?.message || 'Invalid verification code.');
      setPhoneState('pending');
    }
  };

  // If user already has a verified phone in Clerk but backend doesn't know, we could sync it automatically, 
  // but keeping it simple: just show success if backend knows. If they want, they can skip.
  const hasClerkVerifiedPhone = user?.phoneNumbers?.some(p => p.verification.status === 'verified');

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]"></div></div>;
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[var(--surface)] p-8 rounded-3xl shadow-xl border border-[var(--border-color)]">
        
        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map(i => (
            <div key={i} className={`h-1.5 flex-1 rounded-full ${step >= i ? 'bg-[var(--accent)]' : 'bg-[var(--border-color)]'}`} />
          ))}
        </div>

        {/* Step 1: Profile Name */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mb-6">
              <User size={24} />
            </div>
            <h1 className="text-2xl font-bold font-display mb-2 text-[var(--foreground)]">What should we call you?</h1>
            <p className="text-[var(--foreground)]/60 text-sm mb-6">This is the name other students will see when you rent or lend items.</p>
            
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Ali Khan"
              className="w-full bg-[var(--background)] border border-[var(--border-color)] text-[var(--foreground)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--accent)]"
            />
          </div>
        )}

        {/* Step 2: Location */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="w-12 h-12 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center mb-6">
              <MapPin size={24} />
            </div>
            <h1 className="text-2xl font-bold font-display mb-2 text-[var(--foreground)]">Where are you located?</h1>
            <p className="text-[var(--foreground)]/60 text-sm mb-6">Help us find rentals near your campus or area in Lahore.</p>
            
            <AreaSelector value={area} onChange={setArea} />
          </div>
        )}

        {/* Step 3: Verification */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300 text-center">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-3xl flex items-center justify-center mb-6 mx-auto">
              <ShieldCheck size={32} />
            </div>
            <h1 className="text-2xl font-bold font-display mb-2 text-[var(--foreground)]">Trust & Safety</h1>
            <p className="text-[var(--foreground)]/60 text-sm mb-8">
              StuFlux relies on a trusted community. Verifying your phone number builds trust with other students.
            </p>
            
            {profile?.phone_verified || hasClerkVerifiedPhone ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 p-4 rounded-xl flex items-center justify-center gap-2 mb-6">
                <ShieldCheck size={20} />
                <span className="font-bold text-sm">Phone Verified Successfully!</span>
              </div>
            ) : (
              <div className="mb-6">
                {phoneState === 'idle' || phoneState === 'sending' ? (
                  <div className="flex flex-col gap-3">
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground)]/30" />
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+92 300 1234567"
                        className="w-full bg-[var(--background)] border border-[var(--border-color)] text-[var(--foreground)] placeholder-[var(--foreground)]/25 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-[var(--accent)]"
                      />
                    </div>
                    {phoneError && <p className="text-red-500 text-xs text-left">{phoneError}</p>}
                    <Button 
                      onClick={sendVerificationCode} 
                      disabled={phoneState === 'sending' || !phoneNumber.trim()}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                    >
                      {phoneState === 'sending' ? "Sending Code..." : "Send Verification Code"}
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <p className="text-sm font-medium text-[var(--foreground)]/80 text-left">
                      Enter the 6-digit code sent to {phoneNumber}
                    </p>
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="123456"
                      className="w-full text-center tracking-[0.5em] font-display text-xl bg-[var(--background)] border border-[var(--border-color)] text-[var(--foreground)] placeholder-[var(--foreground)]/25 rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--accent)]"
                      maxLength={6}
                    />
                    {phoneError && <p className="text-red-500 text-xs text-left">{phoneError}</p>}
                    <Button 
                      onClick={verifyCode} 
                      disabled={phoneState === 'verifying' || verificationCode.length !== 6}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                    >
                      {phoneState === 'verifying' ? "Verifying..." : "Verify Code"}
                    </Button>
                    <button 
                      onClick={() => { setPhoneState('idle'); setVerificationCode(''); setPhoneError(''); }}
                      className="text-xs text-[var(--foreground)]/50 hover:text-[var(--foreground)] mt-2"
                    >
                      Use a different number
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="mt-8 flex gap-3">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
              Back
            </Button>
          )}
          <Button 
            onClick={handleNext} 
            disabled={(step === 1 && !displayName.trim()) || (step === 3 && !(profile?.phone_verified || hasClerkVerifiedPhone)) || saving}
            className="flex-[2]"
          >
            {saving && step === 3 ? "Saving..." : (step === 3 ? "Complete Setup" : "Continue")}
          </Button>
        </div>

      </div>
    </div>
  );
}
