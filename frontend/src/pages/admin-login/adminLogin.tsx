import { useState } from "react";
import type { JSX } from "react/jsx-runtime";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2Icon } from "lucide-react";
import { adminLogin } from "../../API/admin-auth-api";
import { SiteFooter } from "../../components/site-footer";
import { UserNavbar } from "../../components/user-navbar";

export function AdminLogin(): JSX.Element {
  const [state, setState] = useState<"MAIN" | "SIGNING_IN" | "LOGIN_ERROR">(
    "MAIN",
  );
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleSignIn = async () => {
    if (!username || !password) return;

    setState("SIGNING_IN");
    try {
      const response = await adminLogin({ username, password });

      localStorage.setItem("adminActiveToken", response.activeToken);
      localStorage.setItem("adminRefreshToken", response.refreshToken);

      window.location.href = "/admin/dashboard";
    } catch (error) {
      console.error("Admin login failed:", error);
      setTimeout(() => setState("LOGIN_ERROR"), 300);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && username && password) {
      handleSignIn();
    }
  };

  const FRAMER_ANIMATION = {
    initial: { x: 30, opacity: 0 },
    animate: { x: 0, opacity: 1, transition: { delay: 0.4 } },
    exit: { x: -30, opacity: 0 },
    transition: { type: "spring", stiffness: 300, damping: 30, mass: 2 },
  } as const;

  const SIGNING_IN_UI = state === "SIGNING_IN" && (
    <motion.div
      key="SIGNING_IN_UI"
      className="flex flex-col items-center gap-2"
      {...FRAMER_ANIMATION}
    >
      <Loader2Icon className="animate-spin" size={30} />
      <p className="text-base font-semibold">Signing in...</p>
    </motion.div>
  );

  const LOGIN_ERROR_UI = state === "LOGIN_ERROR" && (
    <motion.div
      key="LOGIN_ERROR_UI"
      className="flex flex-col gap-4"
      {...FRAMER_ANIMATION}
    >
      <div className="flex flex-col items-center gap-2">
        <p className="font-semibold text-xl text-red-600">Sign In Failed</p>
        <p className="text-center text-sm">
          Invalid username or password. Please check your credentials and try
          again.
        </p>
      </div>
      <motion.button
        whileHover={{ scale: 0.98 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setState("MAIN")}
        className="w-full bg-red-500 hover:bg-red-400 py-3 rounded-xl font-semibold text-white transition-opacity"
      >
        Try Again
      </motion.button>
    </motion.div>
  );

  const MAIN_UI = state === "MAIN" && (
    <motion.div
      key="MAIN_UI"
      className="flex flex-col gap-5"
      {...FRAMER_ANIMATION}
    >
      <div className="flex flex-col items-center gap-1">
        <p className="font-semibold text-xl text-neutral-600">
          Admin Dashboard Sign In
        </p>
        <p className="text-center text-sm">
          Authorized personnel only. Please sign in to manage Innavance.
        </p>
      </div>
      <div className="flex flex-col gap-3">
        {/* username input */}
        <fieldset className="relative w-full h-14 border border-neutral-600 rounded-xl flex items-center px-2 ">
          <legend className="px-2">Username</legend>
          <input
            className="focus:outline-0 w-full h-full bg-transparent -translate-y-0.5"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </fieldset>
        {/* password input */}
        <fieldset className="relative w-full h-14 border border-neutral-600 rounded-xl flex items-center px-2 ">
          <legend className="px-2">Password</legend>
          <input
            type="password"
            className="focus:outline-0 w-full h-full bg-transparent -translate-y-0.5"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </fieldset>
      </div>
      <motion.button
        whileHover={{ scale: 0.98 }}
        whileTap={{ scale: 0.96 }}
        disabled={!username || !password}
        onClick={handleSignIn}
        className="w-full bg-green-500 hover:bg-green-400 py-3 rounded-xl font-semibold text-white mt-2 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
      >
        Sign In
      </motion.button>
    </motion.div>
  );

  return (
    <section className="flex min-h-screen w-screen flex-col overflow-hidden bg-neutral-100">
      <UserNavbar />
      <div className="flex flex-1 items-center justify-center">
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 300, damping: 30, mass: 2 }}
          className="mx-10 flex items-center justify-center rounded-lg bg-white px-5 py-4 shadow"
        >
          <AnimatePresence mode="popLayout">
            {SIGNING_IN_UI}
            {LOGIN_ERROR_UI}
            {MAIN_UI}
          </AnimatePresence>
        </motion.div>
      </div>
      <SiteFooter />
    </section>
  );
}
