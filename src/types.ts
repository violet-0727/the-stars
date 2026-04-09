export interface Contact {
  id: string;
  name: string;
  avatar: string;
  avatarName?: string;
  type: 'message' | 'group' | 'channel';
  pinned: boolean;
  status?: string;
}

export interface ChatMessage {
  type: 'system' | 'message' | 'choice';
  content?: string;
  sender?: string;
  senderName?: string;
  time?: string;
  avatar?: string;
  title?: string;
  options?: string[];
}

export interface ProjectData {
  contacts: Contact[];
  chats: Record<string, ChatMessage[]>;
}
