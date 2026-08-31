import type { JSX } from "react/jsx-runtime";
import { Link, useSearchParams } from "react-router";
import {
  ArrowLeft,
  Clock,
  Droplets,
  KeyRound,
  Lock,
  Sparkles,
  VolumeX,
} from "lucide-react";

const rules = [
  {
    icon: KeyRound,
    title: "Check-in & access",
    items: [
      "Room access is granted via smart door PIN immediately after booking.",
      "Your PIN and account ID will be sent to your phone via WhatsApp right after you complete your booking.",
      "Do not share your PIN or account credentials with anyone.",
      "If you lose access, contact staff immediately through the guest dashboard.",
    ],
  },
  {
    icon: Lock,
    title: "Security & safety",
    items: [
      "Lock your door whenever you leave the room.",
      "The boarding house is not responsible for lost valuables; please secure your belongings.",
      "Report any suspicious activity or security concerns to staff right away.",
      "Fire exits and emergency routes must remain clear at all times.",
    ],
  },
  {
    icon: VolumeX,
    title: "Noise & conduct",
    items: [
      "Quiet hours are from 22:00 to 07:00. Keep noise to a minimum during this period.",
      "Respect other guests. No loud music, parties, or disruptive behavior.",
      "Visitors are only allowed in common areas and must leave by 21:00.",
      "Smoking is strictly prohibited inside all rooms and indoor areas.",
    ],
  },
  {
    icon: Droplets,
    title: "Utilities & facilities",
    items: [
      "Conserve water and electricity. Turn off lights and air conditioning when leaving.",
      "Utility usage is tracked per room and visible on your guest dashboard in real-time.",
      "Do not tamper with electrical wiring, water meters, or smart door systems.",
      "Report any facility issues through the dashboard or contact staff directly.",
    ],
  },
  {
    icon: Sparkles,
    title: "Cleanliness & maintenance",
    items: [
      "Keep your room tidy. Basic cleaning supplies are available upon request.",
      "Dispose of trash in designated bins. Do not leave food waste in the room overnight.",
      "Damage caused by negligence may result in additional charges.",
      "Staff may enter rooms for maintenance or emergencies with prior notice when possible.",
    ],
  },
  {
    icon: Clock,
    title: "Checkout & extensions",
    items: [
      "You can self-checkout anytime from the guest dashboard before your booking period ends.",
      "A grace period applies after checkout before your PIN is reset and door access is removed.",
      "After checkout, come to the front desk to complete your payment before leaving.",
      "Extensions are subject to room availability and must be arranged before your current booking ends.",
      "Overstaying without extension may result in forced checkout and additional charges.",
    ],
  },
] as const;

export function Rules(): JSX.Element {
  const [searchParams] = useSearchParams();
  const fromBooking = searchParams.get("from") === "booking";

  return (
    <div className="min-h-screen bg-white font-[Inter] text-neutral-900">
      <header className="fixed top-0 z-50 w-full border-b border-neutral-200/80 bg-white/75 backdrop-blur-md px-5 py-3">
        <nav
          className="mx-auto flex max-w-7xl items-center justify-between"
          aria-label="Main navigation"
        >
          <Link to="/" aria-label="Innavance home">
            <img src="/logo.svg" alt="Innavance" className="h-8" />
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-100"
          >
            <ArrowLeft size={18} />
            Back to home
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-4xl px-5 pt-28 pb-20">
        {fromBooking && (
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 mb-6">
            <p className="text-sm text-blue-800">
              📋 Reading from booking flow? Close this tab when done to return to your reservation.
            </p>
          </div>
        )}
        
        <div className="mb-12">
          <p className="text-sm font-semibold text-green-600">House policies</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Room rules
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-neutral-600">
            These rules keep the boarding house safe, clean, and comfortable for
            everyone. By staying here, you agree to follow them.
          </p>
        </div>

        <div className="flex flex-col gap-10">
          {rules.map(({ icon: Icon, title, items }) => (
            <section key={title}>
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-green-100 text-green-600">
                  <Icon size={20} />
                </span>
                <h2 className="text-xl font-semibold">{title}</h2>
              </div>
              <ul className="ml-13 flex flex-col gap-3">
                {items.map((item) => (
                  <li
                    key={item}
                    className="relative pl-6 text-neutral-700 before:absolute before:left-0 before:top-2.5 before:h-1.5 before:w-1.5 before:rounded-full before:bg-green-500"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="mt-16 rounded-xl border border-neutral-200 bg-neutral-50 p-6">
          <p className="font-semibold text-neutral-800">
            Questions or concerns?
          </p>
          <p className="mt-2 text-neutral-600">
            Contact boarding-house staff through the guest dashboard or speak
            with the front desk.
          </p>
        </div>
      </main>

      <footer className="bg-neutral-900 px-5 py-10 text-neutral-300">
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
            <Link to="/faq" className="hover:text-white">
              FAQ
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
