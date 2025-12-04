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
            setRegistration(regResponse.data);
          } catch (error) {
            // User not registered, that's okay
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

        <div className="grid lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px] gap-6 md:gap-8">
          {/* Main Content */}
          <div className="space-y-8 max-w-7xl mx-auto bg-background/90 backdrop-blur-xl border border-purple-500/20 rounded-2xl sm:rounded-3xl shadow-2xl px-4 sm:px-6 md:px-10 py-6 sm:py-8 md:py-10 space-y-6 sm:space-y-8 md:space-y-10">
            {/* Description */}
            <Card
              className="pt-0 event-card-themed bg-slate-900/80 backdrop-blur-xl border-purple-500/20 shadow-xl "
            >
              <CardContent className="pt-6 ">
                <h2 className="text-2xl font-bold mb-4 text-white">About This Event</h2>
                <p className="text-gray-300 whitespace-pre-wrap leading-relaxed ">
                  {event.description}
                </p>
              </CardContent>
            </Card>

            {/* Location Details */}
            <Card
              className="pt-0 event-card-themed"
            >
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <MapPin className="w-6 h-6 text-purple-500" />
                  Location
                </h2>
                <div className="space-y-3">
                  <p className="font-medium">
                    {event.city}, {event.state || event.country}
                  </p>
                  {event.address && (
                    <p className="text-sm text-muted-foreground">{event.address}</p>
                  )}
                  {event.venue && (
                    <Button variant="outline" asChild className="gap-2">
                      <a href={event.venue} target="_blank" rel="noopener noreferrer">
                        View on Map
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Organizer Info */}
            <Card
              className="pt-0 event-card-themed"
            >
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold mb-4">Organizer</h2>
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback>{organizerName.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{organizerName}</p>
                    <p className="text-sm text-muted-foreground">Event Organizer</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Registration Card */}
          <div className="lg:sticky lg:top-24 h-fit ">
            <Card
              className="overflow-hidden py-0 event-card-themed "
            >
              <CardContent className="p-6 space-y-4 ">
                {/* Price */}
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Price</p>
                  <p className="text-3xl font-bold">
                    {event.ticketType === "free" ? "Free" : `₹${event.ticketPrice}`}
                  </p>
                  {event.ticketType === "paid" && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Pay at event offline
                    </p>
                  )}
                </div>
                <Separator />

                {/* Stats */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">Attendees</span>
                    </div>
                    <p className="font-semibold">
                      {event.registrationCount} / {event.capacity}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">Date</span>
                    </div>
                    <p className="font-semibold text-sm">{format(startDate, "MMM dd")}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
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
                    <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">You're registered!</span>
                    </div>
                    <Button
                      className="w-full gap-2 cursor-pointer"
                      onClick={() => navigate("/my-tickets")}
                    >
                      <Ticket className="w-4 h-4" />
                      View Ticket
                    </Button>
                  </div>
                ) : isEventPast ? (
                  <Button className="w-full" disabled>
                    Event Ended
                  </Button>
                ) : isEventFull ? (
                  <Button className="w-full" disabled>
                    Event Full
                  </Button>
                ) : isOrganizer ? (
                  <Button
                    className="w-full cursor-pointer"
                    onClick={() => navigate(`/my-events/${event._id}`)}
                  >
                    Manage Event
                  </Button>
                ) : (
                  <Button className="w-full gap-2 cursor-pointer" onClick={handleRegister}>
                    <Ticket className="w-4 h-4" />
                    Register for Event
                  </Button>
                )}

                {/* Share Button */}
                <Button variant="outline" className="w-full gap-2 cursor-pointer" onClick={handleShare}>
                  <Share2 className="w-4 h-4" />
                  Share Event
                </Button>
              </CardContent>
            </Card>
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

