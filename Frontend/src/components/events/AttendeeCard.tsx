import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { eventAPI } from "../../services/api";
import { format } from "date-fns";
import { CheckCircle, Circle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import type { Registration } from "../../types";

interface AttendeeCardProps {
  registration: Registration;
}

export function AttendeeCard({ registration }: AttendeeCardProps) {
  const [loading, setLoading] = useState(false);

  const handleManualCheckIn = async () => {
    setLoading(true);
    try {
      const response = await eventAPI.checkInAttendee(registration.qrCode);
      if (response.data.success) {
        toast.success("Attendee checked in successfully");
        window.location.reload(); // Refresh to show updated status
      } else {
        toast.error(response.data.message);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to check in attendee");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="py-0">
      <CardContent className="p-4 flex items-start gap-4">
        <div
          className={`mt-1 p-2 rounded-full ${
            registration.checkedIn ? "bg-green-100" : "bg-gray-100"
          }`}
        >
          {registration.checkedIn ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <Circle className="w-5 h-5 text-gray-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold mb-1">{registration.attendeeName}</h3>
          <p className="text-sm text-muted-foreground mb-2">{registration.attendeeEmail}</p>
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span>
              {registration.checkedIn ? "⏰ Checked in" : "📅 Registered"}{" "}
              {(() => {
                // Safely format date with fallback for invalid/missing dates
                const dateToFormat = registration.checkedIn && registration.checkedInAt
                  ? registration.checkedInAt
                  : registration.registeredAt;
                
                if (!dateToFormat) {
                  return "Date unavailable";
                }
                
                try {
                  const date = new Date(dateToFormat);
                  // Check if date is valid
                  if (isNaN(date.getTime())) {
                    return "Date unavailable";
                  }
                  return format(date, "PPp");
                } catch (error) {
                  return "Date unavailable";
                }
              })()}
            </span>
            <span className="font-mono">QR: {registration.qrCode}</span>
          </div>
        </div>
        {!registration.checkedIn && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleManualCheckIn}
            disabled={loading}
            className="gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Check In
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default AttendeeCard;

