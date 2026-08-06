import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router'
import { Bookings } from './pages/bookings/booking'
import "@fontsource/inter"

const browserRouter = createBrowserRouter([
  { path: "bookings/:id", element: <Bookings /> }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={browserRouter} ></RouterProvider>
  </StrictMode>,
)
