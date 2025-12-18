import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Share2,
  Ticket,
  ExternalLink,
  Loader2,
  CheckCircle,
  UserCircle, 
  ShieldCheck,
  SlidersHorizontal
} from "lucide-react";
import { eventAPI } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { getCategoryIcon, getCategoryLabel } from "../lib/data";
import RegisterModal from "../components/events/RegisterModal";
import type { Event, Registration } from "../types";
import { motion } from "framer-motion";

function darkenColor(color: string, amount: number) {
  const colorWithoutHash = color.replace("#", "");
  const num = parseInt(colorWithoutHash, 16);
  const r = Math.max(0, (num >> 16) - amount * 255);
  const g = Math.max(0, ((num >> 8) & 0x00ff) - amount * 255);
  const b = Math.max(0, (num & 0x0000ff) - amount * 255);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

export default function EventDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!slug) return;
      try {
        const response = await eventAPI.getEventBySlug(slug);
        const eventData = response.data;
        setEvent(eventData);

        // Check if user is registered
        if (user) {
          try {
            const regResponse = await eventAPI.checkRegistration(eventData._id);
            // API returns { registered: boolean, registration: Registration | null }
            // only store the actual registration object (or null) so checks like
            // `if (registration)` work correctly.
            setRegistration(regResponse.data.registration ?? null);
          } catch (error) {
            // User not registered or API error, that's okay
            setRegistration(null);
          }
        }
      } catch (error: any) {
        toast.error("Failed to load event");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [slug, user]);

  // Update CSS variables when event theme color changes
  useEffect(() => {
    if (containerRef.current && event?.themeColor) {
      const themeColor = event.themeColor;
      containerRef.current.style.setProperty("--event-theme-color", themeColor);
      containerRef.current.style.setProperty("--event-theme-color-dark", darkenColor(themeColor, 0.04));
    }
  }, [event?.themeColor]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: event?.title,
          text: event?.description.slice(0, 100) + "...",
          url: url,
        });
      } catch (error) {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleRegister = () => {
    if (!user) {
      toast.error("Please sign in to register");
      navigate("/sign-in");
      return;
    }
    setShowRegisterModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Event not found</h1>
          <Button onClick={() => navigate("/explore")}>Back to Explore</Button>
        </div>
      </div>
    );
  }

  const startDate = typeof event.startDate === "string" 
    ? new Date(event.startDate) 
    : new Date(event.startDate as number);
  const endDate = typeof event.endDate === "string"
    ? new Date(event.endDate)
    : new Date(event.endDate as number);

  const isEventFull = event.registrationCount >= event.capacity;
  const isEventPast = endDate.getTime() < Date.now();
  const organizerName = typeof event.organizer === "object"
    ? event.organizer.name
    : event.organizerName || "Organizer";
  const isOrganizer = user && (typeof event.organizer === "object"
    ? event.organizer._id === user._id
    : event.organizer === user._id);

  return (
    <div
  ref={containerRef}
  className="min-h-screen py-4 sm:py-6 md:py-8 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 transition-colors duration-300"
>
  {/* Animated Background Elements */}
  <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
    <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
    <div className="absolute top-40 right-20 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
    <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
  </div>

  <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 relative z-10">

    {/* Event Title & Info */}
    <div className="mb-8">
      <Badge variant="secondary" className="mb-3">
        {getCategoryIcon(event.category)} {getCategoryLabel(event.category)}
      </Badge>
      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">{event.title}</h1>
      <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          <span>{format(startDate, "EEEE, MMMM dd, yyyy")}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          <span>
            {format(startDate, "h:mm a")} - {format(endDate, "h:mm a")}
          </span>
        </div>
      </div>
    </div>

    {/* Hero Image */}
    {event.coverImage && (
      <div className="relative h-[250px] sm:h-[300px] md:h-[400px] rounded-xl sm:rounded-2xl overflow-hidden mb-6 sm:mb-8 shadow-2xl border border-purple-500/20">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
        <img
          src={event.coverImage}
          alt={event.title}
          className="w-full h-full object-cover"
        />
      </div>
    )}

    {/* Main Grid */}
    <div className="grid grid-cols-1 md:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px] gap-6 md:gap-8">

      {/* Left Content */}
      <div className="space-y-8 w-full">

        {/* About Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="relative overflow-hidden rounded-2xl border-2 border-purple-500/30 backdrop-blur-xl bg-gradient-to-tr from-purple-900/70 via-gray-800/50 to-purple-900/70 shadow-2xl hover:shadow-purple-700/50 transition-shadow duration-500 w-full">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-purple-500 animate-pulse" />
                About This Event
              </h2>
              <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">{event.description}</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Location Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <Card className="relative overflow-hidden rounded-2xl border-2 border-green-500/30 backdrop-blur-xl bg-gradient-to-tr from-green-900/70 via-gray-800/50 to-green-900/70 shadow-2xl hover:shadow-green-700/50 transition-shadow duration-500 w-full">
            <CardContent className="pt-6 space-y-3">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-green-500 animate-pulse" />
                Location
              </h2>
              <p className="font-medium">{event.city}, {event.state || event.country}</p>
              {event.address && <p className="text-sm text-gray-400">{event.address}</p>}
              {event.venue && (
                <Button className="flex items-center gap-2 w-full justify-center hover:scale-105 hover:shadow-lg transition-all duration-300 bg-gray-800/70 text-white">
                  <a href={event.venue} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                    View on Map <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Organizer Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
          <Card className="relative overflow-hidden rounded-2xl border-2 border-purple-500/30 backdrop-blur-xl bg-gradient-to-tr from-purple-900/70 via-gray-800/50 to-purple-900/70 shadow-2xl hover:shadow-purple-700/50 transition-shadow duration-500 w-full">
            <CardContent className="pt-6 flex flex-col gap-3">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <UserCircle className="w-6 h-6 text-purple-500 animate-pulse" />
                Organizer
              </h2>
              <div className="flex items-center gap-3">
                <motion.div className="w-12 h-12" whileHover={{ scale: 1.1, rotate: 5 }} transition={{ type: "spring", stiffness: 300 }}>
                  <Avatar className="w-12 h-12 border-2 border-purple-500 bg-gray-700">
                    <AvatarFallback>{organizerName.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </motion.div>
                <div>
                  <p className="font-semibold">{organizerName}</p>
                  <p className="text-sm text-gray-400">Event Organizer</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

      </div>

      {/* Right Sidebar - Registration */}
      <div className="lg:sticky lg:top-24 h-fit w-full space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }}>
          <Card className="relative overflow-hidden rounded-2xl border-2 border-purple-500/30 backdrop-blur-xl bg-gradient-to-tr from-purple-900/70 via-gray-800/50 to-purple-900/70 shadow-2xl hover:shadow-purple-700/50 transition-shadow duration-500 w-full">
            <CardContent className="p-6 space-y-4">

              {/* Price */}
              <div>
                <p className="text-sm text-gray-400 mb-1">Price</p>
                <p className="text-3xl font-bold">{event.ticketType === "free" ? "Free" : `₹${event.ticketPrice}`}</p>
                {event.ticketType === "paid" && <p className="text-xs text-gray-400 mt-1">Pay at event offline</p>}
              </div>
              <Separator />

              {/* Stats */}
              <div className="space-y-3 text-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">Attendees</span>
                  </div>
                  <p className="font-semibold">{event.registrationCount} / {event.capacity}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Date</span>
                  </div>
                  <p className="font-semibold text-sm">{format(startDate, "MMM dd")}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Time</span>
                  </div>
                  <p className="font-semibold text-sm">{format(startDate, "h:mm a")}</p>
                </div>
              </div>
              <Separator />

              {/* Registration Button */}
              {registration ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg animate-pulse">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">You're registered!</span>
                  </div>
                  <Button className="w-full gap-2 cursor-pointer bg-purple-600 hover:bg-purple-700 transition-transform duration-300 hover:scale-105" onClick={() => navigate("/my-tickets")}>
                    <Ticket className="w-4 h-4" /> View Ticket
                  </Button>
                </div>
              ) : isEventPast ? (
                <Button className="w-full" disabled>Event Ended</Button>
              ) : isEventFull ? (
                <Button className="w-full" disabled>Event Full</Button>
              ) : isOrganizer ? (
                <Button className="w-full cursor-pointer bg-gray-900 hover:bg-gray-800 transition-transform duration-300 hover:scale-105" onClick={() => navigate(`/my-events/${event._id}`)}>
                  <SlidersHorizontal /> Manage Event
                </Button>
              ) : (
                <Button className="w-full gap-2 cursor-pointer bg-purple-600 hover:bg-purple-700 transition-transform duration-300 hover:scale-105" onClick={handleRegister}>
                  <Ticket className="w-4 h-4" /> Register for Event
                </Button>
              )}

              {/* Share Button */}
              <Button variant="outline" className="w-full gap-2 bg-gray-800 hover:bg-gray-900 cursor-pointer transition-transform duration-300 hover:scale-105">
                <Share2 className="w-4 h-4" /> Share Event
              </Button>

            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  </div>

  {/* Register Modal */}
  {showRegisterModal && event && (
    <RegisterModal
      event={event}
      isOpen={showRegisterModal}
      onClose={() => setShowRegisterModal(false)}
    />
  )}
</div>

  );
}

