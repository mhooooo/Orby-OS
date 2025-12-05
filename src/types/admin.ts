// Admin MVP Types

export interface Client {
  id: string;
  company_name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  country: string;
  client_type: 'B2B' | 'Agent' | 'Corporate' | 'Direct';
  markup_percentage: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CourseRate {
  id: string;
  course_id: string;
  rate_type: 'green_fee' | 'caddie' | 'cart' | 'package';
  net_rate: number;
  rack_rate: number | null;
  valid_from: string | null;
  valid_to: string | null;
  day_type: 'weekday' | 'weekend' | 'holiday' | 'all';
  season: 'high' | 'low' | 'shoulder' | 'all';
  includes_caddie: boolean;
  includes_cart: boolean;
  notes: string | null;
  created_at: string;
}

export interface TransportRate {
  id: string;
  vehicle_type: 'sedan' | 'suv' | 'van' | 'minibus' | 'coach';
  route_type: 'airport_transfer' | 'golf_transfer' | 'day_trip' | 'hourly';
  origin_area: string;
  destination_area: string;
  net_rate: number;
  rack_rate: number | null;
  max_passengers: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuoteItem {
  id: string;
  type: 'course' | 'transport' | 'accommodation' | 'other';
  description: string;
  date?: string;
  quantity: number;
  net_rate: number;
  sell_rate: number;
  total_net: number;
  total_sell: number;
}

export interface Quote {
  id: string;
  quote_number: string;
  client_id: string | null;
  client?: Client;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  valid_until: string | null;
  total_net: number;
  total_sell: number;
  margin: number;
  currency: string;
  items: QuoteItem[];
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// Extended Course type with B2B fields
export interface CourseWithB2B {
  id: string;
  name: string;
  region: string;
  location: string;
  par: number;
  yardage: number;
  holes: number;
  tags: string[];
  hero_image: string | null;
  description: string | null;
  green_fee: Record<string, unknown>;
  contact_email: string | null;
  contact_phone: string | null;
  booking_email: string | null;
  commission_rate: number | null;
  internal_notes: string | null;
  created_at: string;
}
