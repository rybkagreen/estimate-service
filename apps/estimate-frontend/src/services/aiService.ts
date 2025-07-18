import axios from 'axios';
// Combined AI Service

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface AIChat {
  id: string;
  title: string;
  messages: AIMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface AIEstimateSuggestion {
  itemName: string;
  quantity: number;
  unit: string;
  price: number;
  confidence: number;
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Create axios instance with default config
const aiClient = axios.create({
  baseURL: `${API_BASE_URL}/ai`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
aiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
aiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const aiService = {
  // Send a message to the AI assistant
  async sendMessage(message: string, chatId?: string): Promise<AIMessage> {
    const response = await aiClient.post('/chat', {
      message,
      chatId,
    });
    return response.data;
  },

  // Get all chats for the current user
  async getChats(): Promise<AIChat[]> {
    const response = await aiClient.get('/chats');
    return response.data;
  },

  // Get a specific chat by ID
  async getChat(chatId: string): Promise<AIChat> {
    const response = await aiClient.get(`/chats/${chatId}`);
    return response.data;
  },

  // Delete a chat
  async deleteChat(chatId: string): Promise<void> {
    await aiClient.delete(`/chats/${chatId}`);
  },

  // Get AI suggestions for estimate items
  async getEstimateSuggestions(
    description: string,
    context?: {
      projectType?: string;
      region?: string;
      previousItems?: string[];
    }
  ): Promise<AIEstimateSuggestion[]> {
    const response = await aiClient.post('/estimate-suggestions', {
      description,
      context,
    });
    return response.data;
  },

  // Stream chat response
  async streamMessage(
    message: string,
    chatId: string,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/ai/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('auth-token')}`,
      },
      body: JSON.stringify({ message, chatId }),
    });

    if (!response.ok) {
      throw new Error('Failed to stream message');
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      onChunk(chunk);
    }
  },

  // Voice-to-text conversion
  async speechToText(audioBlob: Blob): Promise<string> {
    const formData = new FormData();
    formData.append('audio', audioBlob);

    const response = await aiClient.post('/speech-to-text', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.text;
  },

  // Text-to-speech conversion
  async textToSpeech(text: string): Promise<Blob> {
    const response = await aiClient.post('/text-to-speech', { text }, {
      responseType: 'blob',
    });
    return response.data;
  },
};

// Old service was merged, this file to be removed
//
