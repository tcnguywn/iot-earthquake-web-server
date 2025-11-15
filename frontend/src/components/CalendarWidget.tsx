import { useState } from "react";
import { Card } from "./ui/card";
import { Calendar } from "./ui/calendar";
import { Badge } from "./ui/badge";
import { Clock } from "lucide-react";

interface CalendarWidgetProps {
  className?: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  date: Date;
}

export function CalendarWidget({ className }: CalendarWidgetProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());

  // Mock events
  const events: CalendarEvent[] = [
    {
      id: "1",
      title: "Team Meeting",
      time: "10:00 AM",
      date: new Date(),
    },
    {
      id: "2",
      title: "Project Review",
      time: "2:30 PM",
      date: new Date(),
    },
    {
      id: "3",
      title: "Client Call",
      time: "4:00 PM",
      date: new Date(),
    },
  ];

  const todayEvents = events.filter(
    (event) =>
      event.date.toDateString() === (date || new Date()).toDateString()
  );

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-4">
        <h2 className="text-gray-500">Calendar</h2>
        
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border-0"
        />

        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-sm text-gray-500 mb-3">
            Today's Events ({todayEvents.length})
          </h3>
          <div className="space-y-2">
            {todayEvents.length > 0 ? (
              todayEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm">{event.title}</p>
                    <p className="text-xs text-gray-500">{event.time}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Today
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400">No events scheduled</p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
