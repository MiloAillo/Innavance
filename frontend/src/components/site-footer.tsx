import { Link } from "react-router";

export function SiteFooter() {
  return (
    <footer className="mt-auto w-full self-stretch bg-neutral-900 px-5 py-10 text-neutral-300">
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
  );
}
