import { useEffect, useState } from "react";
import { useParams } from "react-router";
import type { JSX } from "react/jsx-runtime";
import { getBookingDetail } from "../../API/bookings-api";
import type { BookingDetail } from "../../types/booking-detail.type";
import { Loader2Icon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SiteFooter } from "../../components/site-footer";
import { UserNavbar } from "../../components/user-navbar";

export function ApprovalStatus(): JSX.Element {
  const [state, setState] = useState<
    "FETCH_STATUS" | "NO_STATUS" | "STATUS_FETCHED"
  >("FETCH_STATUS");
  const [bookingData, setBookingData] = useState<BookingDetail>();
  const [countdown, setCountdown] = useState<string>("");
  const booking_id = useParams().id;

  useEffect(() => {
    if (!booking_id) {
      setState("NO_STATUS");
      return;
    }

    if (state === "FETCH_STATUS") {
      getBookingDetail(booking_id)
        .then((data) => {
          console.log("Booking data:", data);
          setBookingData(data);
          setTimeout(() => setState("STATUS_FETCHED"), 300);
        })
        .catch((error) => {
          console.error("Failed to fetch booking:", error);
          setTimeout(() => setState("NO_STATUS"), 300);
        });
    }
  }, [state]);

  useEffect(() => {
    if (!bookingData?.is_auto_approve || bookingData.status !== "on_hold") {
      return;
    }

    const updateCountdown = () => {
      const createdAt = new Date(bookingData.created_at).getTime();
      const autoApproveMinutes = bookingData.auto_approve_time;
      const targetTime = createdAt + autoApproveMinutes * 60 * 1000;
      const now = Date.now();
      const remainingMs = targetTime - now;

      if (remainingMs <= 0) {
        setCountdown("00:00");
        setTimeout(() => {
          setState("FETCH_STATUS");
        }, 1000);
        return;
      }

      const totalSeconds = Math.floor(remainingMs / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;

      setCountdown(
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`,
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [bookingData]);

  const FRAMER_ANIMATION = {
    initial: { x: 30, opacity: 0 },
    animate: { x: 0, opacity: 1, transition: { delay: 0.4 } },
    exit: { x: -30, opacity: 0 },
    transition: { type: "spring", stiffness: 300, damping: 30, mass: 2 },
  } as const;

  const FETCH_STATUS_UI = state === "FETCH_STATUS" && (
    <motion.div
      key="FETCH_STATUS_UI"
      className="flex flex-col items-center gap-2"
      {...FRAMER_ANIMATION}
    >
      <Loader2Icon className="animate-spin" size={30} />
      <p className="text-base font-semibold">Fetching booking detail...</p>
    </motion.div>
  );

  const NO_STATUS_UI = state === "NO_STATUS" && (
    <motion.div key="NO_STATUS_UI" {...FRAMER_ANIMATION}>
      <p className="font-semibold text-center">
        Hmm... We can't find this specific booking detail. If you think this is
        a mistake, please contact our staff.
      </p>
    </motion.div>
  );

  const STATUS_FETCHED_UI = state === "STATUS_FETCHED" && (
    <motion.div
      key="STATUS_FETCHED_UI"
      className="flex flex-col gap-2"
      {...FRAMER_ANIMATION}
    >
      <p className="font-medium text-xl text-black/65">
        {bookingData?.room_name} Approval Status
      </p>
      <div className="flex flex-col md:flex-row gap-10 md:gap-0">
        <div className="flex-1">
          {/* status */}
          {(bookingData?.status === "checked_in" ||
            bookingData?.status === "checking_out") && (
            <p className="font-semibold text-2xl text-green-500">Approved</p>
          )}
          {bookingData?.status === "checked_out" && (
            <p className="font-semibold text-2xl text-stone-500">Checked Out</p>
          )}
          {bookingData?.status === "on_hold" && (
            <p className="font-semibold text-2xl text-orange-500">
              Waiting for Approval
            </p>
          )}
          {bookingData?.status === "rejected" && (
            <p className="font-semibold text-2xl text-red-500">Rejected</p>
          )}
          {/* auto approve countdown if existed */}
          {bookingData?.is_auto_approve &&
            bookingData.status === "on_hold" &&
            countdown && (
              <p className="font-normal text-lg">Auto approve in {countdown}</p>
            )}
          {/* notice */}
          {bookingData?.status === "on_hold" && (
            <p className="text-sm pt-3">
              Once reviewed, we will contact your phone number. Make sure to
              check for incoming messages.
            </p>
          )}
          {(bookingData?.status === "checked_in" ||
            bookingData?.status === "checking_out") && (
            <p className="text-sm pt-3">
              We have sent you the door PIN and the account ID for you to enter
              the room dashboard.
            </p>
          )}
          {bookingData?.status === "rejected" && (
            <p className="text-sm pt-3">
              You may speak with our staff for a solution. Until then, you
              should not retry to reserve another room.
            </p>
          )}
        </div>
        <div className="flex-1 text-end flex flex-col items-end">
          <div className="flex flex-col gap-1">
            <p className="font-medium text-sm text-neutral-500">Price</p>
            <p className="">{bookingData?.price}</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="font-medium text-sm text-neutral-500">
              Payment Method
            </p>
            <p className="">{bookingData?.payment_method}</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="font-medium text-sm text-neutral-500">Phone Number</p>
            <p className="text-sm">{bookingData?.phone_number}</p>
          </div>
          <div className="w-max flex flex-col gap-1 pt-7">
            <div className="h-0.5 bg-neutral-500/50" />
            <p className="font-medium text-base text-neutral-500 pt-1">
              Full Name
            </p>
            <p className="text-xl">{bookingData?.name}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <section className="flex min-h-screen w-screen flex-col bg-neutral-100 font-[Inter] text-neutral-800">
      <UserNavbar />

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-5 pb-10 pt-24 md:pb-14 justify-center items-center gap-5">
        <motion.div
          layout
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
            mass: 2,
          }}
          className="relative z-1 h-fit flex flex-col bg-white shadow-md rounded-xl w-full px-5 py-4"
        >
          <AnimatePresence mode="popLayout">
            {FETCH_STATUS_UI}
            {STATUS_FETCHED_UI}
            {NO_STATUS_UI}
          </AnimatePresence>
        </motion.div>

        <p className="font-semibold text-neutral-500">
          go to the{" "}
          <a
            onClick={() => (window.location.href = `/login/user`)}
            className="text-blue-500 underline cursor-pointer"
          >
            dashboard login page
          </a>
        </p>
      </main>

      <SiteFooter />
    </section>
  );
}
