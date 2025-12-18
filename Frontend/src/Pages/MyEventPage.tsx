import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { eventAPI } from "../services/api";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import EventCard from "../components/events/EventCard";
import type { Event } from "../types";

export default function MyEventsPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await eventAPI.getMyEvents();
        setEvents(response.data);
      } catch (error) {
        toast.error("Failed to load events");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleDelete = async (eventId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this event? This action cannot be undone and will permanently delete the event and all associated registrations."
    );
    if (!confirmed) return;

    try {
      await eventAPI.deleteEvent(eventId);
      toast.success("Event deleted successfully");
      setEvents(events.filter((e) => e._id !== eventId));
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete event");
    }
  };

  const handleEventClick = (eventId: string) => {
    navigate(`/my-events/${eventId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12 sm:pb-16 md:pb-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">My Events</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Manage your created events</p>
          </div>
        </div>
        {events.length === 0 ? (
          <Card className="p-8 sm:p-12 text-center">
            <div className="max-w-md mx-auto space-y-4">
              <div className="text-4xl sm:text-6xl mb-4">📅</div>
              <h2 className="text-xl sm:text-2xl font-bold">No events yet</h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Create your first event and start managing attendees
              </p>
              <Button asChild className="gap-2 w-full sm:w-auto flex-1  font-semibold
                border border-purple-500 bg-purple-600/90 
              hover:bg-purple-600 hover:scale-[1.02]
                transition-all duration-300
                shadow-lg shadow-purple-500/20 active:scale-95 cursor-pointer">
                <Link to="/create-event">
                  <Plus className="w-4 h-4" />
                  Create Your First Event
                </Link>
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {events.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                action="event"
                onClick={() => handleEventClick(event._id)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

