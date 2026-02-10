
export interface ICalEvent {
  uid: string;
  summary: string;
  description?: string;
  startDate: Date;
  endDate: Date;
}

export function parseICal(data: string): ICalEvent[] {
  const events: ICalEvent[] = [];
  const lines = data.split(/\r\n|\r|\n/);
  
  let inEvent = false;
  let currentEvent: Partial<ICalEvent> = {};
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.startsWith('BEGIN:VEVENT')) {
      inEvent = true;
      currentEvent = {};
      continue;
    }
    
    if (line.startsWith('END:VEVENT')) {
      inEvent = false;
      if (currentEvent.uid && currentEvent.startDate && currentEvent.endDate) {
        events.push(currentEvent as ICalEvent);
      }
      continue;
    }
    
    if (inEvent) {
      if (line.startsWith('UID:')) {
        currentEvent.uid = line.substring(4);
      } else if (line.startsWith('SUMMARY:')) {
        currentEvent.summary = line.substring(8);
      } else if (line.startsWith('DESCRIPTION:')) {
        currentEvent.description = line.substring(12);
      } else if (line.startsWith('DTSTART')) {
        currentEvent.startDate = parseICalDate(line);
      } else if (line.startsWith('DTEND')) {
        currentEvent.endDate = parseICalDate(line);
      }
    }
  }
  
  return events;
}

function parseICalDate(line: string): Date {
  // Format: DTSTART:20230101T120000Z or DTSTART;VALUE=DATE:20230101
  const parts = line.split(':');
  const value = parts[1];
  
  if (!value) return new Date(); // Fallback

  // Handle YYYYMMDD
  if (value.length === 8) {
    const year = parseInt(value.substring(0, 4));
    const month = parseInt(value.substring(4, 6)) - 1;
    const day = parseInt(value.substring(6, 8));
    return new Date(Date.UTC(year, month, day));
  }
  
  // Handle YYYYMMDDTHHMMSSZ
  if (value.includes('T')) {
    const dateStr = value.replace('Z', ''); // Simple handling, assumes UTC if Z present or not
    const year = parseInt(dateStr.substring(0, 4));
    const month = parseInt(dateStr.substring(4, 6)) - 1;
    const day = parseInt(dateStr.substring(6, 8));
    const hour = parseInt(dateStr.substring(9, 11));
    const minute = parseInt(dateStr.substring(11, 13));
    const second = parseInt(dateStr.substring(13, 15));
    return new Date(Date.UTC(year, month, day, hour, minute, second));
  }
  
  return new Date();
}
