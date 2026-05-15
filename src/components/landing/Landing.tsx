import { Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Cake,
  Calculator,
  CircleDollarSign,
  Cookie,
  PieChart,
  Receipt,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PieLogo, PieWordmark } from '@/components/common/PieLogo'
import { UserSwitcher } from '@/components/layout/UserSwitcher'
import { useStore } from '@/store'
import { useCurrentUser } from '@/hooks/useCurrentUser'

export function Landing() {
  const currentUserId = useStore((s) => s.currentUserId)
  const isSignedIn = Boolean(currentUserId)
  const primaryHref = isSignedIn ? '/app' : '/register'
  const primaryLabel = isSignedIn ? 'Open Pie' : 'Get started — it’s free'

  return (
    <div className="min-h-screen flex flex-col">
      <LandingNav />
      <main className="flex-1">
        <Hero
          primaryHref={primaryHref}
          primaryLabel={primaryLabel}
          isSignedIn={isSignedIn}
        />
        <Features />
        <HowItWorks />
        <CTA
          primaryHref={primaryHref}
          primaryLabel={primaryLabel}
          isSignedIn={isSignedIn}
        />
      </main>
      <Footer isSignedIn={isSignedIn} />
    </div>
  )
}

function LandingNav() {
  const current = useCurrentUser()
  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-background/70 border-b border-border/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center">
          <PieWordmark />
        </Link>
        <nav className="flex items-center gap-2">
          {current ? (
            <>
              <Button asChild size="sm">
                <Link to="/app">
                  Open Pie <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <UserSwitcher />
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/login">Log in</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/register">
                  Sign up <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

function Hero({
  primaryHref,
  primaryLabel,
  isSignedIn,
}: {
  primaryHref: string
  primaryLabel: string
  isSignedIn: boolean
}) {
  return (
    <section className="relative overflow-hidden">
      <div className="container py-20 md:py-28 grid lg:grid-cols-[1.1fr,1fr] gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground">
            <Cookie className="h-3.5 w-3.5 text-accent" />
            Split bills the sweet way
          </span>
          <h1 className="mt-4 font-serif text-5xl md:text-6xl leading-[1.05] font-semibold text-balance text-cocoa">
            Slice every bill <span className="text-accent">fairly</span>. Settle up in a tap.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">
            Pie tracks shared expenses for meals, trips, and apartments — auto-splitting four ways
            (equal, exact, percentage, shares) and showing exactly who owes who.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="text-base">
              <Link to={primaryHref}>
                {primaryLabel} <ArrowRight className="ml-1 h-5 w-5" />
              </Link>
            </Button>
            {isSignedIn ? null : (
              <Button asChild size="lg" variant="outline" className="text-base">
                <Link to="/login">I have an account</Link>
              </Button>
            )}
          </div>
          <div className="mt-6 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Receipt className="h-3.5 w-3.5" /> No card required
            </span>
            <span className="inline-flex items-center gap-1">
              <CircleDollarSign className="h-3.5 w-3.5" /> Works offline
            </span>
            <span className="inline-flex items-center gap-1">
              <PieChart className="h-3.5 w-3.5" /> Open source feel
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
          className="relative"
        >
          <HeroIllustration />
        </motion.div>
      </div>
    </section>
  )
}

function HeroIllustration() {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="absolute -inset-6 rounded-[40px] bg-pie-radial blur-2xl opacity-80" />
      <div className="relative rounded-3xl border border-border bg-card/80 backdrop-blur p-6 shadow-[0_30px_80px_-20px_rgba(61,44,32,0.25)]">
        <div className="flex items-center gap-3 mb-5">
          <PieLogo className="h-10 w-10" />
          <div>
            <div className="font-serif text-lg font-semibold">Trip to Italy</div>
            <div className="text-xs text-muted-foreground">3 members · 4 expenses</div>
          </div>
        </div>

        <div className="space-y-3">
          {[
            { icon: '🍝', title: 'Dinner at Trattoria', sub: 'Alice paid · split equally', amount: '$90.00' },
            { icon: '🚖', title: 'Taxi to airport', sub: 'Bob paid · split equally', amount: '$30.00' },
            { icon: '🏨', title: 'Hotel for 3 nights', sub: 'Alice paid · 40/30/30', amount: '$450.00' },
          ].map((row, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
              className="flex items-center justify-between rounded-xl border border-border/60 bg-background/60 px-3 py-2.5"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/25 text-base">
                  {row.icon}
                </div>
                <div>
                  <div className="text-sm font-medium">{row.title}</div>
                  <div className="text-xs text-muted-foreground">{row.sub}</div>
                </div>
              </div>
              <div className="text-sm font-semibold tabular-nums">{row.amount}</div>
            </motion.div>
          ))}
        </div>

        <div className="mt-5 rounded-xl bg-accent/10 border border-accent/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wider text-accent font-semibold">
                Settle up
              </div>
              <div className="font-serif text-lg font-semibold text-cocoa">
                Bob → Alice <span className="text-accent">$160.00</span>
              </div>
            </div>
            <div className="rounded-full h-10 w-10 bg-accent grid place-items-center text-accent-foreground">
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Features() {
  const features = [
    {
      icon: Users,
      title: 'Groups for every shared cost',
      body: 'Trips, roommates, weekly dinners — keep each circle of friends and its expenses tidy in one place.',
    },
    {
      icon: Calculator,
      title: 'Four ways to split',
      body: 'Equal shares, exact amounts, percentages, or weighted shares — pick what fits each receipt.',
    },
    {
      icon: PieChart,
      title: 'Simplify the math',
      body: 'Our optimizer reduces a tangle of IOUs to the fewest payments needed to settle everyone fairly.',
    },
    {
      icon: Cake,
      title: 'Made to feel warm',
      body: 'A cozy, modern interface that makes “who owes what” feel like sharing a dessert, not a chore.',
    },
  ]
  return (
    <section className="container py-16 md:py-24">
      <div className="max-w-2xl">
        <h2 className="font-serif text-3xl md:text-4xl font-semibold text-balance">
          Built for the trickiest bill at the table.
        </h2>
        <p className="mt-3 text-muted-foreground">
          From the cheap dinner with five friends to the rented villa with a complex deposit, Pie
          handles the math so you can keep the friendship.
        </p>
      </div>
      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ delay: i * 0.06, duration: 0.4 }}
            className="rounded-2xl border border-border bg-card/70 p-6"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/25 text-cocoa">
              <f.icon className="h-5 w-5" />
            </div>
            <h3 className="font-serif text-xl font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.body}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

function HowItWorks() {
  const steps = [
    { n: '01', title: 'Create your slice', body: 'Sign up in seconds. No real email needed — Pie keeps everything on this device.' },
    { n: '02', title: 'Invite the table', body: 'Start a group and invite registered friends. Switch between accounts to see every side.' },
    { n: '03', title: 'Add a bill', body: 'Type the amount, pick who paid, choose a split method. Pie shows each share live.' },
    { n: '04', title: 'Settle up', body: 'Open Balances or Settle Up to see suggested payments. Mark them paid as money moves.' },
  ]
  return (
    <section className="bg-filling/40 border-y border-border">
      <div className="container py-16 md:py-24">
        <div className="max-w-2xl">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold">
            From first bite to final payment.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Designed to feel like setting the table, then sharing dessert.
          </p>
        </div>
        <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((s) => (
            <div key={s.n} className="rounded-2xl border border-border bg-background/70 p-6">
              <div className="font-serif text-3xl text-accent">{s.n}</div>
              <h3 className="mt-2 font-serif text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTA({
  primaryHref,
  primaryLabel,
  isSignedIn,
}: {
  primaryHref: string
  primaryLabel: string
  isSignedIn: boolean
}) {
  return (
    <section className="container py-16 md:py-24">
      <div className="relative overflow-hidden rounded-3xl bg-pie-radial border border-border p-10 md:p-14 text-center">
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="font-serif text-3xl md:text-5xl font-semibold text-balance">
            Ready to slice your next bill?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Pie runs entirely in your browser — your data stays with you. Take a bite.
          </p>
          <div className="mt-7 flex flex-wrap gap-3 justify-center">
            <Button asChild size="lg">
              <Link to={primaryHref}>
                {primaryLabel} <ArrowRight className="ml-1 h-5 w-5" />
              </Link>
            </Button>
            {isSignedIn ? null : (
              <Button asChild size="lg" variant="outline">
                <Link to="/login">Log in</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function Footer({ isSignedIn }: { isSignedIn: boolean }) {
  return (
    <footer className="border-t border-border/60">
      <div className="container py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <PieLogo className="h-5 w-5" />
          <span>Pie · built for the bill-splitting challenge</span>
        </div>
        <div className="flex items-center gap-4">
          <span>© {new Date().getFullYear()} Pie</span>
          {isSignedIn ? null : (
            <>
              <Link to="/login" className="hover:text-foreground">Log in</Link>
              <Link to="/register" className="hover:text-foreground">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </footer>
  )
}
