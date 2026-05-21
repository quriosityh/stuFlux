import { ShieldCheck, MessageSquare, CheckCircle } from 'lucide-react';

export function TrustStrip() {
  return (
    <div className="mt-12 py-8 border-t border-border/10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-6 h-6 text-accent shrink-0 mt-0.5" />
          <div>
            <h4 className="font-syne font-semibold text-sm mb-1">Backed by StuFlux Guarantee</h4>
            <p className="text-xs text-foreground/60 leading-relaxed">
              Every rental is protected against damage and theft. Rent with peace of mind.
            </p>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <CheckCircle className="w-6 h-6 text-accent shrink-0 mt-0.5" />
          <div>
            <h4 className="font-syne font-semibold text-sm mb-1">Verified Community</h4>
            <p className="text-xs text-foreground/60 leading-relaxed">
              All users pass strict identity checks. You're renting from real people.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <MessageSquare className="w-6 h-6 text-accent shrink-0 mt-0.5" />
          <div>
            <h4 className="font-syne font-semibold text-sm mb-1">In-app Messaging</h4>
            <p className="text-xs text-foreground/60 leading-relaxed">
              Communicate securely on the platform. Never share your personal number.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
