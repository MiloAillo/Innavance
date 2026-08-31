import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router'
import { Bookings } from './pages/bookings/booking'
import "@fontsource/inter"
import { ApprovalStatus } from './pages/approval-status/approvalStatus'
import { UserLogin } from './pages/user-login/userLogin'
import { UserDashboard } from './pages/user-dashboard/userDashboard'
import { userDashboardLoader } from './API/loader/user-dashboard-loader'

const browserRouter = createBrowserRouter([
  { path: "bookings/:id", element: <Bookings /> },
  { path: "status/:id", element: <ApprovalStatus /> },
  { path: "login/user", element: <UserLogin /> },
  { path: "dashboard", element: <UserDashboard />, loader: userDashboardLoader }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={browserRouter} ></RouterProvider>
  </StrictMode>,
)
