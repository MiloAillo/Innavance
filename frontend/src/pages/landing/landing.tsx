import { useEffect, useRef, useState } from "react";
import type { JSX } from "react/jsx-runtime";
import { Link } from "react-router";
import { UserNavbar } from "../../components/user-navbar";
import {
  ArrowRight,
  Bell,
  Droplets,
  Lock,
  Phone,
  QrCode,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

const flow = [
  [
    ScanLine,
    "Scan your room QR code",
    "Opens reservation page for that specific room.",
  ],
  [
    Sparkles,
    "Confirm your stay",
    "Enter stay details and select any available add-ons.",
  ],
  [
    ShieldCheck,
    "Get in immediately",
    "Enter your room right away and pay after checkout.",
  ],
] as const;

const features = [
  [
    Lock,
    "Smart room access",
    "Access your room with door PIN after reservation approval.",
  ],
  [
    Zap,
    "Track your utilities",
    "Check electricity usage from your guest dashboard.",
  ],
  [Droplets, "Water usage", "Check water usage from your guest dashboard."],
  [Phone, "Staff help", "Request staff help through your dashboard."],
  [
    Sparkles,
    "Request add-ons",
    "Order available extras. Staff delivers them after booking approval.",
  ],
  [
    Bell,
    "Stay updated",
    "See booking and room notifications in your guest dashboard.",
  ],
] as const;

const reviews = [
  [
    "Innavance made my stay effortless. Booking, utilities, checkout is all in one place.",
    "Sarah",
    "3-month guest",
  ],
  [
    "The modern implementation like a smart door and a bunch of usage i can see is just not like anything else i have ever seen.",
    "Budi",
    "Business traveler",
  ],
  [
    "Staff came right to my room when I needed help. Quick and friendly.",
    "Dewi",
    "Weekend guest",
  ],
] as const;

export function Landing(): JSX.Element {
  const [navDark, setNavDark] = useState(true);
  const [heroInView, setHeroInView] = useState(true);
  const visibleDarkSections = useRef(new Set<Element>());

  useEffect(() => {
    const darkSections = document.querySelectorAll('[data-nav-theme="dark"]');
    const heroSection = document.querySelector("[data-hero]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target === heroSection) setHeroInView(entry.isIntersecting);
          if (entry.isIntersecting)
            visibleDarkSections.current.add(entry.target);
          else visibleDarkSections.current.delete(entry.target);
        });
        setNavDark(visibleDarkSections.current.size > 0);
      },
      { rootMargin: "-64px 0px -90% 0px", threshold: 0 },
    );

    darkSections.forEach((section) => observer.observe(section));
    if (heroSection) observer.observe(heroSection);
    return () => observer.disconnect();
  }, []);

  const handleHelpGridMove = (event: React.MouseEvent<HTMLElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty(
      "--cursor-x",
      `${event.clientX - bounds.left}px`,
    );
    event.currentTarget.style.setProperty(
      "--cursor-y",
      `${event.clientY - bounds.top}px`,
    );
    event.currentTarget.style.setProperty("--grid-opacity", "1");
  };

  return (
    <div className="min-h-screen bg-white font-[Inter] text-neutral-900">
      <UserNavbar heroInView={heroInView} dark={navDark}>
        <Link
          to="/login"
          className="rounded-full bg-green-500 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-400"
        >
          Login
        </Link>
      </UserNavbar>

      <main>
        <section
          data-hero
          data-nav-theme="dark"
          className="relative isolate flex min-h-[46rem] items-center overflow-hidden bg-neutral-900 px-5 pt-20 text-white"
        >
          <video
            src="https://videos.pexels.com/video-files/34954996/14806921_2560_1440_25fps.mp4"
            poster="/image1.webp"
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 -z-20 h-full w-full object-cover opacity-75"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/50 via-black/60 to-neutral-950/90" />
          <div className="absolute -right-20 top-28 -z-10 h-80 w-80 rounded-full bg-green-400/25 blur-3xl" />
          <div className="mx-auto grid w-full max-w-7xl gap-12 py-24 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="max-w-3xl">
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-green-300">
                Boarding house made easier
              </p>
              <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
                Welcome to Innavance
              </h1>
              <p className="mt-5 text-2xl font-medium text-neutral-100">
                Your stay, in your hands.
              </p>
              <p className="mt-4 max-w-xl text-lg leading-8 text-neutral-300">
                Book your room, manage your stay, and get help from staff in one
                place.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/bookings"
                  className="inline-flex items-center gap-2 rounded-md bg-green-500 px-5 py-3 font-semibold text-white transition-all duration-300 hover:scale-105 hover:bg-green-400 hover:shadow-lg hover:shadow-green-500/25"
                >
                  Browse rooms <ArrowRight size={18} />
                </Link>
                <Link
                  to="/login"
                  className="rounded-md border border-white/35 bg-white/10 px-5 py-3 font-semibold text-white transition-all duration-300 hover:scale-105 hover:bg-white/20 hover:border-white/50"
                >
                  Login
                </Link>
              </div>
              <p className="mt-6 flex items-center gap-2 text-sm text-neutral-300">
                <QrCode size={18} />
                Scan the QR code displayed outside each rooms to book.
              </p>
            </div>
            <div className="hidden justify-center lg:flex">
              <div className="group w-full max-w-sm rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur transition-all duration-300 hover:-translate-y-2 hover:border-green-300/50 hover:bg-white/15 hover:shadow-2xl hover:shadow-green-400/15">
                <ScanLine
                  size={42}
                  className="text-green-300 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                />
                <p className="mt-12 text-2xl font-semibold">
                  A smarter way to stay.
                </p>
                <p className="mt-3 leading-7 text-neutral-300">
                  Room access, utility tracking, staff support, and
                  self-checkout work together from your guest dashboard.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-5 py-24">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold text-green-600">
                How it works
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Getting started is simple
              </h2>
            </div>
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {flow.map(([Icon, title, copy], index) => (
                <article
                  key={title}
                  className="group rounded-xl border border-neutral-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-green-300 hover:shadow-xl"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-md bg-neutral-900 text-sm font-bold text-white transition-colors duration-300 group-hover:bg-green-500">
                    0{index + 1}
                  </span>
                  <Icon
                    className="mt-8 text-green-600 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                    size={28}
                  />
                  <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                  <p className="mt-2 leading-7 text-neutral-600">{copy}</p>
                </article>
              ))}
            </div>
            <p className="mt-6 text-sm text-neutral-500">
              Approval timing depends on boarding-house settings.
            </p>
          </div>
        </section>

        <section
          data-nav-theme="dark"
          className="relative isolate overflow-hidden bg-neutral-900 px-5 py-24 text-white"
        >
          <video
            src="https://videos.pexels.com/video-files/7239172/7239172-uhd_2560_1440_25fps.mp4"
            poster="/image1.webp"
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 -z-20 h-full w-full object-cover opacity-75"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/50 via-black/60 to-neutral-950/90" />
          <div className="absolute -right-20 top-28 -z-10 h-80 w-80 rounded-full bg-green-400/25 blur-3xl" />
          <div className="mx-auto max-w-7xl">
            <div className="flex max-w-2xl flex-col gap-3">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Everything for your stay
              </h2>
              <p className="leading-7 text-neutral-300">
                Practical room tools, clear information, and staff support when
                you need it.
              </p>
            </div>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map(([Icon, title, copy]) => (
                <article
                  key={title}
                  className="group rounded-xl border border-white/15 bg-white/10 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-green-300/50 hover:bg-white/15 hover:shadow-2xl hover:shadow-green-400/10"
                >
                  <Icon
                    className="text-green-300 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                    size={26}
                  />
                  <h3 className="mt-5 text-lg font-semibold text-white">
                    {title}
                  </h3>
                  <p className="mt-2 leading-7 text-neutral-300">{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-24">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <p className="text-sm font-semibold text-green-600">
                Guest stories
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                What our guests say
              </h2>
            </div>
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {reviews.map(([quote, name, stay]) => (
                <figure
                  key={name}
                  className="group flex flex-col rounded-xl border border-neutral-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-green-300 hover:shadow-xl"
                >
                  <blockquote className="text-lg leading-8 text-neutral-700 transition-colors duration-300 group-hover:text-neutral-900">
                    “{quote}”
                  </blockquote>
                  <figcaption className="mt-8 border-t border-neutral-200 pt-4">
                    <p className="font-semibold">{name}</p>
                    <p className="text-sm text-neutral-500">{stay}</p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section data-nav-theme="dark" className="px-5 py-24">
          <div className="mx-auto grid max-w-7xl overflow-hidden rounded-2xl bg-neutral-900 text-white lg:grid-cols-2">
            <div className="p-8 sm:p-12">
              <p className="text-sm font-semibold text-green-300">
                Easy checkout
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight">
                Checkout on your schedule
              </h2>
              <p className="mt-5 max-w-lg leading-8 text-neutral-300">
                Check out from your guest dashboard when you are ready. Your
                room gets a grace period before door PIN resets.
              </p>
              <p className="mt-5 text-sm text-neutral-400">
                Staff can help with checkout and room access when needed.
              </p>
            </div>
            <div className="relative flex min-h-64 items-center justify-center overflow-hidden p-8">
              <img
                src="/image1.webp"
                alt=""
                className="absolute inset-0 -z-20 h-full w-full object-cover opacity-60"
              />
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-green-600/40 to-black/70" />
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-green-400/30 blur-2xl" />
              <div className="group relative w-full max-w-sm rounded-2xl border border-white/20 bg-white/15 p-8 shadow-2xl backdrop-blur-md transition-all duration-300 hover:scale-[1.03] hover:border-green-300/50 hover:bg-white/20">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 transition-transform duration-300 group-hover:rotate-3 group-hover:scale-110">
                  <Lock size={32} className="text-green-300" />
                </div>
                <p className="mt-6 text-sm text-neutral-300">Guest dashboard</p>
                <p className="mt-1 text-2xl font-semibold">
                  Checkout when ready
                </p>
                <div className="mt-5 flex items-center gap-2 text-sm text-neutral-300">
                  <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                  Grace period active
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          className="relative isolate min-h-[36rem] overflow-hidden border-t border-neutral-200 bg-white px-5 py-24"
          onMouseMove={handleHelpGridMove}
          onMouseLeave={(event) =>
            event.currentTarget.style.setProperty("--grid-opacity", "0")
          }
          style={{
            ["--cursor-x" as string]: "50%",
            ["--cursor-y" as string]: "50%",
            ["--grid-opacity" as string]: "0",
          }}
        >
          <div className="absolute inset-0 -z-20 bg-[linear-gradient(to_right,#f5f5f5_1px,transparent_1px),linear-gradient(to_bottom,#f5f5f5_1px,transparent_1px)] bg-[size:3rem_3rem]" />
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,#bbf7d0_1px,transparent_1px),linear-gradient(to_bottom,#bbf7d0_1px,transparent_1px)] bg-[size:2.1rem_2.1rem] opacity-[var(--grid-opacity)] transition-opacity duration-200 [mask-image:radial-gradient(circle_180px_at_var(--cursor-x)_var(--cursor-y),black_0%,rgba(0,0,0,0.9)_35%,transparent_75%)]" />
          <div
            className="pointer-events-none absolute -z-10 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-200/30 blur-2xl opacity-[var(--grid-opacity)] transition-opacity duration-200"
            style={{ left: "var(--cursor-x)", top: "var(--cursor-y)" }}
          />
          <div className="absolute -left-32 top-1/2 -z-10 h-96 w-96 -translate-y-1/2 rounded-full bg-green-100/70 blur-3xl" />
          <p className="pointer-events-none absolute -right-10 top-1/2 -z-10 -translate-y-1/2 text-[18rem] font-bold leading-none tracking-tighter text-neutral-100">
            HELP
          </p>
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_0.8fr] lg:items-center">
            <div className="max-w-xl">
              <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
                Need help?
              </h2>
              <p className="mt-6 text-lg leading-8 text-neutral-600">
                Contact boarding-house staff for booking, payment, room, or
                checkout assistance.
              </p>
                        <a 
                            href="https://wa.me/6285643525546" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors font-semibold"
                        >
                            Contact admin
                        </a>
            </div>
            <div className="relative mx-auto flex h-72 w-full max-w-md items-center justify-center">
              <div className="absolute h-64 w-64 rounded-full border border-green-200 transition-all duration-500 hover:h-72 hover:w-72 hover:border-green-300" />
              <div className="absolute h-48 w-48 rounded-full border border-green-300/70 transition-all duration-500 hover:h-56 hover:w-56" />
              <div className="absolute h-32 w-32 rounded-full bg-green-100 transition-all duration-500 hover:h-36 hover:w-36 hover:bg-green-200" />
              <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-neutral-900 text-white shadow-2xl transition-transform duration-300 hover:scale-110 hover:rotate-3">
                <Phone size={40} />
              </div>
              <div className="absolute bottom-3 right-0 rounded-full border border-green-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-lg">
                <span className="mr-2 inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                Staff support
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer
        className="bg-neutral-900 px-5 py-10 text-neutral-300"
        data-nav-theme="dark"
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <img src="/logo.svg" alt="Innavance" className="h-10" />
            <p className="mt-3 text-sm text-neutral-400">
              Boarding house made easier.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
            <Link to="/login" className="hover:text-white">
              Login
            </Link>
            <Link to="/bookings" className="hover:text-white">
              Browse rooms
            </Link>
            <a
              href="https://wa.me/6285643525546"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white"
            >
              Admin contact
            </a>
            <Link to="/rules" className="hover:text-white">
              Room rules
            </Link>
            <Link to="/faq" className="hover:text-white">
              FAQ
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
