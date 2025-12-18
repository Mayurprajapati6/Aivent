import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, MapPin, Users, ArrowRight, Loader2 } from "lucide-react";
import { format } from "date-fns";
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
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});

  // Check if it's a category or location
  const categoryInfo = CATEGORIES.find((cat) => cat.id === slug);
  const isCategory = !!categoryInfo;
  const { city, state, isValid } = !isCategory && slug
    ? parseLocationSlug(slug)
    : { city: null, state: null, isValid: true };

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
          // Main explore page - show featured and local events
          response = await eventAPI.getEvents({ limit: 20 });
        }
        setEvents(response.data);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [slug, isCategory, city, state]);

  useEffect(() => {
    // Calculate category counts
    const counts: Record<string, number> = {};
    events.forEach((event) => {
      counts[event.category] = (counts[event.category] || 0) + 1;
    });
    setCategoryCounts(counts);
  }, [events]);

  const handleEventClick = (eventSlug: string) => {
    navigate(`/events/${eventSlug}`);
  };

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/explore/${categoryId}`);
  };

  const handleViewLocalEvents = () => {
    const userCity = user?.location?.city || "Anand";
    const userState = user?.location?.state || "Gujarat";
    const locationSlug = createLocationSlug(userCity, userState);
    navigate(`/explore/${locationSlug}`);
  };

  const categoriesWithCounts = CATEGORIES.map((cat) => ({
    ...cat,
    count: categoryCounts[cat.id] || 0,
  }));

  // Category View
  if (isCategory && slug) {
    return (
      <div className="pb-16 min-h-screen">
        <div className="max-w-7xl mx-auto px-6">
          <div className="pb-5">
            <div className="flex items-center gap-4 mb-4">
              <div className="text-6xl">{categoryInfo.icon}</div>
              <div>
                <h1 className="text-5xl md:text-6xl font-bold">{categoryInfo.label}</h1>
                <p className="text-lg text-muted-foreground mt-2">{categoryInfo.description}</p>
              </div>
            </div>
            {events.length > 0 && (
              <p className="text-muted-foreground">
                {events.length} event{events.length !== 1 ? "s" : ""} found
              </p>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
          ) : events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <EventCard
                  key={event._id}
                  event={event}
                  onClick={() => handleEventClick(event.slug)}
                />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No events found in this category.</p>
          )}
        </div>
      </div>
    );
  }

  // Location View
  if (city && state) {
    return (
      <div className="pb-16 min-h-screen">
        <div className="max-w-7xl mx-auto px-6">
          <div className="pb-5">
            <div className="flex items-center gap-4 mb-4">
              <div className="text-6xl">📍</div>
              <div>
                <h1 className="text-5xl md:text-6xl font-bold">Events in {city}</h1>
                <p className="text-lg text-muted-foreground mt-2">{state}, India</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="gap-2">
                <MapPin className="w-3 h-3" />
                {city}, {state}
              </Badge>
              {events.length > 0 && (
                <p className="text-muted-foreground">
                  {events.length} event{events.length !== 1 ? "s" : ""} found
                </p>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
          ) : events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <EventCard
                  key={event._id}
                  event={event}
                  onClick={() => handleEventClick(event.slug)}
                />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No events in {city}, {state} yet.</p>
          )}
        </div>
      </div>
    );
  }

  // Main Explore Page
  const featuredEvents = events.slice(0, 3);

  const now = Date.now();
  const sortBySoonest = (list: Event[]) =>
    [...list].sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );

  // Nearest events (upcoming) based on user city/state
  const nearestEvents = sortBySoonest(
    events.filter((e) => {
      const userCity = user?.location?.city;
      const userState = user?.location?.state;

      if (!userCity && !userState) return false;

      const cityMatch =
        userCity &&
        e.city &&
        e.city.toLowerCase() === userCity.toLowerCase();
      const stateMatch =
        userState &&
        e.state &&
        e.state.toLowerCase() === userState.toLowerCase();

      const upcoming = new Date(e.startDate).getTime() >= now;

      return (cityMatch || stateMatch) && upcoming;
    })
  ).slice(0, 12);

  // Events matching user's interests
  const interestedEvents =
    user?.interests && user.interests.length > 0
      ? sortBySoonest(
          events.filter(
            (e) =>
              user.interests!.includes(e.category) &&
              new Date(e.startDate).getTime() >= now
          )
        )
      : [];

  const localEvents = events
    .filter(
      (e) =>
        e.city.toLowerCase() ===
        (user?.location?.city || "gurugram").toLowerCase()
    )
    .slice(0, 4);
  const popularEvents = sortBySoonest(
    [...events].sort((a, b) => b.registrationCount - a.registrationCount)
  ).slice(0, 6);

  return (
    <div className="pb-12 sm:pb-16 min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Hero Title */}
        <div className="pb-8 sm:pb-12 text-center pt-4 sm:pt-6 md:pt-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-purple-400 to-orange-400 bg-clip-text text-transparent px-4">
            Discover Events
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-300 max-w-3xl mx-auto px-4">
            Explore featured events, find what's happening locally, or browse events across India
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          </div>
        ) : (
          <>
            {/* Featured Events - Carousel */}
            {featuredEvents.length > 0 && (
              <div className="mb-10 sm:mb-12 md:mb-16">
                <div className="mb-4 sm:mb-6 px-2">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Featured Events</h2>
                  <p className="text-sm sm:text-base text-gray-400">Handpicked events you don't want to miss</p>
                </div>
                <div className="relative">
                  <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-purple-600/60 scrollbar-track-transparent scroll-smooth px-2">
                    {featuredEvents.map((event) => (
                      <div
                        key={event._id}
                        className="min-w-[280px] sm:min-w-[300px] max-w-[320px] flex-shrink-0 transform hover:scale-105 transition-transform duration-300"
                      >
                        <EventCard
                          event={event}
                          onClick={() => handleEventClick(event.slug)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Nearest Events Carousel */}
            <div className="mb-10 sm:mb-12 md:mb-16">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 px-2 gap-3 sm:gap-0">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold mb-1">Events near you</h2>
                  <p className="text-sm sm:text-base text-gray-400">
                    Based on your location{" "}
                    {user?.location?.city && user?.location?.state
                      ? `(${user.location.city}, ${user.location.state})`
                      : "(update your city to get better suggestions)"}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 border-purple-500/50 hover:bg-purple-500/10 w-full sm:w-auto cursor-pointer"
                  onClick={handleViewLocalEvents}
                
                >
                  View all nearby <ArrowRight className="w-4 h-4" />
                </Button>
              </div>

              {nearestEvents.length > 0 ? (
                <div className="relative">
                  <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-purple-600/60 scrollbar-track-transparent scroll-smooth px-2">
                    {nearestEvents.map((event) => (
                      <div
                        key={event._id}
                        className="min-w-[260px] sm:min-w-[280px] max-w-[300px] flex-shrink-0 transform hover:scale-105 transition-transform duration-300"
                      >
                        <EventCard
                          event={event}
                          variant="compact"
                          onClick={() => handleEventClick(event.slug)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <Card className="border-dashed border-purple-500/40 bg-background/40">
                  <CardContent className="py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-lg">
                        No events nearby… yet
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        We couldn&apos;t find events around your current city.
                        Try exploring by category or look at popular events
                        across India.
                      </p>
                    </div>
                    <Button variant="outline" onClick={handleViewLocalEvents}>
                      Explore your city
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Browse by Category - Carousel */}
            <div className="mb-8 sm:mb-10 md:mb-12">
              <div className="mb-4 sm:mb-6 px-2">
                <h2 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Browse by Category</h2>
                <p className="text-sm sm:text-base text-gray-400">Find events by your interests</p>
              </div>
              <div className="relative">
                <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-purple-600/60 scrollbar-track-transparent scroll-smooth px-2">
                  {categoriesWithCounts.map((category) => (
                    <Card
                      key={category.id}
                      className="min-w-[160px] sm:min-w-[180px] md:min-w-[200px] max-w-[220px] py-3 sm:py-4 group cursor-pointer hover:shadow-xl hover:shadow-purple-500/20 transition-all hover:border-purple-500/50 hover:scale-105 transform duration-300 bg-slate-900/50 border-purple-500/20"
                      onClick={() => handleCategoryClick(category.id)}
                    >
                      <CardContent className="px-3 sm:px-4 flex flex-col items-center text-center gap-1 sm:gap-2">
                        <div className="text-3xl sm:text-4xl mb-1 sm:mb-2 transform group-hover:scale-110 transition-transform duration-300">
                          {category.icon}
                        </div>
                        <h3 className="text-sm sm:text-base font-semibold group-hover:text-purple-400 transition-colors">
                          {category.label}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-400">
                          {category.count} Event{category.count !== 1 ? "s" : ""}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* Events Based on Your Interests - Carousel */}
            {user?.interests && user.interests.length > 0 && (
              <div className="mb-16">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold mb-1">
                      Events you might like
                    </h2>
                    <p className="text-gray-400 max-w-xl">
                      Curated from categories you&apos;re interested in:{" "}
                      <span className="font-medium text-purple-400">
                        {user.interests.join(", ")}
                      </span>
                    </p>
                  </div>
                </div>

                {interestedEvents.length > 0 ? (
                  <div className="relative">
                    <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-purple-600/60 scrollbar-track-transparent scroll-smooth">
                      {interestedEvents.map((event) => (
                        <div
                          key={event._id}
                          className="min-w-[300px] max-w-[320px] flex-shrink-0 transform hover:scale-105 transition-transform duration-300"
                        >
                          <EventCard
                            event={event}
                            onClick={() => handleEventClick(event.slug)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Card className="border-dashed border-purple-500/40 bg-background/40">
                    <CardContent className="py-6">
                      <h3 className="font-semibold text-lg">
                        No events match your interests right now
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        As more organizers publish events in your favourite
                        categories, they&apos;ll automatically show up here.
                        For now, check out what&apos;s popular across India.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Popular Events - Carousel */}
            {popularEvents.length > 0 && (
              <div className="mb-10 sm:mb-12 md:mb-16">
                <div className="mb-4 sm:mb-6 px-2">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-1">Popular Across India</h2>
                  <p className="text-sm sm:text-base text-gray-400">Trending events nationwide</p>
                </div>
                <div className="relative">
                  <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-purple-600/60 scrollbar-track-transparent scroll-smooth px-2">
                    {popularEvents.map((event) => (
                      <div
                        key={event._id}
                        className="min-w-[280px] sm:min-w-[300px] md:min-w-[320px] max-w-[340px] flex-shrink-0 transform hover:scale-105 transition-transform duration-300"
                      >
                        <EventCard
                          event={event}
                          variant="list"
                          onClick={() => handleEventClick(event.slug)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Empty State */}
            {events.length === 0 && (
              <Card className="p-12 text-center">
                <div className="max-w-md mx-auto space-y-4">
                  <div className="text-6xl mb-4">🎉</div>
                  <h2 className="text-2xl font-bold">No events yet</h2>
                  <p className="text-muted-foreground">
                    Be the first to create an event in your area!
                  </p>
                  <Button asChild className="gap-2">
                    <a href="/create-event">Create Event</a>
                  </Button>
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}

