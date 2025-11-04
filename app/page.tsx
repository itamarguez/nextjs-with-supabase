// NoMoreFOMO Landing Page

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { createClient } from '@/lib/supabase/server';
import { Zap, Brain, DollarSign, Shield, ArrowRight } from 'lucide-react';

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen">
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

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="mx-auto max-w-3xl space-y-6">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            Stop Choosing.
            <br />
            <span className="text-primary">Get the Best Answer.</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            NoMoreFOMO automatically selects the perfect AI model for every prompt.
            No more guessing which LLM to use - we pick the best one based on task type,
            performance rankings, and cost efficiency.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg">
              <Link href={user ? '/chat' : '/auth/sign-up'}>
                Start Chatting <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="#how-it-works">Learn More</Link>
            </Button>
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

      {/* How It Works */}
      <section id="how-it-works" className="container mx-auto px-4 py-20">
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
                We pick the top-ranked model for your tier and task category
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
                See which model answered and why it was chosen for your task
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
