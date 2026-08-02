'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useApiClient } from '@/lib/api-client';
import { Phone, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Props = {
  onSuccess: () => void;
  onCancel: () => void;
};

export function PhoneVerificationModal({ onSuccess, onCancel }: Props) {
  const { user } = useUser();
  const api = useApiClient();
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [phoneState, setPhoneState] = useState<'idle' | 'sending' | 'pending' | 'verifying'>('idle');
  const [phoneError, setPhoneError] = useState('');

  const syncVerificationWithBackend = async () => {
    try {
      await api.put('users/me/verification', {
        json: { phone_verified: true, verification_level: 'verified' }
      });
      onSuccess();
    } catch (e) {
      console.error('Backend sync failed', e);
      setPhoneError('Verification succeeded, but failed to sync with backend. Please refresh.');
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
      setPhoneError(err.errors?.[0]?.message || 'Failed to send verification code.');
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
      }
    } catch (err: any) {
      console.error('Error verifying code', err);
      setPhoneError(err.errors?.[0]?.message || 'Invalid verification code.');
      setPhoneState('pending');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-[var(--surface)] w-full max-w-md p-6 rounded-3xl shadow-xl border border-[var(--border-color)] relative">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-lg font-bold text-[var(--foreground)]">Verify Phone Number</h2>
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-[var(--foreground)]/40 hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {phoneState === 'idle' || phoneState === 'sending' ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-[var(--foreground)]/60">
              Enter your mobile number. We will send you a 6-digit verification code.
            </p>
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
            {phoneError && <p className="text-red-500 text-xs">{phoneError}</p>}
            <Button 
              onClick={sendVerificationCode} 
              disabled={phoneState === 'sending' || !phoneNumber.trim()}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white mt-2"
            >
              {phoneState === 'sending' ? "Sending Code..." : "Send Verification Code"}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-[var(--foreground)]/60">
              Enter the 6-digit code sent to <span className="font-bold text-[var(--foreground)]">{phoneNumber}</span>
            </p>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="123456"
              className="w-full text-center tracking-[0.5em] font-display text-xl bg-[var(--background)] border border-[var(--border-color)] text-[var(--foreground)] placeholder-[var(--foreground)]/25 rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--accent)]"
              maxLength={6}
            />
            {phoneError && <p className="text-red-500 text-xs">{phoneError}</p>}
            <Button 
              onClick={verifyCode} 
              disabled={phoneState === 'verifying' || verificationCode.length !== 6}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white mt-2"
            >
              {phoneState === 'verifying' ? "Verifying..." : "Verify Code"}
            </Button>
            <button 
              onClick={() => { setPhoneState('idle'); setVerificationCode(''); setPhoneError(''); }}
              className="text-xs text-[var(--foreground)]/50 hover:text-[var(--foreground)] mt-1"
            >
              Use a different number
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
