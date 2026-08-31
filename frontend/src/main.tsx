import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router";
import { Bookings } from "./pages/bookings/booking";
import { RoomList } from "./pages/room-list/roomList";
import { LoginSelection } from "./pages/login-selection/loginSelection";
import { Landing } from "./pages/landing/landing";
import { Rules } from "./pages/rules/rules";
import { FAQ } from "./pages/faq/faq";
import "@fontsource/inter";
import { ApprovalStatus } from "./pages/approval-status/approvalStatus";
import { UserLogin } from "./pages/user-login/userLogin";
import { AdminLogin } from "./pages/admin-login/adminLogin";
import { UserDashboard } from "./pages/user-dashboard/userDashboard";
import { AdminDashboard } from "./pages/admin-dashboard/adminDashboard";
import { userDashboardLoader } from "./API/loader/user-dashboard-loader";
import { QRCode } from "./pages/qr-code/qrCode";

const browserRouter = createBrowserRouter([
  { path: "/", element: <Landing /> },
  { path: "rules", element: <Rules /> },
  { path: "faq", element: <FAQ /> },
  { path: "bookings", element: <RoomList /> },
  { path: "bookings/:id", element: <Bookings /> },
  { path: "qr-codes/:roomId", element: <QRCode /> },
  { path: "status/:id", element: <ApprovalStatus /> },
  { path: "login", element: <LoginSelection /> },
  { path: "login/user", element: <UserLogin /> },
  { path: "login/admin", element: <AdminLogin /> },
  {
    path: "dashboard",
    element: <UserDashboard />,
    loader: userDashboardLoader,
  },
  { path: "admin/dashboard", element: <AdminDashboard /> },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={browserRouter}></RouterProvider>
  </StrictMode>,
);
