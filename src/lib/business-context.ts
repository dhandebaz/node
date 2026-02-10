import { BusinessType } from "@/types";

export const PERSONA_LABELS: Record<BusinessType, {
  listing: string;
  listings: string;
  booking: string;
  bookings: string;
  calendar: string;
  customer: string;
  customers: string;
  checkIn: string;
  checkOut: string;
  emptyListings: string;
  emptyBookings: string;
  inboxContext: {
    customerLabel: string;
    timeLabel: string;
  };
}> = {
  airbnb_host: {
    listing: "Property",
    listings: "Properties",
    booking: "Booking",
    bookings: "Bookings",
    calendar: "Availability Calendar",
    customer: "Guest",
    customers: "Guests",
    checkIn: "Check-in",
    checkOut: "Check-out",
    emptyListings: "Add your first property to start receiving guests.",
    emptyBookings: "No bookings yet.",
    inboxContext: {
      customerLabel: "Guest",
      timeLabel: "Stay dates",
    },
  },
  kirana_store: {
    listing: "Store",
    listings: "Store",
    booking: "Order",
    bookings: "Orders",
    calendar: "Delivery Slots",
    customer: "Customer",
    customers: "Customers",
    checkIn: "Order Date",
    checkOut: "Delivery Date",
    emptyListings: "Set up your store to start receiving orders.",
    emptyBookings: "No orders yet.",
    inboxContext: {
      customerLabel: "Customer",
      timeLabel: "Order status",
    },
  },
  doctor_clinic: {
    listing: "Clinic",
    listings: "Clinic",
    booking: "Appointment",
    bookings: "Appointments",
    calendar: "Appointment Calendar",
    customer: "Patient",
    customers: "Patients",
    checkIn: "Start Time",
    checkOut: "End Time",
    emptyListings: "Add your clinic to start scheduling appointments.",
    emptyBookings: "No appointments yet.",
    inboxContext: {
      customerLabel: "Patient",
      timeLabel: "Appointment time",
    },
  },
  thrift_store: {
    listing: "Shop",
    listings: "Shop",
    booking: "Order",
    bookings: "Orders",
    calendar: "Schedule",
    customer: "Buyer",
    customers: "Buyers",
    checkIn: "Order Date",
    checkOut: "Delivery Date",
    emptyListings: "Set up your shop to start receiving orders.",
    emptyBookings: "No orders yet.",
    inboxContext: {
      customerLabel: "Buyer",
      timeLabel: "Order status",
    },
  },
};

export interface PersonaCapabilities {
  listings: boolean;
  multi_listing: boolean;
  calendar: boolean;
  bookings: boolean;
  payments: boolean;
  id_verification: boolean;
  direct_booking: boolean;
  integrations: {
    airbnb: boolean;
    google: boolean;
    ical: boolean;
    whatsapp: boolean;
    instagram: boolean;
  };
}

export const PERSONA_CAPABILITIES: Record<BusinessType, PersonaCapabilities> = {
  airbnb_host: {
    listings: true,
    multi_listing: true,
    calendar: true,
    bookings: true,
    payments: true,
    id_verification: true,
    direct_booking: true,
    integrations: {
      airbnb: true,
      google: true,
      ical: true,
      whatsapp: false,
      instagram: false,
    },
  },
  kirana_store: {
    listings: true,
    multi_listing: false,
    calendar: false,
    bookings: true, // orders
    payments: true,
    id_verification: false,
    direct_booking: true,
    integrations: {
      airbnb: false,
      google: false,
      ical: false,
      whatsapp: true,
      instagram: false,
    },
  },
  doctor_clinic: {
    listings: true, // clinic
    multi_listing: false,
    calendar: true,
    bookings: true, // appointments
    payments: true,
    id_verification: false, // optional in spec, set to false default for now
    direct_booking: false,
    integrations: {
      airbnb: false,
      google: true,
      ical: false,
      whatsapp: true,
      instagram: false,
    },
  },
  thrift_store: {
    listings: true, // shop
    multi_listing: false,
    calendar: false,
    bookings: true, // orders
    payments: true,
    id_verification: false,
    direct_booking: true,
    integrations: {
      airbnb: false,
      google: false,
      ical: false,
      whatsapp: true,
      instagram: true,
    },
  },
};

export const PERSONA_AI_DEFAULTS: Record<BusinessType, {
  role: string;
  instructions: string;
}> = {
  airbnb_host: {
    role: "Host",
    instructions: "You are a friendly Airbnb host. Answer questions about the property, check-in/out times, and local recommendations. Always be welcoming and helpful."
  },
  kirana_store: {
    role: "Shop Assistant",
    instructions: "You are a helpful shop assistant for a Kirana store. Confirm items are in stock, take orders, and ask for delivery address. Be quick, polite, and efficient."
  },
  doctor_clinic: {
    role: "Receptionist",
    instructions: "You are a professional clinic receptionist. Check doctor availability, schedule appointments, and provide clinic timings. Be empathetic, clear, and respectful."
  },
  thrift_store: {
    role: "Shop Owner",
    instructions: "You are a vintage shop owner. Describe item condition honestly, confirm availability, and handle shipping details. Be cool, casual, and helpful."
  }
};

export function getBusinessLabels(type?: BusinessType | null) {
  // Default to airbnb_host if undefined (safe fallback)
  return PERSONA_LABELS[type || "airbnb_host"];
}

export function getPersonaAIDefaults(type?: BusinessType | null) {
  return PERSONA_AI_DEFAULTS[type || "airbnb_host"];
}

export function getPersonaCapabilities(type?: BusinessType | null): PersonaCapabilities {
  return PERSONA_CAPABILITIES[type || "airbnb_host"];
}

export function isCalendarEnabled(type?: BusinessType | null) {
  return getPersonaCapabilities(type).calendar;
}
