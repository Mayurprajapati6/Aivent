import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, MapPin, ArrowRight, Loader2 } from "lucide-react";
import { eventAPI } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { parseLocationSlug, createLocationSlug } from "../lib/location-utils";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { CATEGORIES } from "../lib/data";
import EventCard from "../components/events/EventCard";
import type { Event } from "../types";

export default function ExplorePage() {
  const { slug } = useParams<{ slug?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>(
    {}
  );

  // category / location parsing
  const categoryInfo = CATEGORIES.find((cat) => cat.id === slug);
  const isCategory = !!categoryInfo;

  const { city, state } = !isCategory && slug
    ? parseLocationSlug(slug)
    : { city: null, state: null };

  // ---------------- FETCH EVENTS ----------------
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        let response;

        if (isCategory) {
          response = await eventAPI.getEvents({ category: slug, limit: 50 });
        } else if (city && state) {
          response = await eventAPI.getEvents({ city, limit: 50 });
        } else {
          response = await eventAPI.getEvents({ limit: 50 });
        }

        setEvents(response.data);
      } catch (err) {
        console.error("Failed to fetch events", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [slug, isCategory, city, state]);

  // ---------------- CATEGORY COUNTS ----------------
  useEffect(() => {
    const counts: Record<string, number> = {};
    events.forEach((e) => {
      counts[e.category] = (counts[e.category] || 0) + 1;
    });
    setCategoryCounts(counts);
  }, [events]);

  const categoriesWithCounts = CATEGORIES.map((cat) => ({
    ...cat,
    count: categoryCounts[cat.id] || 0,
  }));

  // =================================================
  // 🔥 CORE EVENT LOGIC (SINGLE SOURCE OF TRUTH)
  // =================================================

  const now = Date.now();

  // 1. Remove expired events
  const upcomingEvents = events.filter(
    (e) => new Date(e.startDate).getTime() >= now
  );

  // 2. Sort by soonest date
  const sortedUpcomingEvents = [...upcomingEvents].sort(
    (a, b) =>
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  // ---------------- EVENTS NEAR YOU ----------------
  const nearestEvents = sortedUpcomingEvents
    .filter((e) => {
      const userCity = user?.location?.city?.toLowerCase();
      const userState = user?.location?.state?.toLowerCase();

      if (!userCity && !userState) return false;

      return (
        (userCity && e.city?.toLowerCase() === userCity) ||
        (userState && e.state?.toLowerCase() === userState)
      );
    })
    .slice(0, 12);

  // ---------------- EVENTS YOU MIGHT LIKE ----------------
  const interestedEvents =
    user?.interests && user.interests.length > 0
      ? sortedUpcomingEvents
          .filter((e) => user.interests!.includes(e.category))
          .slice(0, 12)
      : [];

  // ---------------- POPULAR EVENTS ----------------
  const popularEvents = [...sortedUpcomingEvents]
    .sort((a, b) => b.registrationCount - a.registrationCount)
    .slice(0, 6);

  // ---------------- HANDLERS ----------------
  const handleEventClick = (slug: string) => {
    navigate(`/events/${slug}`);
  };

  const handleCategoryClick = (id: string) => {
    navigate(`/explore/${id}`);
  };

  const handleViewLocalEvents = () => {
    const userCity = user?.location?.city || "Anand";
    const userState = user?.location?.state || "Gujarat";
    const locationSlug = createLocationSlug(userCity, userState);
    navigate(`/explore/${locationSlug}`);
  };

  // =================================================
  // 🟣 CATEGORY VIEW
  // =================================================
  if (isCategory && slug) {
    return (
      <div className="pb-16 min-h-screen">
        <div className="max-w-7xl mx-auto px-6">
          <div className="pb-6 flex items-center gap-4">
            <div className="text-6xl">{categoryInfo.icon}</div>
            <div>
              <h1 className="text-5xl font-bold">{categoryInfo.label}</h1>
              <p className="text-muted-foreground">
                {categoryInfo.description}
              </p>
            </div>
          </div>

          {loading ? (
            <Loader2 className="animate-spin mx-auto text-purple-500" />
          ) : upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedUpcomingEvents.map((e) => (
                <EventCard
                  key={e._id}
                  event={e}
                  onClick={() => handleEventClick(e.slug)}
                />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No upcoming events.</p>
          )}
        </div>
      </div>
    );
  }

  // =================================================
  // 🟢 MAIN EXPLORE PAGE
  // =================================================
  return (
    <div className="pb-16 min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* TITLE */}
        <div className="text-center py-10">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-orange-400 bg-clip-text text-transparent">
            Discover Events
          </h1>
          <p className="text-gray-400 mt-3">
            Find events near you, based on interests, or trending across India
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          </div>
        ) : (
          <>
            {/* EVENTS NEAR YOU */}
            <Section
              title="Events near you"
              subtitle={`Based on your location (${user?.location?.city || "India"})`}
              action={
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 border-purple-500/50 hover:bg-purple-500/10 w-full sm:w-auto cursor-pointer"
                  onClick={handleViewLocalEvents}
                >
                  View all nearby <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              }
              events={nearestEvents}
              onClick={handleEventClick}
            />

            {/* EVENTS YOU MIGHT LIKE */}
            {interestedEvents.length > 0 && (
              <Section
                title="Events you might like"
                subtitle="Based on your interests"
                events={interestedEvents}
                onClick={handleEventClick}
              />
            )}

            {/* POPULAR EVENTS */}
            <Section
              title="Popular Across India"
              subtitle="Trending events nationwide"
              events={popularEvents}
              onClick={handleEventClick}
            />

            {/* BROWSE BY CATEGORY */}
            <div className="mt-16">
              <h2 className="text-3xl font-bold mb-4">Browse by Category</h2>
              <div className="flex gap-4 overflow-x-auto scrollbar-hide">
                {categoriesWithCounts.map((cat) => (
                  <Card
                    key={cat.id}
                    className="min-w-[180px] cursor-pointer hover:scale-105 transition"
                    onClick={() => handleCategoryClick(cat.id)}
                  >
                    <CardContent className="text-center py-6">
                      <div className="text-4xl">{cat.icon}</div>
                      <p className="mt-2 font-semibold">{cat.label}</p>
                      <p className="text-sm text-gray-400">
                        {cat.count} events
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ===================== */
/* 🧩 REUSABLE SECTION */
/* ===================== */
function Section({
  title,
  subtitle,
  events,
  onClick,
  action,
}: {
  title: string;
  subtitle: string;
  events: Event[];
  onClick: (slug: string) => void;
  action?: React.ReactNode;
}) {
  if (events.length === 0) return null;

  return (
    <div className="mb-16">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h2 className="text-3xl font-bold">{title}</h2>
          <p className="text-gray-400">{subtitle}</p>
        </div>
        {action}
      </div>

      <div className="flex gap-6 overflow-x-auto scrollbar-hide">
        {events.map((e) => (
          <div key={e._id} className="min-w-[300px]">
            <EventCard event={e} onClick={() => onClick(e.slug)} />
          </div>
        ))}
      </div>
    </div>
  );
}

