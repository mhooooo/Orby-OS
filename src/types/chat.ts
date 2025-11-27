export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolCalls?: ToolCall[];
  createdAt: Date;
}

export interface ToolCall {
  id: string;
  name: string;
  input: Record<string, unknown>;
  result?: unknown;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}
