import axios from 'axios';

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export async function sendAIMessage(message: string, history: AIMessage[]): Promise<AIMessage> {
  const response = await axios.post('/api/ai/chat', {
    message,
    history,
  });
  return response.data;
}
