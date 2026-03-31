
export type MessageChannel = 'whatsapp' | 'instagram' | 'messenger' | 'airbnb' | 'voice' | 'email' | 'web';
export type MessageDirection = 'inbound' | 'outbound';

export interface Conversation {
  id: string;
  tenantId: string;
  externalId: string | null;
  channel: MessageChannel;
  contactName: string | null;
  contactAvatar: string | null;
  lastMessageAt: string;
  status: 'active' | 'archived';
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface VoiceAgent {
  id: string;
  tenantId: string;
  provider: 'vapi' | 'retell';
  externalAgentId: string | null;
  phoneNumber: string | null;
  voiceId: string | null;
  instructions: string | null;
  status: 'active' | 'inactive';
  config: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}
