import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Booking from "./pages/Booking";
import BookingSummary from "./pages/BookingSummary";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Contact from "./pages/Contact";
import PublicBlog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import ClientDashboard from "./pages/ClientDashboard";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Services from "./pages/admin/Services";
import Schedule from "./pages/admin/Schedule";
import Bookings from "./pages/admin/Bookings";
import Clients from "./pages/admin/Clients";
import Messages from "./pages/admin/Messages";
import Payments from "./pages/admin/Payments";
import Blog from "./pages/admin/Blog";
import Testimonials from "./pages/admin/Testimonials";
import Gallery from "./pages/admin/Gallery";
import Stats from "./pages/admin/Stats";
import Settings from "./pages/admin/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/reservation" element={<Booking />} />
            <Route path="/booking-summary/:bookingId" element={<BookingSummary />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/blog" element={<PublicBlog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            
            {/* Route Espace client - Protégée */}
            <Route path="/account" element={
              <ProtectedRoute>
                <ClientDashboard />
              </ProtectedRoute>
            } />
            
            {/* Routes Admin - Protégées */}
            <Route path="/admin" element={
              <ProtectedRoute requireAdmin>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="services" element={<Services />} />
              <Route path="schedule" element={<Schedule />} />
              <Route path="bookings" element={<Bookings />} />
              <Route path="clients" element={<Clients />} />
              <Route path="messages" element={<Messages />} />
              <Route path="payments" element={<Payments />} />
              <Route path="blog" element={<Blog />} />
              <Route path="testimonials" element={<Testimonials />} />
              <Route path="gallery" element={<Gallery />} />
              <Route path="stats" element={<Stats />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
