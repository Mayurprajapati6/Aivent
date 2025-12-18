import { Calendar, MapPin, Users, Trash2, X, QrCode, Eye } from "lucide-react";
import { format } from "date-fns";
import { getCategoryIcon, getCategoryLabel } from "../../lib/data";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import type { Event } from "../../types";

interface EventCardProps {
  event: Event;
  onClick?: () => void;
  onDelete?: (eventId: string) => void;
  variant?: "grid" | "list" | "compact";
  action?: "event" | "ticket" | null;
  className?: string;
}

export default function EventCard({
  event,
  onClick,
  onDelete,
  variant = "grid",
  action = null,
  className = "",
}: EventCardProps) {
  const startDate = typeof event.startDate === "string" 
    ? new Date(event.startDate) 
    : new Date(event.startDate as number);
  
  const organizerName = typeof event.organizer === "object" 
    ? event.organizer.name 
    : event.organizerName || "Organizer";

  if (variant === "list") {
    return (
      <Card
        className={`py-0 group cursor-pointer hover:shadow-lg transition-all hover:border-purple-500/50 ${className}`}
        onClick={onClick}
      >
        <CardContent className="p-3 flex gap-3">
          <div className="w-20 h-20 rounded-lg shrink-0 overflow-hidden relative">
            {event.coverImage ? (
              <img src={event.coverImage} alt={event.title} className="w-full h-full object-cover" />
            ) : (
              <div
                className="absolute inset-0 flex items-center justify-center text-3xl"
                style={{ backgroundColor: event.themeColor || "#1e3a8a" }}
              >
                {getCategoryIcon(event.category)}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm mb-1 line-clamp-2">{event.title}</h3>
            <p className="text-xs text-muted-foreground mb-1">
              {format(startDate, "EEE, dd MMM, HH:mm")}
            </p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span className="line-clamp-1">
                {event.locationType === "online" ? "Online Event" : event.city}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={`overflow-hidden group pt-0 flex flex-col h-full ${onClick ? "cursor-pointer hover:shadow-lg transition-all hover:border-purple-500/50" : ""} ${className}`}
      onClick={onClick}
    >
      {/* Image Section - Fixed Height */}
      <div className="relative h-48 overflow-hidden flex-shrink-0">
        {event.coverImage ? (
          <img
            src={event.coverImage}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-4xl"
            style={{ backgroundColor: event.themeColor || "#1e3a8a" }}
          >
            {getCategoryIcon(event.category)}
          </div>
        )}
        <div className="absolute top-3 right-3">
          <Badge variant="secondary">
            {event.ticketType === "free" ? "Free" : "Paid"}
          </Badge>
        </div>
      </div>

      {/* Content Section - Flexible */}
      <CardContent className="flex flex-col flex-grow p-4">
        {/* Header */}
        <div className="mb-3">
          <Badge variant="outline" className="mb-2">
            {getCategoryIcon(event.category)} {getCategoryLabel(event.category)}
          </Badge>
          <h3 className="font-semibold text-lg line-clamp-2 min-h-[3.5rem]">{event.title}</h3>
        </div>

        {/* Info Section - Fixed Height */}
        <div className="space-y-2 text-sm text-muted-foreground mb-4 flex-grow">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span className="line-clamp-1">{format(startDate, "PPP")}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="line-clamp-1">
              {event.locationType === "online"
                ? "Online Event"
                : `${event.city}, ${event.state || event.country}`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 flex-shrink-0" />
            <span>
              {event.registrationCount} / {event.capacity} registered
            </span>
          </div>
        </div>

        {/* Action Buttons - Always at Bottom */}
        {action && (
          <div className="flex gap-2 mt-auto pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-2"
              onClick={(e) => {
                e.stopPropagation();
                onClick?.();
              }}
            >
              {action === "event" ? (
                <>
                  <Eye className="w-4 h-4" />
                  View
                </>
              ) : (
                <>
                  <QrCode className="w-4 h-4" />
                  Show Ticket
                </>
              )}
            </Button>
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(event._id);
                }}
              >
                {action === "event" ? (
                  <Trash2 className="w-4 h-4" />
                ) : (
                  <X className="w-4 h-4" />
                )}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}