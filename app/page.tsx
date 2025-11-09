// NoMoreFOMO Landing Page

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { TrialChat } from '@/components/landing/trial-chat';
import { AuthRedirect } from '@/components/auth-redirect';
import { createClient } from '@/lib/supabase/server';
import { Zap, Brain, DollarSign, Shield, ArrowRight } from 'lucide-react';
import { PageViewTracker } from '@/components/analytics/page-view-tracker';

// Force dynamic rendering to check auth on every request
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect authenticated users directly to chat
  if (user) {
    redirect('/chat');
  }

  return (
    <div className="min-h-screen">
      {/* Analytics tracking */}
      <PageViewTracker />
      {/* Client-side auth redirect for Safari compatibility */}
      <AuthRedirect />
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">NoMoreFOMO</span>
            <Badge variant="secondary">Beta</Badge>
          </div>
          <div className="flex items-center gap-4">
            <ThemeSwitcher />
            {user ? (
              <Button asChild>
                <Link href="/chat">Go to Chat</Link>
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button asChild variant="outline">
                  <Link href="/auth/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/sign-up">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section with Trial Chat */}
      <section className="container mx-auto px-4 py-12" id="hero">
        <div className="mx-auto max-w-6xl">
          {/* Headline */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Stop Choosing.
              <br />
              <span className="text-primary">Get the Best Answer.</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground sm:text-xl">
              Try it now - no signup required! We automatically select the perfect AI model for your prompt.
            </p>
          </div>

          {/* Trial Chat Widget */}
          <div className="mb-8 scroll-mt-24">
            <TrialChat />
          </div>

          {/* Visual Example - How It Works */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm">
              <span className="text-primary">✨</span>
              <span className="font-medium">See which model answered your question - shown after every response!</span>
            </div>
          </div>

          {/* Social Proof */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Join hundreds of users who've ditched the model-switching game
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold">Why NoMoreFOMO?</h2>
            <p className="mt-2 text-muted-foreground">
              Smart routing means better answers and lower costs
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <Brain className="h-10 w-10 text-primary" />
                <CardTitle>Intelligent Selection</CardTitle>
                <CardDescription>
                  Our AI analyzes your prompt and picks the best model for the task -
                  whether it is coding, creative writing, math, or general chat.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="h-10 w-10 text-primary" />
                <CardTitle>LMArena Rankings</CardTitle>
                <CardDescription>
                  Based on real performance data from LMArena leaderboards.
                  Get the highest-ranked model for each task category.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <DollarSign className="h-10 w-10 text-primary" />
                <CardTitle>Cost Optimized</CardTitle>
                <CardDescription>
                  Start free with budget-friendly models. Upgrade for access to
                  premium models and higher limits when you need them.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-10 w-10 text-primary" />
                <CardTitle>Abuse Protection</CardTitle>
                <CardDescription>
                  Built-in rate limiting and abuse detection keeps the platform
                  fair and costs sustainable for everyone.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Visual Example - See Model Selection in Action */}
      <section className="container mx-auto px-4 py-20">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold">See Model Selection in Action</h2>
          <p className="mt-2 text-muted-foreground">
            Every response shows which AI model answered and why
          </p>
        </div>

        <div className="mx-auto max-w-4xl space-y-6">
          {/* Example 1: Coding Question */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-muted/50">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground text-sm font-semibold">
                  👤
                </div>
                <div>
                  <p className="text-sm">Write a Python function to check if a number is prime</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                  🤖
                </div>
                <div className="flex-1">
                  <p className="text-sm mb-2">Here's an efficient prime number checker...</p>
                  <div className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1.5 text-xs border border-primary/20">
                    <Badge variant="secondary" className="text-xs">claude-3-5-haiku</Badge>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">coding</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-primary font-medium">Chosen for best coding performance</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Example 2: Creative Question */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-muted/50">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground text-sm font-semibold">
                  👤
                </div>
                <div>
                  <p className="text-sm">Write a haiku about artificial intelligence</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                  🤖
                </div>
                <div className="flex-1">
                  <p className="text-sm mb-2">Silicon minds awake / Learning patterns in the dark / Future speaks to us</p>
                  <div className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1.5 text-xs border border-primary/20">
                    <Badge variant="secondary" className="text-xs">gpt-4o-mini</Badge>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">creative</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-primary font-medium">Top-ranked for creative tasks</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Example 3: Math Question */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-muted/50">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground text-sm font-semibold">
                  👤
                </div>
                <div>
                  <p className="text-sm">Solve: What's the derivative of x² + 3x + 5?</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                  🤖
                </div>
                <div className="flex-1">
                  <p className="text-sm mb-2">The derivative is 2x + 3. Using the power rule...</p>
                  <div className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1.5 text-xs border border-primary/20">
                    <Badge variant="secondary" className="text-xs">gemini-2.0-flash-thinking</Badge>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">math</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-primary font-medium">Best for mathematical reasoning</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex flex-col gap-2 rounded-lg border bg-card p-6">
            <div className="text-2xl">🎯</div>
            <h3 className="font-semibold">No More Guessing</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              You'll always know which model answered your question and why it was the best choice for that specific task.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="container mx-auto px-4 py-20 bg-muted/30">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold">How It Works</h2>
          <p className="mt-2 text-muted-foreground">
            Four simple steps to better AI answers
          </p>
        </div>

        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
          <div className="flex gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
              1
            </div>
            <div>
              <h3 className="font-semibold">You ask a question</h3>
              <p className="text-sm text-muted-foreground">
                Type any prompt - code help, creative writing, math problems, or casual chat
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
              2
            </div>
            <div>
              <h3 className="font-semibold">We analyze the task</h3>
              <p className="text-sm text-muted-foreground">
                Our prompt analyzer categorizes your request (coding, creative, math, etc.)
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
              3
            </div>
            <div>
              <h3 className="font-semibold">Best model selected</h3>
              <p className="text-sm text-muted-foreground">
                We pick the top-ranked model for your tier and task category based on LMArena rankings
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
              4
            </div>
            <div>
              <h3 className="font-semibold">You get the answer</h3>
              <p className="text-sm text-muted-foreground">
                See which model answered and why it was chosen for your task - transparency built in!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-t border-border bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold">Simple, Fair Pricing</h2>
            <p className="mt-2 text-muted-foreground">
              Start free, upgrade when you need more
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
            {/* Free Tier */}
            <Card>
              <CardHeader>
                <CardTitle>Free</CardTitle>
                <CardDescription>Perfect for trying out the platform</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li>✓ 100K tokens/month</li>
                  <li>✓ 200 requests/day</li>
                  <li>✓ GPT-4o Mini & Gemini Flash</li>
                  <li>✓ Standard response time</li>
                </ul>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/auth/sign-up">Start Free</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Pro Tier */}
            <Card className="border-primary">
              <CardHeader>
                <Badge className="w-fit">Most Popular</Badge>
                <CardTitle className="mt-2">Pro</CardTitle>
                <CardDescription>For power users and developers</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$20</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li>✓ 1M tokens/month</li>
                  <li>✓ 2,000 requests/day</li>
                  <li>✓ All Free models + Claude Haiku</li>
                  <li>✓ Larger context (32K)</li>
                  <li>✓ Priority support</li>
                </ul>
                <Button asChild className="w-full">
                  <Link href="/auth/sign-up">Get Pro</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Unlimited Tier */}
            <Card>
              <CardHeader>
                <CardTitle>Unlimited</CardTitle>
                <CardDescription>For teams and heavy users</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$100</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li>✓ Unlimited tokens</li>
                  <li>✓ 10,000 requests/day</li>
                  <li>✓ GPT-4o & Claude Sonnet</li>
                  <li>✓ Max context (200K)</li>
                  <li>✓ Priority queue</li>
                  <li>✓ Dedicated support</li>
                </ul>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/auth/sign-up">Get Unlimited</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="mx-auto max-w-2xl space-y-6">
          <h2 className="text-4xl font-bold">Ready to Stop Choosing?</h2>
          <p className="text-xl text-muted-foreground">
            Join NoMoreFOMO and let AI pick the best AI for you.
          </p>
          <Button asChild size="lg">
            <Link href={user ? '/chat' : '/auth/sign-up'}>
              Start Chatting Now <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 NoMoreFOMO. Built with Next.js, Supabase, and the best LLMs.</p>
        </div>
      </footer>
    </div>
  );
}
