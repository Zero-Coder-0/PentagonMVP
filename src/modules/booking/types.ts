export interface SiteVisit {
  id: string;
  property_id: string;
  sales_agent_id: string;
  customer_name: string;
  customer_phone: string;
  visit_time: string; // ISO Date String
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  notes?: string;
}

export interface BookingFormState {
  customerName: string;
  customerPhone: string;
  visitDate: string;
  visitTime: string;
}
