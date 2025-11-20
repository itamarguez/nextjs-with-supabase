import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy',
  description: 'NoMoreFOMO Privacy Policy - How we collect, use, and protect your data.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-16">
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <h1>Privacy Policy</h1>
        <p className="text-muted-foreground">Last Updated: January 2025</p>

        <p>
          Welcome to NoMoreFOMO ("we", "us", or "our"). We are committed to protecting your privacy and being transparent about how we collect, use, and protect your personal data. This Privacy Policy explains our data practices in plain language.
        </p>

        <p className="p-4 bg-blue-50 dark:bg-blue-950 rounded-md border-l-4 border-blue-500">
          <strong>Quick Summary:</strong> We only collect data necessary to provide our AI chat service. We never sell your data. You can delete your account and all data at any time.
        </p>

        <h2>1. Information We Collect</h2>

        <h3>1.1 Information You Provide</h3>
        <ul>
          <li>
            <strong>Account Information:</strong>
            <ul>
              <li>Email address (for authentication and account recovery)</li>
              <li>Password (encrypted - we never see your actual password)</li>
              <li>Name (if you provide it via Google OAuth)</li>
            </ul>
          </li>
          <li>
            <strong>Chat Messages:</strong>
            <ul>
              <li>Your prompts and questions sent to AI models</li>
              <li>AI responses generated for you</li>
              <li>Conversation history and timestamps</li>
            </ul>
          </li>
          <li>
            <strong>Payment Information:</strong>
            <ul>
              <li>Billing details (processed securely by Stripe - we do not store credit card numbers)</li>
              <li>Subscription tier and payment history</li>
            </ul>
          </li>
        </ul>

        <h3>1.2 Information Automatically Collected</h3>
        <ul>
          <li>
            <strong>Usage Data:</strong>
            <ul>
              <li>IP address (for security and rate limiting)</li>
              <li>Device type (mobile, desktop, tablet)</li>
              <li>Browser type and version</li>
              <li>Operating system</li>
              <li>Country/region (derived from IP address)</li>
              <li>Pages visited and features used</li>
              <li>Session duration and timestamps</li>
            </ul>
          </li>
          <li>
            <strong>Cookies and Similar Technologies:</strong>
            <ul>
              <li>Authentication cookies (to keep you logged in)</li>
              <li>Trial message counter (tracks free trial usage)</li>
              <li>Session identifiers (for analytics)</li>
              <li>Cookie consent preferences</li>
            </ul>
          </li>
        </ul>

        <h3>1.3 Information from Third Parties</h3>
        <ul>
          <li>
            <strong>Google OAuth:</strong> If you sign up with Google, we receive your name, email, and profile picture from Google
          </li>
          <li>
            <strong>AI Model Providers:</strong> We send your prompts to OpenAI, Anthropic, or Google depending on which model is selected
          </li>
        </ul>

        <h2>2. How We Use Your Information</h2>

        <h3>2.1 To Provide Our Service</h3>
        <ul>
          <li>Process your AI chat requests and generate responses</li>
          <li>Maintain your conversation history</li>
          <li>Authenticate and manage your account</li>
          <li>Process payments and manage subscriptions</li>
          <li>Send transactional emails (password resets, payment confirmations)</li>
        </ul>

        <h3>2.2 To Improve Our Service</h3>
        <ul>
          <li>Analyze usage patterns to improve model selection algorithms</li>
          <li>Track performance metrics (latency, errors, cost per request)</li>
          <li>Understand which features users value most</li>
          <li>Identify and fix bugs</li>
        </ul>

        <h3>2.3 For Security and Fraud Prevention</h3>
        <ul>
          <li>Detect and prevent abuse (spam, automated attacks)</li>
          <li>Monitor for suspicious activity</li>
          <li>Enforce rate limits to protect our infrastructure</li>
          <li>Comply with legal obligations</li>
        </ul>

        <h3>2.4 Legal Bases for Processing (GDPR)</h3>
        <p>We process your personal data based on:</p>
        <ul>
          <li><strong>Contract:</strong> To provide the service you signed up for</li>
          <li><strong>Consent:</strong> For optional cookies and analytics</li>
          <li><strong>Legitimate Interest:</strong> To improve our service, prevent fraud, and ensure security</li>
          <li><strong>Legal Obligation:</strong> To comply with applicable laws</li>
        </ul>

        <h2>3. How We Share Your Information</h2>

        <h3>3.1 Third-Party Service Providers</h3>
        <p>We share your data with trusted third parties who help us provide our service:</p>

        <table className="w-full border-collapse border border-border mt-4">
          <thead>
            <tr className="bg-muted">
              <th className="border border-border p-2 text-left">Service</th>
              <th className="border border-border p-2 text-left">Purpose</th>
              <th className="border border-border p-2 text-left">Data Shared</th>
              <th className="border border-border p-2 text-left">Privacy Policy</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-border p-2">Supabase</td>
              <td className="border border-border p-2">Database & Authentication</td>
              <td className="border border-border p-2">Email, password (encrypted), messages, usage data</td>
              <td className="border border-border p-2">
                <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="underline">Link</a>
              </td>
            </tr>
            <tr>
              <td className="border border-border p-2">OpenAI</td>
              <td className="border border-border p-2">AI Model (GPT-4o, GPT-4o-mini)</td>
              <td className="border border-border p-2">Your prompts and conversation context</td>
              <td className="border border-border p-2">
                <a href="https://openai.com/privacy" target="_blank" rel="noopener noreferrer" className="underline">Link</a>
              </td>
            </tr>
            <tr>
              <td className="border border-border p-2">Anthropic</td>
              <td className="border border-border p-2">AI Model (Claude Sonnet, Haiku)</td>
              <td className="border border-border p-2">Your prompts and conversation context</td>
              <td className="border border-border p-2">
                <a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener noreferrer" className="underline">Link</a>
              </td>
            </tr>
            <tr>
              <td className="border border-border p-2">Google AI</td>
              <td className="border border-border p-2">AI Model (Gemini 2.0 Flash)</td>
              <td className="border border-border p-2">Your prompts and conversation context</td>
              <td className="border border-border p-2">
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline">Link</a>
              </td>
            </tr>
            <tr>
              <td className="border border-border p-2">Stripe</td>
              <td className="border border-border p-2">Payment Processing</td>
              <td className="border border-border p-2">Email, billing details, payment info</td>
              <td className="border border-border p-2">
                <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="underline">Link</a>
              </td>
            </tr>
            <tr>
              <td className="border border-border p-2">Vercel</td>
              <td className="border border-border p-2">Hosting & CDN</td>
              <td className="border border-border p-2">IP address, device info, pages visited</td>
              <td className="border border-border p-2">
                <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline">Link</a>
              </td>
            </tr>
          </tbody>
        </table>

        <p className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-950 rounded-md border-l-4 border-yellow-500">
          <strong>Important:</strong> AI model providers (OpenAI, Anthropic, Google) have committed to NOT using your data to train their models when accessed via API. Your prompts are processed to generate responses but not used for model improvement.
        </p>

        <h3>3.2 Anonymized Data Sharing</h3>
        <p>
          We may share <strong>anonymized and aggregated data</strong> with partners, researchers, and third parties for analytics, benchmarking, and industry insights.
        </p>

        <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-md border-l-4 border-blue-500 my-4">
          <p className="font-semibold mb-2">What does "anonymized" mean?</p>
          <p className="text-sm">
            We remove all personally identifiable information (PII) so the data cannot be traced back to you. This includes:
          </p>
          <ul className="text-sm mt-2">
            <li>Removing names, emails, IP addresses, and user IDs</li>
            <li>Aggregating data across many users (e.g., "1,000 users asked coding questions")</li>
            <li>Adding noise or generalizing data (e.g., "users in California" instead of specific city)</li>
            <li>Ensuring data cannot be re-identified even when combined with external data</li>
          </ul>
        </div>

        <p><strong>Examples of anonymized data we may share:</strong></p>
        <ul>
          <li>Aggregate usage statistics (e.g., "GPT-4o was selected 60% of the time for coding tasks")</li>
          <li>Anonymized prompt categories and model performance metrics</li>
          <li>General trends in AI model selection and user preferences</li>
          <li>Anonymized cost and token usage benchmarks</li>
        </ul>

        <p className="p-4 bg-green-50 dark:bg-green-950 rounded-md border-l-4 border-green-500 mt-4">
          <strong>GDPR Compliance:</strong> Once data is truly anonymized (cannot be re-identified), it is no longer considered "personal data" under GDPR. However, we are transparent about this practice and allow you to opt-out of data collection for anonymization purposes.
        </p>

        <h3>3.3 We Do NOT Sell Personal Data</h3>
        <p className="font-semibold text-green-600 dark:text-green-400">
          ✅ We do NOT sell, rent, or trade your <strong>personally identifiable information</strong> (name, email, messages, etc.) to third parties.
        </p>
        <p className="text-sm text-muted-foreground">
          Note: Anonymized data (described above) may be shared with partners, but it cannot be linked back to you.
        </p>

        <h3>3.4 Future Advertising (Not Yet Implemented)</h3>
        <p>
          We plan to introduce <strong>optional, non-intrusive advertising</strong> in the future to support the free tier. When implemented:
        </p>
        <ul>
          <li><strong>Opt-In for EU Users:</strong> You will be asked for explicit consent before any ads are shown (GDPR requirement)</li>
          <li><strong>Opt-Out Anytime:</strong> You can disable ads by upgrading to a paid tier or adjusting your privacy settings</li>
          <li><strong>Relevant Ads Only:</strong> Ads will be contextually relevant (based on your current prompt category, not personal data)</li>
          <li><strong>No Third-Party Tracking:</strong> We will not share your personal information with advertisers</li>
          <li><strong>Transparent Partners:</strong> We will disclose all advertising partners and their privacy policies</li>
        </ul>
        <p className="text-sm text-muted-foreground mt-2">
          We will notify you via email and update this Privacy Policy before any advertising features are launched. You will have the option to opt-out at that time.
        </p>

        <h3>3.5 Legal Requirements</h3>
        <p>We may disclose your information if required by law, such as:</p>
        <ul>
          <li>In response to a court order or subpoena</li>
          <li>To protect our rights, property, or safety</li>
          <li>To investigate fraud or security issues</li>
          <li>To comply with regulatory requirements</li>
        </ul>

        <h2>4. International Data Transfers</h2>
        <p>
          NoMoreFOMO is hosted in the United States. If you are accessing our service from outside the US (especially from the European Union), your data will be transferred to and stored in the US.
        </p>
        <p>
          We ensure appropriate safeguards are in place, including:
        </p>
        <ul>
          <li>Standard Contractual Clauses (SCCs) with our service providers</li>
          <li>GDPR-compliant data processing agreements</li>
          <li>Encryption in transit and at rest</li>
        </ul>

        <h2>5. Data Retention</h2>
        <p>We retain your data for as long as necessary to provide our service:</p>
        <ul>
          <li><strong>Active Accounts:</strong> Data retained while your account is active</li>
          <li><strong>Deleted Accounts:</strong> Data permanently deleted within 30 days of account deletion</li>
          <li><strong>Trial Data:</strong> Anonymous trial session data retained indefinitely for analytics</li>
          <li><strong>Billing Records:</strong> Retained for 7 years for tax compliance</li>
          <li><strong>Security Logs:</strong> Retained for 90 days for fraud prevention</li>
        </ul>

        <h2>6. Your Privacy Rights</h2>

        <h3>6.1 GDPR Rights (EU Users)</h3>
        <p>If you are in the European Economic Area (EEA), you have the right to:</p>
        <ul>
          <li><strong>Access:</strong> Request a copy of your personal data</li>
          <li><strong>Rectification:</strong> Correct inaccurate or incomplete data</li>
          <li><strong>Erasure (Right to be Forgotten):</strong> Request deletion of your data</li>
          <li><strong>Portability:</strong> Export your data in a machine-readable format (JSON)</li>
          <li><strong>Restriction:</strong> Limit how we process your data</li>
          <li><strong>Object:</strong> Object to processing based on legitimate interests</li>
          <li><strong>Withdraw Consent:</strong> Withdraw consent at any time (for consent-based processing)</li>
          <li><strong>Lodge a Complaint:</strong> File a complaint with your local data protection authority</li>
        </ul>

        <h3>6.2 CCPA Rights (California Users)</h3>
        <p>If you are a California resident, you have the right to:</p>
        <ul>
          <li><strong>Know:</strong> What personal information we collect and how we use it</li>
          <li><strong>Access:</strong> Request a copy of your data (up to 2 times per year)</li>
          <li><strong>Delete:</strong> Request deletion of your data</li>
          <li>
            <strong>Opt-Out of "Sale":</strong> We do NOT sell your personal information. However:
            <ul className="mt-2">
              <li>We share <strong>anonymized data</strong> with partners (cannot be traced back to you)</li>
              <li>Under CCPA's broad definition, this <em>might</em> be considered a "sale" even though it's anonymized</li>
              <li>You can opt-out of anonymization by contacting us (though this limits our ability to improve the service)</li>
            </ul>
          </li>
          <li><strong>Non-Discrimination:</strong> We will not discriminate against you for exercising your rights</li>
        </ul>

        <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-md border-l-4 border-blue-500 my-4">
          <p className="font-semibold mb-2">🔗 California "Do Not Sell My Personal Information"</p>
          <p className="text-sm">
            To exercise your CCPA opt-out rights, email us at{' '}
            <a href="mailto:privacy@llm-fomo.com" className="underline">privacy@llm-fomo.com</a>
            {' '}with the subject line "CCPA Opt-Out Request". We will:
          </p>
          <ul className="text-sm mt-2">
            <li>Stop including your data in future anonymized datasets</li>
            <li>Remove your existing data from datasets where technically feasible</li>
            <li>Confirm your opt-out within 15 business days</li>
          </ul>
        </div>

        <h3>6.3 How to Exercise Your Rights</h3>
        <p>To exercise any of these rights:</p>
        <ol>
          <li>
            <strong>Self-Service (Recommended):</strong>
            <ul>
              <li>Download your data: Go to Settings → Download My Data</li>
              <li>Delete your account: Go to Settings → Delete Account</li>
            </ul>
          </li>
          <li>
            <strong>Email Us:</strong> Send a request to{' '}
            <a href="mailto:privacy@llm-fomo.com" className="underline">privacy@llm-fomo.com</a>
          </li>
        </ol>
        <p>We will respond to your request within 30 days (GDPR) or 45 days (CCPA).</p>

        <h2>7. Children's Privacy (COPPA)</h2>
        <p className="p-4 bg-red-50 dark:bg-red-950 rounded-md border-l-4 border-red-500">
          <strong>Age Restriction:</strong> You must be at least 13 years old to use NoMoreFOMO. We do not knowingly collect personal information from children under 13.
        </p>
        <p>
          If we discover that we have collected data from a child under 13, we will delete that information immediately. If you believe a child has provided us with personal information, please contact us at{' '}
          <a href="mailto:privacy@llm-fomo.com" className="underline">privacy@llm-fomo.com</a>.
        </p>

        <h2>8. Data Security</h2>
        <p>We implement industry-standard security measures to protect your data:</p>
        <ul>
          <li><strong>Encryption:</strong> All data is encrypted in transit (HTTPS/TLS) and at rest (AES-256)</li>
          <li><strong>Access Controls:</strong> Role-based access control (RBAC) and row-level security (RLS)</li>
          <li><strong>Authentication:</strong> Secure password hashing (bcrypt) and OAuth 2.0</li>
          <li><strong>Rate Limiting:</strong> Protection against brute force attacks and DDoS</li>
          <li><strong>Regular Audits:</strong> Security reviews and vulnerability scanning</li>
          <li><strong>Incident Response:</strong> Plan in place for data breaches (will notify within 72 hours if GDPR applies)</li>
        </ul>

        <p>
          However, no system is 100% secure. If you discover a security vulnerability, please report it to{' '}
          <a href="mailto:security@llm-fomo.com" className="underline">security@llm-fomo.com</a>.
        </p>

        <h2>9. Do Not Track Signals</h2>
        <p>
          Some browsers have a "Do Not Track" (DNT) feature that lets you tell websites you don't want to be tracked. We currently do not respond to DNT signals because there is no industry standard for how to interpret them. However, you can control cookies via our{' '}
          <Link href="/cookie-policy" className="underline">Cookie Policy</Link>.
        </p>

        <h2>10. California "Shine the Light" Law</h2>
        <p>
          California residents can request information about our disclosure of personal information to third parties for direct marketing purposes. Since we do NOT share data for marketing purposes, this does not apply to us.
        </p>

        <h2>11. Changes to This Privacy Policy</h2>
        <p>
          We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. When we make significant changes, we will:
        </p>
        <ul>
          <li>Update the "Last Updated" date at the top of this page</li>
          <li>Notify you via email (if you have an account)</li>
          <li>Display a prominent notice on our website</li>
        </ul>
        <p>
          Your continued use of NoMoreFOMO after changes take effect constitutes acceptance of the updated policy.
        </p>

        <h2>12. Contact Us</h2>
        <p>If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:</p>
        <ul className="list-none">
          <li><strong>Email:</strong> <a href="mailto:privacy@llm-fomo.com" className="underline">privacy@llm-fomo.com</a></li>
          <li><strong>Security Issues:</strong> <a href="mailto:security@llm-fomo.com" className="underline">security@llm-fomo.com</a></li>
          <li><strong>General Inquiries:</strong> <a href="mailto:support@llm-fomo.com" className="underline">support@llm-fomo.com</a></li>
          <li><strong>Website:</strong> <Link href="/" className="underline">llm-fomo.com</Link></li>
        </ul>

        <h3>Data Protection Officer (DPO)</h3>
        <p>
          For GDPR-related inquiries, you can contact our Data Protection Officer at:{' '}
          <a href="mailto:dpo@llm-fomo.com" className="underline">dpo@llm-fomo.com</a>
        </p>

        <h3>EU Representative</h3>
        <p>
          If you are in the EU and have concerns about our data practices, you can lodge a complaint with your local supervisory authority:
        </p>
        <ul>
          <li>
            <a href="https://edpb.europa.eu/about-edpb/about-edpb/members_en" target="_blank" rel="noopener noreferrer" className="underline">
              Find your EU Data Protection Authority
            </a>
          </li>
        </ul>

        <h2>13. Related Policies</h2>
        <ul>
          <li><Link href="/cookie-policy" className="underline">Cookie Policy</Link></li>
          <li><Link href="/terms" className="underline">Terms of Service</Link></li>
        </ul>

        <div className="mt-12 p-6 bg-muted rounded-lg border">
          <h3 className="text-xl font-semibold mt-0">TL;DR (Summary)</h3>
          <ul className="mb-0">
            <li>✅ We only collect data needed to provide our service</li>
            <li>✅ We never sell your <strong>personal information</strong> (name, email, messages)</li>
            <li>✅ We may share <strong>anonymized data</strong> (cannot be traced back to you)</li>
            <li>✅ You can download or delete your data at any time</li>
            <li>✅ AI providers don't use your prompts for training</li>
            <li>✅ We use encryption and security best practices</li>
            <li>✅ You have full GDPR and CCPA rights (including opt-out of anonymization)</li>
            <li>✅ Must be 13+ to use the service</li>
            <li>⏳ Future: Optional ads (opt-in for EU, opt-out anytime, contextually relevant)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
