import Link from 'next/link';

export const metadata = {
  title: 'Cookie Policy',
  description: 'Learn about the cookies NoMoreFOMO uses and how we protect your privacy.',
};

export default function CookiePolicyPage() {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-16">
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <h1>Cookie Policy</h1>
        <p className="text-muted-foreground">Last Updated: January 2025</p>

        <p>
          This Cookie Policy explains how NoMoreFOMO ("we", "us", or "our") uses cookies and similar technologies when you visit our website at{' '}
          <Link href="/" className="underline">llm-fomo.com</Link>.
        </p>

        <h2>What Are Cookies?</h2>
        <p>
          Cookies are small text files that are stored on your device (computer, tablet, or mobile) when you visit a website. They help the website recognize your device and remember information about your visit, such as your preferred settings and actions.
        </p>

        <h2>Why We Use Cookies</h2>
        <p>We use cookies for the following purposes:</p>
        <ul>
          <li><strong>Essential Functionality:</strong> To enable core features like authentication and trial message tracking</li>
          <li><strong>Security:</strong> To protect your account and prevent fraud</li>
          <li><strong>Analytics:</strong> To understand how visitors use our site and improve user experience</li>
          <li><strong>Preferences:</strong> To remember your cookie consent choice</li>
        </ul>

        <h2>Types of Cookies We Use</h2>

        <h3>1. Essential Cookies (Required)</h3>
        <p>These cookies are necessary for the website to function and cannot be disabled in our systems.</p>

        <table className="w-full border-collapse border border-border">
          <thead>
            <tr className="bg-muted">
              <th className="border border-border p-2 text-left">Cookie Name</th>
              <th className="border border-border p-2 text-left">Purpose</th>
              <th className="border border-border p-2 text-left">Duration</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-border p-2 font-mono text-sm">nomorefomo_trial_count</td>
              <td className="border border-border p-2">Tracks the number of free trial messages you've used (3 free messages)</td>
              <td className="border border-border p-2">24 hours</td>
            </tr>
            <tr>
              <td className="border border-border p-2 font-mono text-sm">nomorefomo_session_id</td>
              <td className="border border-border p-2">Tracks your anonymous session for trial chat analytics</td>
              <td className="border border-border p-2">30 days</td>
            </tr>
            <tr>
              <td className="border border-border p-2 font-mono text-sm">sb-*-auth-token</td>
              <td className="border border-border p-2">Supabase authentication cookies (keeps you logged in)</td>
              <td className="border border-border p-2">Session / 7 days</td>
            </tr>
            <tr>
              <td className="border border-border p-2 font-mono text-sm">nomorefomo_cookie_consent</td>
              <td className="border border-border p-2">Stores your cookie consent preference</td>
              <td className="border border-border p-2">1 year</td>
            </tr>
          </tbody>
        </table>

        <h3>2. Analytics Cookies (Optional)</h3>
        <p>
          These cookies help us understand how visitors interact with our website. We use this information to improve user experience and optimize our service.
        </p>

        <table className="w-full border-collapse border border-border mt-4">
          <thead>
            <tr className="bg-muted">
              <th className="border border-border p-2 text-left">Cookie Name</th>
              <th className="border border-border p-2 text-left">Purpose</th>
              <th className="border border-border p-2 text-left">Duration</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-border p-2 font-mono text-sm">Session tracking</td>
              <td className="border border-border p-2">
                We store anonymous session data in our database including:
                <ul className="mt-2 ml-4">
                  <li>Device type (mobile/desktop)</li>
                  <li>Browser type</li>
                  <li>Operating system</li>
                  <li>Country (from IP address)</li>
                  <li>Page views and session duration</li>
                </ul>
              </td>
              <td className="border border-border p-2">Stored indefinitely (anonymized)</td>
            </tr>
          </tbody>
        </table>

        <p className="mt-4 p-4 bg-muted rounded-md">
          <strong>Note:</strong> We do NOT use Google Analytics, Facebook Pixel, or any third-party tracking cookies. All analytics are collected directly by our application.
        </p>

        <h3>3. Marketing Cookies</h3>
        <p className="font-semibold text-green-600 dark:text-green-400">
          ✅ We do NOT use any marketing, advertising, or remarketing cookies.
        </p>

        <h2>Third-Party Cookies</h2>
        <p>We use the following third-party services that may set cookies:</p>
        <ul>
          <li>
            <strong>Supabase (Authentication & Database):</strong> Sets authentication cookies to keep you logged in.{' '}
            <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="underline">
              Supabase Privacy Policy
            </a>
          </li>
          <li>
            <strong>Stripe (Payment Processing):</strong> If you upgrade to a paid plan, Stripe may set cookies during checkout.{' '}
            <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="underline">
              Stripe Privacy Policy
            </a>
          </li>
          <li>
            <strong>Vercel (Hosting):</strong> May set performance cookies for content delivery.{' '}
            <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline">
              Vercel Privacy Policy
            </a>
          </li>
        </ul>

        <h2>How to Control Cookies</h2>

        <h3>Cookie Consent Banner</h3>
        <p>
          When you first visit our website, you'll see a cookie consent banner with the following options:
        </p>
        <ul>
          <li><strong>Accept All:</strong> Allows all cookies (essential + analytics)</li>
          <li><strong>Essential Only:</strong> Only allows cookies required for the site to function</li>
          <li><strong>Reject All:</strong> Rejects optional cookies (essential cookies still required)</li>
        </ul>

        <h3>Browser Settings</h3>
        <p>
          Most web browsers allow you to control cookies through their settings. However, if you block all cookies, some features of our website may not work properly.
        </p>
        <ul>
          <li>
            <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="underline">
              Google Chrome
            </a>
          </li>
          <li>
            <a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" target="_blank" rel="noopener noreferrer" className="underline">
              Mozilla Firefox
            </a>
          </li>
          <li>
            <a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" target="_blank" rel="noopener noreferrer" className="underline">
              Safari
            </a>
          </li>
          <li>
            <a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="underline">
              Microsoft Edge
            </a>
          </li>
        </ul>

        <h2>Data Retention</h2>
        <p>
          Cookie data is retained for the duration specified in the tables above. Once expired, cookies are automatically deleted from your device.
          Session data stored in our database is retained indefinitely in anonymized form for analytics purposes.
        </p>

        <h2>Your Rights (GDPR & CCPA)</h2>
        <p>Under GDPR (Europe) and CCPA (California), you have the right to:</p>
        <ul>
          <li>Know what personal data we collect via cookies</li>
          <li>Access and request a copy of your data</li>
          <li>Request deletion of your data (Right to be Forgotten)</li>
          <li>Opt-out of non-essential cookies</li>
          <li>Withdraw consent at any time</li>
        </ul>
        <p>
          To exercise these rights, please contact us at{' '}
          <a href="mailto:privacy@llm-fomo.com" className="underline">privacy@llm-fomo.com</a> or use the data deletion feature in your account settings.
        </p>

        <h2>Updates to This Policy</h2>
        <p>
          We may update this Cookie Policy from time to time to reflect changes in our practices or for legal compliance. The "Last Updated" date at the top of this page indicates when the policy was last revised.
        </p>

        <h2>Contact Us</h2>
        <p>If you have questions about our use of cookies, please contact us:</p>
        <ul className="list-none">
          <li><strong>Email:</strong> <a href="mailto:privacy@llm-fomo.com" className="underline">privacy@llm-fomo.com</a></li>
          <li><strong>Website:</strong> <Link href="/" className="underline">llm-fomo.com</Link></li>
        </ul>

        <h2>Related Policies</h2>
        <ul>
          <li><Link href="/privacy-policy" className="underline">Privacy Policy</Link></li>
          <li><Link href="/terms" className="underline">Terms of Service</Link></li>
        </ul>
      </div>
    </div>
  );
}
