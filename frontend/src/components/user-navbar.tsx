import type { ReactNode } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";

interface UserNavbarProps {
  heroInView?: boolean;
  dark?: boolean;
  children?: ReactNode;
}

export function UserNavbar({
  heroInView = false,
  dark = false,
  children,
}: UserNavbarProps) {
  return (
    <motion.header
      animate={
        heroInView
          ? {
              top: 20,
              left: "50%",
              x: "-50%",
              width: "min(calc(100% - 3rem), 64rem)",
              borderRadius: 20,
              backgroundColor: "rgba(255, 255, 255, 0.12)",
              borderColor: "rgba(255, 255, 255, 0.25)",
              padding: "0.75rem 1.5rem",
            }
          : {
              top: 0,
              left: "0%",
              x: "0%",
              width: "100%",
              borderRadius: 0,
              backgroundColor: dark
                ? "rgba(23, 23, 23, 0.88)"
                : "rgba(255, 255, 255, 0.82)",
              borderColor: dark
                ? "rgba(255, 255, 255, 0.15)"
                : "rgba(229, 229, 229, 0.8)",
              padding: "0.75rem 1.25rem",
            }
      }
      transition={{ type: "spring", stiffness: 260, damping: 28, mass: 0.8 }}
      className="fixed z-50 border shadow-lg backdrop-blur-md"
    >
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between"
        aria-label="Main navigation"
      >
        <Link to="/" aria-label="Innavance home">
          <img src="/logo.svg" alt="Innavance" className="h-8" />
        </Link>
        {children}
      </nav>
    </motion.header>
  );
}
