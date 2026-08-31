import { useEffect, useState } from "react";
import type { JSX } from "react/jsx-runtime";
import {
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Loader2,
  QrCode,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { getRoomList } from "../../API/rooms-api";
import type { RoomListResponse } from "../../types/room-list.type";
import { SiteFooter } from "../../components/site-footer";
import { UserNavbar } from "../../components/user-navbar";

export function RoomList(): JSX.Element {
  const [rooms, setRooms] = useState<RoomListResponse>();
  const [page, setPage] = useState(1);
  const [retry, setRetry] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [sortBy, setSortBy] = useState<"name" | "price" | "capacity">("name");
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const navigate = useNavigate();

  useEffect(() => {
    getRoomList({ page, limit: 12, order_by: sortBy, order })
      .then(setRooms)
      .catch(() => setHasError(true))
      .finally(() => setIsLoading(false));
  }, [page, retry, sortBy, order]);

  const loadPage = (nextPage: number) => {
    setIsLoading(true);
    setHasError(false);
    setPage(nextPage);
  };

  return (
    <section className="flex min-h-screen w-screen flex-col bg-neutral-100 font-[Inter] text-neutral-800">
      <UserNavbar />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-5 pb-10 pt-24 md:pb-14">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 30, mass: 1 }}
          className="mb-5"
        >
          <p className="font-semibold text-xl text-neutral-800">
            Choose a room
          </p>
          <p className="mt-1 text-sm text-neutral-600">
            Select any room to view details and reserve. You can also scan its
            QR code to open it directly.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="flex items-center gap-2 rounded-lg bg-white px-8 py-4 shadow">
              <Loader2 className="animate-spin" />
              <p className="font-semibold">Fetching rooms available...</p>
            </div>
          </div>
        ) : hasError ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="flex max-w-md flex-col items-center gap-3 rounded-lg bg-white px-8 py-6 text-center shadow">
              <CircleAlert className="text-red-500" size={32} />
              <div>
                <p className="font-semibold text-xl">Rooms unavailable</p>
                <p className="mt-1 text-sm text-neutral-600">
                  Please try again or contact staff for help.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsLoading(true);
                  setHasError(false);
                  setRetry((current) => current + 1);
                }}
                className="rounded-md bg-red-500 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-600"
              >
                Try again
              </button>
            </div>
          </div>
        ) : rooms?.data.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="rounded-lg bg-white px-8 py-6 text-center shadow">
              <p className="font-semibold text-xl">No rooms found</p>
              <p className="mt-1 text-sm text-neutral-600">
                Please contact staff for availability.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as "name" | "price" | "capacity");
                  setPage(1);
                }}
                className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm"
              >
                <option value="name">Name</option>
                <option value="price">Price</option>
                <option value="capacity">Capacity</option>
              </select>
              <select
                value={order}
                onChange={(e) => {
                  setOrder(e.target.value as "asc" | "desc");
                  setPage(1);
                }}
                className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm"
              >
                {sortBy === "price" ? (
                  <>
                    <option value="asc">Lowest first</option>
                    <option value="desc">Highest first</option>
                  </>
                ) : (
                  <>
                    <option value="asc">A–Z</option>
                    <option value="desc">Z–A</option>
                  </>
                )}
              </select>
            </div>

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                mass: 1,
                delay: 0.1,
              }}
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {rooms?.data.map((room) => (
                <div
                  key={room.id}
                  className="flex min-h-48 flex-col rounded-lg bg-white p-5 shadow"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xl font-semibold">{room.name}</p>
                    <span
                      className={`flex items-center gap-1.5 rounded-sm border px-2 py-1 text-sm font-medium ${room.isAvailable ? "border-green-500 bg-green-100 text-green-600" : "border-red-500 bg-red-100 text-red-600"}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${room.isAvailable ? "bg-green-500" : "bg-red-500"}`}
                      />
                      {room.isAvailable ? "available" : "not available"}
                    </span>
                  </div>
                  <div className="my-5 h-px w-full bg-neutral-300" />
                  <div className="flex flex-1 flex-col gap-2">
                    <span className="flex w-fit items-center gap-1 rounded-sm bg-neutral-700 px-2 py-1 text-sm font-medium text-white">
                      <Users size={15} />
                      {room.capacity}{" "}
                      {room.capacity === 1 ? "person" : "people"} max
                    </span>
                    <p className="line-clamp-2 text-sm text-neutral-600">
                      {room.description}
                    </p>
                  </div>
                  <div className="mt-5 flex items-end justify-between">
                    <div>
                      <p className="text-sm">Price starts from</p>
                      <p className="text-xl font-bold">
                        Rp.{room.price.toLocaleString("id-ID")}
                        <span className="text-base font-normal">/day</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/qr-codes/${room.id}`)}
                        className="rounded-md border border-green-400 bg-white p-2 text-green-600 transition-colors hover:bg-green-50"
                        aria-label="View QR code"
                      >
                        <QrCode size={20} />
                      </button>
                      <button
                        onClick={() => navigate(`/bookings/${room.id}`)}
                        className="rounded-md bg-green-400 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-500"
                      >
                        View room
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>

            {rooms?.meta &&
              (rooms.meta.has_page_before || rooms.meta.has_page_after) && (
                <nav
                  aria-label="Room pages"
                  className="mt-6 flex items-center justify-center gap-3"
                >
                  <button
                    disabled={!rooms.meta.has_page_before}
                    onClick={() => loadPage(page - 1)}
                    className="flex items-center gap-1 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </button>
                  <span className="text-sm font-medium text-neutral-500">
                    Page {rooms.meta.page} of {rooms.meta.page_end}
                  </span>
                  <button
                    disabled={!rooms.meta.has_page_after}
                    onClick={() => loadPage(page + 1)}
                    className="flex items-center gap-1 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </nav>
              )}
          </>
        )}
      </main>

      <SiteFooter />
    </section>
  );
}
