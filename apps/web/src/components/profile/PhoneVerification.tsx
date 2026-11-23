'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Loader2 } from 'lucide-react';
import { useApiClient } from '@/lib/api-client';

type Props = {
  verified: boolean;
  onVerified: () => void;
};

type PendingPhone = {
  id: string;
  verification: { status: string | null };
  attemptVerification: (params: { code: string }) => Promise<PendingPhone>;
};

export function PhoneVerification({ verified, onVerified }: Props) {
  const api = useApiClient();
  const { isLoaded, user } = useUser();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [pendingPhone, setPendingPhone] = useState<PendingPhone | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendCode = async () => {
    const normalizedPhoneNumber = phoneNumber.trim().replace(/[\s()-]/g, '');
    if (!user || !/^\+[1-9]\d{7,14}$/.test(normalizedPhoneNumber)) {
      setError('Enter a valid phone number with country code, e.g. +923001234567.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const phone = await user.createPhoneNumber({ phoneNumber: normalizedPhoneNumber });
      await phone.prepareVerification();
      setPendingPhone(phone);
    } catch {
      setError('Unable to send the verification code. Check the number and try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!pendingPhone || !/^\d{4,8}$/.test(code.trim())) {
      setError('Enter the verification code sent by SMS.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const verifiedPhone = await pendingPhone.attemptVerification({ code: code.trim() });
      if (verifiedPhone.verification.status !== 'verified') {
        throw new Error('Phone verification was not completed.');
      }
      await api.post('users/me/phone-verification', {
        json: { phone_number_id: verifiedPhone.id },
      });
      onVerified();
    } catch {
      setError('That code is invalid or expired. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (verified) {
    return <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400">Verified</span>;
  }

  return (
    <div className="mt-3 w-full space-y-2">
      {!pendingPhone ? (
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            value={phoneNumber}
            onChange={(event) => setPhoneNumber(event.target.value)}
            placeholder="+92 300 1234567"
            inputMode="tel"
            className="flex-1 rounded-xl border border-[var(--border-color)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
          />
          <button type="button" onClick={sendCode} disabled={!isLoaded || loading} className="hyper-liquid px-4 py-2 text-xs font-bold disabled:opacity-50">
            {loading ? <Loader2 size={15} className="animate-spin" /> : 'Send code'}
          </button>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
            placeholder="SMS verification code"
            inputMode="numeric"
            maxLength={8}
            className="flex-1 rounded-xl border border-[var(--border-color)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
          />
          <button type="button" onClick={verifyCode} disabled={loading} className="hyper-liquid px-4 py-2 text-xs font-bold disabled:opacity-50">
            {loading ? <Loader2 size={15} className="animate-spin" /> : 'Verify'}
          </button>
        </div>
      )}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
