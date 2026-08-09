import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router'
import { Bookings } from './pages/bookings/booking'
import "@fontsource/inter"
import { ApprovalStatus } from './pages/approval-status/approvalStatus'

const browserRouter = createBrowserRouter([
  { path: "bookings/:id", element: <Bookings /> },
  { path: "status/:id", element: <ApprovalStatus /> }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={browserRouter} ></RouterProvider>
  </StrictMode>,
)
