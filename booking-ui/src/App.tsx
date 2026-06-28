import { Routes, Route } from 'react-router-dom'
import { EventsPage } from './pages/EventsPage'
import { EventDetailPage } from './pages/EventDetailPage'
import { BookingPage } from './pages/BookingPage'
import { AdminEventsPage } from './pages/AdminEventsPage'
import { AdminBookingsPage } from './pages/AdminBookingsPage'
import { Navigation } from './components/shared/Navigation'

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto py-8 px-4">
        <Routes>
          <Route path="/" element={<EventsPage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="/bookings/:id" element={<BookingPage />} />
          <Route path="/admin/events" element={<AdminEventsPage />} />
          <Route path="/admin/bookings" element={<AdminBookingsPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App