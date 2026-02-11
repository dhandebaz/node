import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function BookingActivityTimeline() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground">No recent activity.</div>
      </CardContent>
    </Card>
  );
}
