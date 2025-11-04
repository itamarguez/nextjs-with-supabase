"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';

interface TermsConsentModalProps {
  open: boolean;
  onAccept: () => void;
}

export function TermsConsentModal({ open, onAccept }: TermsConsentModalProps) {
  const [dataUsageConsent, setDataUsageConsent] = useState(false);
  const [termsConsent, setTermsConsent] = useState(false);

  const canProceed = dataUsageConsent && termsConsent;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Welcome to NoMoreFOMO! 🎉</DialogTitle>
          <DialogDescription className="text-base">
            Before you start, please review and accept our terms.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Data Usage Disclosure */}
          <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20">
            <h3 className="font-semibold text-lg mb-3">📊 Data Usage & Monetization</h3>
            <p className="text-sm mb-3">
              We want to be transparent about how we use your data:
            </p>
            <ul className="text-sm space-y-2 list-disc list-inside">
              <li>We collect your chat messages and usage data to provide AI services</li>
              <li>We create <strong>anonymized, aggregated analytics</strong> from all users</li>
              <li>We may <strong>sell these anonymized insights</strong> to third parties for research and analytics</li>
            </ul>
            <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded border">
              <p className="text-xs font-semibold mb-2">What This Means:</p>
              <ul className="text-xs space-y-1">
                <li>✅ <strong>Anonymized:</strong> No personal information linked to you</li>
                <li>✅ <strong>Aggregated:</strong> Combined with thousands of other users</li>
                <li>❌ <strong>Never Sold:</strong> Your email, name, or individual messages are NEVER sold</li>
              </ul>
              <p className="text-xs mt-2 italic">
                Example: "60% of users prefer Model X for coding" - NOT "John Doe asked about Python"
              </p>
            </div>
          </div>

          {/* User Rights */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">🔒 Your Rights</h3>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li>Request your data at any time</li>
              <li>Delete your account and personal data</li>
              <li>Opt-out of analytics (may limit features)</li>
              <li>Contact us at <span className="font-mono text-blue-600">privacy@nomorefomo.ai</span></li>
            </ul>
          </div>

          {/* Consent Checkboxes */}
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="data-usage"
                checked={dataUsageConsent}
                onCheckedChange={(checked) => setDataUsageConsent(checked === true)}
              />
              <label
                htmlFor="data-usage"
                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                I understand and consent to NoMoreFOMO collecting my usage data and creating{' '}
                <strong>anonymized, aggregated analytics</strong> that may be sold to third parties.
                I confirm that my personal information will never be sold identifiably.
              </label>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="terms"
                checked={termsConsent}
                onCheckedChange={(checked) => setTermsConsent(checked === true)}
              />
              <label
                htmlFor="terms"
                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                I agree to the{' '}
                <Link href="/terms-of-service" target="_blank" className="text-blue-600 hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy-policy" target="_blank" className="text-blue-600 hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={onAccept}
            disabled={!canProceed}
            className="w-full"
            size="lg"
          >
            {canProceed ? 'Accept & Continue 🚀' : 'Please accept both terms to continue'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
