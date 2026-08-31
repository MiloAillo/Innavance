import type { JSX } from "react/jsx-runtime";
import { ShieldCheck, UserRound } from "lucide-react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { SiteFooter } from "../../components/site-footer";
import { UserNavbar } from "../../components/user-navbar";

export function LoginSelection(): JSX.Element {
  return (
    <section className="flex min-h-screen w-screen flex-col overflow-hidden bg-neutral-100 font-[Inter]">
      <UserNavbar />

      <div className="flex flex-1 items-center justify-center">
        <motion.main
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 30, mass: 2 }}
          className="mx-7 flex w-full max-w-md flex-col gap-5 rounded-lg bg-white px-5 py-6 shadow md:mx-10"
        >
          <div className="text-center">
            <h1 className="text-xl font-semibold text-neutral-600">
              Sign in to Innavance
            </h1>
            <p className="mt-1 text-sm text-neutral-600">
              Choose access type to continue.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Link
              to="/login/user"
              className="group flex items-center gap-4 rounded-lg border border-neutral-200 p-4 transition-colors hover:border-green-400 hover:bg-green-50 focus:outline-2 focus:outline-offset-2 focus:outline-green-500"
            >
              <span className="rounded-md bg-green-100 p-3 text-green-600">
                <UserRound size={24} />
              </span>
              <span className="flex-1">
                <span className="block font-semibold text-neutral-800">
                  Guest
                </span>
                <span className="mt-0.5 block text-sm text-neutral-600">
                  Access your room dashboard.
                </span>
              </span>
              <span className="text-sm font-semibold text-green-600 group-hover:text-green-500">
                Continue
              </span>
            </Link>
            <Link
              to="/login/admin"
              className="group flex items-center gap-4 rounded-lg border border-neutral-200 p-4 transition-colors hover:border-neutral-400 hover:bg-neutral-50 focus:outline-2 focus:outline-offset-2 focus:outline-neutral-700"
            >
              <span className="rounded-md bg-neutral-200 p-3 text-neutral-700">
                <ShieldCheck size={24} />
              </span>
              <span className="flex-1">
                <span className="block font-semibold text-neutral-800">
                  Staff
                </span>
                <span className="mt-0.5 block text-sm text-neutral-600">
                  Manage rooms and reservations.
                </span>
              </span>
              <span className="text-sm font-semibold text-neutral-700 group-hover:text-neutral-900">
                Continue
              </span>
            </Link>
          </div>
        </motion.main>
      </div>

      <SiteFooter />
    </section>
  );
}
