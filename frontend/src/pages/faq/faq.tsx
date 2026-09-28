import { useState } from "react";
import type { JSX } from "react/jsx-runtime";
import { Link } from "react-router";
import { ArrowLeft, ChevronDown, HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "How is Innavance different from regular boarding houses?",
    answer:
      "Innavance modernizes the boarding house experience with technology. Our staff handles booking and payment at the front desk, then you receive instant room access via smart door locks with PIN codes - no physical keys needed. All rooms feature IoT monitoring through a unified web interface where you can track utilities, call staff for assistance, and manage your stay entirely from your dashboard.",
  },
  {
    question: "How do I book a room?",
    answer:
      "Visit the front desk in our building. Our staff will show you available rooms and help you choose the best option. Once you've selected a room, staff will create your booking, process your payment immediately, and send you a WhatsApp message with your room access PIN and guest dashboard login details.",
  },
  {
    question: "When do I pay for my stay?",
    answer:
      "Payment is made immediately at the front desk when staff creates your booking. You pay upfront before receiving your room access PIN and dashboard credentials.",
  },
  {
    question: "How do I access my room?",
    answer:
      "Your room uses a smart door lock - no physical keys needed. After staff creates your booking, you'll receive a PIN code and account ID via WhatsApp. Use the PIN to unlock your smart door, and use the account ID to access your guest dashboard where you can monitor your room and manage your stay.",
  },
  {
    question: "What utilities can I track?",
    answer:
      "Your guest dashboard shows real-time electricity and water usage for your room. This helps you monitor consumption during your stay.",
  },
  {
    question: "How do I request add-ons or call staff?",
    answer:
      "Add-ons like extra bedding or cleaning supplies are selected when staff creates your booking at the front desk. Once checked in, you can call staff directly through your guest dashboard if you need assistance or have any issues.",
  },
  {
    question: "How does checkout work?",
    answer:
      "You can self-checkout from the guest dashboard when you're ready to leave. After checkout, your room enters a grace period before the door PIN resets, giving you time to pack and leave.",
  },
  {
    question: "What happens if I forget to checkout?",
    answer:
      "If you do not checkout yourself, staff can initiate a forced checkout. Depending on whether anyone is still in the room, the system may apply a grace period or reset the room immediately.",
  },
  {
    question: "Can I extend my stay?",
    answer:
      "Yes, but extensions are subject to room availability. Contact staff or request an extension through the guest dashboard before your current booking ends. Payment for the extension will be processed at the front desk.",
  },
  {
    question: "What should I do if I lose my PIN or account access?",
    answer:
      "Contact boarding-house staff immediately. They can verify your identity and restore your access. Do not share your PIN or account credentials with anyone.",
  },
  {
    question: "Are visitors allowed?",
    answer:
      "Visitors are permitted in common areas only and must leave by 21:00. Overnight visitors are not allowed without prior staff approval.",
  },
] as const;

export function FAQ(): JSX.Element {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white font-[Inter] text-neutral-900">
      <header className="fixed top-0 z-50 w-full border-b border-neutral-200/80 bg-white/75 px-5 py-3 backdrop-blur-md">
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

      <main className="mx-auto max-w-3xl px-5 pt-28 pb-20">
        <div className="mb-12 text-center">
          <p className="text-sm font-semibold text-green-600">Help center</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Frequently asked questions
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-neutral-600">
            Everything you need to know about booking, staying, and checking out
            at Innavance.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {faqs.map(({ question, answer }, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={question}
                className={`rounded-xl border transition-all duration-300 ${
                  isOpen
                    ? "border-green-300 bg-green-50/50 shadow-md"
                    : "border-neutral-200 bg-white shadow-sm hover:border-green-200 hover:shadow-md"
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center gap-4 px-6 py-5 text-left"
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors duration-300 ${
                      isOpen
                        ? "bg-green-500 text-white"
                        : "bg-neutral-100 text-neutral-600"
                    }`}
                  >
                    <HelpCircle size={18} />
                  </span>
                  <span className="flex-1 font-semibold">{question}</span>
                  <ChevronDown
                    size={20}
                    className={`shrink-0 text-neutral-400 transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-green-600" : ""
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isOpen ? "max-h-96" : "max-h-0"
                  }`}
                >
                  <p className="px-6 pb-5 pl-18 leading-7 text-neutral-600">
                    {answer}
                  </p>
                </div>
              </div>
            );
          })}
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
            <Link to="/rules" className="hover:text-white">
              Room rules
            </Link>
            <a href="https://wa.me/6285643525546" target="_blank" rel="noopener noreferrer" className="hover:text-white">Admin contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
