import Image from "next/image"
import { Countdown } from "@/components/countdown"
import { RsvpForm } from "@/components/rsvp-form"
import { PrMonogram, LotusRowDivider } from "@/components/motifs"
import { EasterEggProvider, HiddenGem } from "@/components/easter-eggs"
import { Reveal } from "@/components/reveal"
import { MapPin, Clock, CalendarDays, HandHeart, Flame, Utensils } from "lucide-react"

const schedule = [
  {
    icon: HandHeart,
    time: "5:30 AM – 6:30 AM",
    title: "Nalungu",
    desc: "A vibrant pre-wedding ritual of blessings to welcome the couple into married life.",
  },
  {
    icon: Flame,
    time: "9:00 AM – 11:00 AM",
    title: "Muhurtham",
    desc: "The heart of the day — vows exchanged before the sacred fire at the most auspicious hour, surrounded by loved ones.",
  },
  {
    icon: Utensils,
    time: "Morning",
    title: "Breakfast",
    desc: "A warm South Indian spread served as the morning celebrations begin.",
  },
  {
    icon: Utensils,
    time: "Afternoon",
    title: "Lunch",
    desc: "A festive traditional meal to celebrate the newlyweds together.",
  },
]

export default function Page() {
  return (
    <EasterEggProvider>
      <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
        {/* Hero */}
        <section className="relative flex min-h-screen flex-col items-center justify-center px-6 py-24 text-center">
          <div className="relative z-10 flex max-w-3xl flex-col items-center">
            <h1 className="animate-fade-up fade-d2 font-serif text-6xl font-bold leading-none sm:text-8xl">
              <span className="name-gradient">Pranav</span>
            </h1>
            <span className="name-gradient animate-fade-up fade-d3 my-3 font-serif text-3xl font-bold italic sm:text-4xl">
              &amp;
            </span>
            <h1 className="animate-fade-up fade-d3 font-serif text-6xl font-bold leading-none sm:text-8xl">
              <span className="name-gradient">Rithani</span>
            </h1>

            <LotusRowDivider className="animate-fade-up fade-d4 my-8" />

            <p className="animate-fade-up fade-d5 mb-4 mt-8 text-sm uppercase tracking-[0.35em] text-muted-foreground">
              Together with their families
            </p>
            <p className="animate-fade-up fade-d5 text-lg tracking-wide text-foreground/90 sm:text-xl">
              invite you to celebrate their wedding
            </p>
            <p className="animate-fade-up fade-d6 mt-2 font-serif text-2xl text-primary sm:text-3xl">
              Thursday, September 17, 2026
            </p>
            <p className="animate-fade-up fade-d6 mt-1 text-muted-foreground">
              Hindu Temple of Atlanta · Riverdale, GA
            </p>

            <a
              href="#rsvp"
              className="animate-fade-up fade-d7 mt-10 rounded-full bg-primary px-8 py-3.5 text-sm font-medium uppercase tracking-[0.15em] text-primary-foreground transition-opacity hover:opacity-90"
            >
              RSVP
            </a>
          </div>
          {/* hidden gem — long drives */}
          <div className="absolute bottom-4 left-5 z-10">
            <HiddenGem id="drives" />
          </div>
        </section>

        {/* Our Story */}
        <section className="relative overflow-hidden px-6 py-24">
          {/* the place it all clicked — Garden of the Gods, Colorado (hand-drawn sketch) */}
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <Image
              src="/garden-of-gods-sketch.webp"
              alt=""
              fill
              sizes="100vw"
              className="object-cover object-[35%_center] opacity-70 sm:object-center"
            />
            {/* balanced ivory wash — sketch is clearly visible, text stays readable */}
            <div className="absolute inset-0 bg-background/40" />
            <div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/25 to-background/85" />
          </div>
          <Reveal className="relative mx-auto max-w-3xl text-center">
            {/* invisible soft-edged fade — improves text readability without a visible box */}
            <div
              className="pointer-events-none absolute -inset-x-8 -inset-y-10 -z-10 blur-2xl"
              aria-hidden="true"
              style={{
                background:
                  "radial-gradient(ellipse at center, var(--background) 0%, var(--background) 45%, transparent 80%)",
              }}
            />
            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Our story</p>
            <h2 className="mt-3 font-serif text-4xl text-primary sm:text-5xl text-balance">Destiny</h2>
            <p className="mt-2 font-serif text-lg italic text-foreground/90">
              Two lives that began side by side, then travelled an ocean to finally meet.
            </p>
            <div className="mt-6 space-y-4 text-left font-medium leading-relaxed text-foreground">
              <p>
                They were born in the same city, barely twenty minutes apart. The same streets, the same chai stalls,
                the same suspiciously small radius. Destiny had them right there all along&mdash;looked at the perfect
                setup, and decided: not yet.
              </p>
              <p>
                So they grew up as near-misses. Neighbouring schools, the same crowded markets, almost certainly the
                same queue&mdash;politely ignoring each other with quiet, expert dedication. Twenty-five years of
                almost, and never quite.
              </p>
              <p>
                Then destiny, never one for the easy option, went spectacularly overboard: two suitcases, a small
                mountain of visa paperwork, one entire ocean&mdash;and an introduction thousands of miles from home
                that turned out to be roughly down the road from where they began.
              </p>
              <p>
                Their first date was meant to be a quick hour at the aquarium&mdash;polite, low stakes, easy to
                escape. Somehow one hour turned into an entire afternoon, the two of them lost in conversation beneath
                the slow blue light, never quite noticing the moment they stopped being strangers.
              </p>
              <p>
                And then Colorado. Somewhere among the red spires of the Garden of the Gods, with the whole sky
                stretched out around them, everything simply, unmistakably clicked&mdash;the moment they both look
                back on and call the beginning of forever.
              </p>
              <p className="font-serif text-xl italic text-accent text-pretty">
                Somewhere along that ridiculous, roundabout journey, they fell in love&mdash;and now they&apos;re
                getting married. They&apos;re as surprised as you are.
              </p>
              <p>
                Come celebrate two people who couldn&apos;t manage to find each other in one small city, now promising
                to find their way to each other for the rest of their lives.
              </p>
            </div>
          </Reveal>
        </section>

        {/* Countdown */}
        <section className="relative border-y border-border bg-card px-6 py-16">
          <Reveal className="mx-auto max-w-3xl text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Until we say &ldquo;I do&rdquo;</p>
            <h2 className="mb-8 mt-3 font-serif text-3xl text-foreground sm:text-4xl text-balance">
              September 17, 2026
            </h2>
            <Countdown />
          </Reveal>
        </section>

        {/* Details */}
        <section className="relative bg-background px-6 py-24">
          <div className="mx-auto max-w-5xl text-center">
            <Reveal>
              <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">The celebration</p>
              <h2 className="mt-3 font-serif text-4xl text-primary sm:text-5xl">When &amp; Where</h2>
              <LotusRowDivider className="my-8" />
            </Reveal>

            <div className="grid gap-6 text-left sm:grid-cols-2">
              <Reveal className="rounded-xl border border-border bg-card p-8 shadow-sm">
                <CalendarDays className="h-7 w-7 text-primary" aria-hidden="true" />
                <h3 className="mt-4 font-serif text-2xl text-foreground">The Date</h3>
                <p className="mt-2 leading-relaxed text-muted-foreground">Thursday, September 17, 2026</p>
                <p className="mt-3 flex items-center gap-2 text-sm text-foreground">
                  <Clock className="h-4 w-4 text-primary" aria-hidden="true" /> Ceremony begins at 9:00 AM
                </p>
              </Reveal>

              <Reveal delay={140} className="rounded-xl border border-border bg-card p-8 shadow-sm">
                <MapPin className="h-7 w-7 text-primary" aria-hidden="true" />
                <h3 className="mt-4 font-serif text-2xl text-foreground">The Venue</h3>
                <p className="mt-2 leading-relaxed text-muted-foreground">
                  Hindu Temple of Atlanta
                  <br />
                  Riverdale, Georgia
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <a
                    href="https://maps.google.com/?q=Hindu+Temple+of+Atlanta+Riverdale+GA"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-primary px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                  >
                    <MapPin className="h-4 w-4" aria-hidden="true" /> Google Maps
                  </a>
                  <a
                    href="https://maps.apple.com/?q=Hindu+Temple+of+Atlanta+Riverdale+GA"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-primary px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                  >
                    <MapPin className="h-4 w-4" aria-hidden="true" /> Apple Maps
                  </a>
                </div>
              </Reveal>
            </div>
          </div>
          {/* hidden gems — national parks & good food */}
          <div className="absolute right-5 top-24">
            <HiddenGem id="parks" />
          </div>
          <div className="absolute bottom-6 right-10">
            <HiddenGem id="food" />
          </div>
        </section>

        {/* Schedule */}
        <section className="relative border-y border-border bg-card px-6 py-24">
          <div className="mx-auto max-w-3xl">
            <Reveal className="text-center">
              <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Order of events</p>
              <h2 className="mt-3 font-serif text-4xl text-primary sm:text-5xl">Schedule of the Day</h2>
              <LotusRowDivider className="my-8" />
            </Reveal>

            <ol className="relative space-y-8 border-l border-border pl-8">
              {schedule.map((item, index) => {
                const Icon = item.icon
                return (
                  <Reveal as="li" key={item.title} delay={index * 120} className="relative">
                    <span className="absolute -left-[42px] flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background">
                      <Icon className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                    </span>
                    <p className="text-sm font-medium uppercase tracking-[0.15em] text-primary">{item.time}</p>
                    <h3 className="mt-1 font-serif text-2xl text-foreground">{item.title}</h3>
                    <p className="mt-1 leading-relaxed text-muted-foreground">{item.desc}</p>
                  </Reveal>
                )
              })}
            </ol>
          </div>
        </section>

        {/* RSVP */}
        <section id="rsvp" className="relative scroll-mt-8 bg-background px-6 py-24">
          <Reveal className="mx-auto max-w-xl text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Kindly respond</p>
            <h2 className="mt-3 font-serif text-4xl text-primary sm:text-5xl">RSVP</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              We would be delighted to celebrate with you.
            </p>
            <LotusRowDivider className="my-8" />
            <RsvpForm />
          </Reveal>
          {/* hidden gem — retail adventures */}
          <div className="absolute right-5 top-8">
            <HiddenGem id="shopping" />
          </div>
        </section>

        {/* Footer */}
        <footer className="relative border-t border-border px-6 py-16 text-center">
          <Reveal>
            <PrMonogram className="mx-auto text-primary" size={56} />
            <h2 className="name-gradient mt-5 font-serif text-4xl sm:text-5xl">Pranav &amp; Rithani</h2>
            <p className="mt-3 text-sm uppercase tracking-[0.3em] text-muted-foreground">
              September 17, 2026 · Riverdale, GA
            </p>
            <p className="mx-auto mt-6 max-w-md leading-relaxed text-muted-foreground">
              With love and gratitude, we look forward to sharing this joyous day with you.
            </p>
          </Reveal>
          {/* hidden gem — puppy love */}
          <div className="absolute bottom-5 left-5">
            <HiddenGem id="paws" />
          </div>
        </footer>
      </main>
    </EasterEggProvider>
  )
}
