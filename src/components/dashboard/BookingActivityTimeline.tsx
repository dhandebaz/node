import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BookingActivityTimelineProps {
  bookingId: string;
}

export function BookingActivityTimeline({ bookingId }: BookingActivityTimelineProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground">No recent activity for booking {bookingId}.</div>
      </CardContent>
    </Card>
  );
}
