export type OrganizationRole = 'OWNER' | 'ADMIN' | 'SALES_AGENT' | 'VIEWER';

export interface AiOrganization {
  id: string;
  name: string;
  ownerName: string;
  email: string;
  phone: string;
  subscriptionPlan: 'Starter' | 'Growth' | 'Enterprise';
  status: 'Active' | 'Suspended';
  createdAt: string;
}

export interface AiOrgUser {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  role: OrganizationRole;
  phone: string;
  isActive: boolean;
  lastLogin: string;
}

export interface PropertyKnowledgeDocument {
  id: string;
  organizationId: string;
  propertyId: string;
  title: string;
  fileType: 'PDF' | 'DOCX' | 'TXT' | 'CSV' | 'BROCHURE' | 'RERA' | 'PRICE_LIST';
  fileSize: string;
  uploadDate: string;
  chunksCount: number;
  status: 'Indexed' | 'Processing' | 'Error';
  summary: string;
}

export interface AiAgentConfig {
  id: string;
  organizationId: string;
  propertyId: string;
  agentName: string;
  voice: 'en-IN-Standard-A' | 'hi-IN-Neural2-A' | 'en-US-Neural2-F' | 'ElevenLabs-Rachel' | 'Gemini-Live-Voice';
  language: 'English' | 'Hindi' | 'Hinglish' | 'Multi-lingual';
  greeting: string;
  systemInstructions: string;
  knowledgeBaseId: string;
  phoneNumber: string;
  businessHours: string;
  humanHandoffTrigger: 'Always' | 'On Request' | 'Unknown Question' | 'High Budget';
  voiceProvider: 'Twilio' | 'Gemini Live' | 'ElevenLabs' | 'Retell' | 'Vapi';
  isActive: boolean;
}

export interface AiProperty {
  id: string;
  organizationId: string;
  name: string;
  developer: string;
  location: string;
  address: string;
  propertyType: 'Residential Plot' | 'Luxury Villa' | 'Commercial Space' | 'Apartment';
  configurations: string[]; // e.g. ["2 BHK", "3 BHK", "900 Sqft Plot"]
  priceRange: string;
  area: string;
  amenities: string[];
  possessionDate: string;
  reraNumber: string;
  description: string;
  images: string[];
  status: 'Active' | 'Sold Out' | 'Upcoming';
  knowledgeBaseId: string;
  agentId: string;
}

export interface AiLead {
  id: string;
  organizationId: string;
  propertyId: string;
  propertyName: string;
  name: string;
  phone: string;
  email?: string;
  intent: string;
  budget: string;
  configuration: string;
  location: string;
  purpose: 'End Use' | 'Investment' | 'Commercial';
  timeline: 'Immediate (0-30 days)' | '1-3 months' | '6+ months';
  leadScore: 'HOT' | 'WARM' | 'COLD';
  scoreReason: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Site Visit' | 'Negotiation' | 'Booked' | 'Lost' | 'Not Interested';
  source: 'AI Voice Call' | 'Inbound WhatsApp' | 'Direct Web' | 'Agent Referral';
  lastCallDate: string;
  nextFollowUp: string;
  assignedAgentName: string;
  notes: string;
}

export interface CallSession {
  id: string;
  callSessionId: string;
  organizationId: string;
  propertyId: string;
  propertyName: string;
  agentId: string;
  agentName: string;
  customerName: string;
  customerPhone: string;
  startTime: string;
  durationSeconds: number;
  status: 'Connecting' | 'Active' | 'Waiting' | 'Human Handoff' | 'Completed' | 'Failed';
  transcript: Array<{ speaker: 'customer' | 'ai' | 'system'; text: string; timestamp: string }>;
  aiSummary: string;
  leadScore: 'HOT' | 'WARM' | 'COLD';
  customerRequirements: string;
  nextAction: string;
  kbChunksUsed: string[];
}

export interface AppointmentEntity {
  id: string;
  organizationId: string;
  propertyId: string;
  propertyName: string;
  customerName: string;
  customerPhone: string;
  date: string;
  time: string;
  salesAgent: string;
  meetingType: 'Site visit' | 'Phone call' | 'Video call' | 'Office meeting';
  status: 'Requested' | 'Confirmed' | 'Completed' | 'Cancelled';
  notes: string;
}

export interface KnowledgeGapLog {
  id: string;
  organizationId: string;
  propertyId: string;
  propertyName: string;
  customerQuestion: string;
  timestamp: string;
  resolved: boolean;
}
