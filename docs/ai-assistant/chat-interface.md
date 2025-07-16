# 💬 Чат-интерфейс ИИ-ассистента

## Обзор

Чат-интерфейс предоставляет интуитивный способ взаимодействия с ИИ-ассистентом для работы со строительными сметами. Интерфейс поддерживает текстовые сообщения, загрузку файлов и контекстуальные подсказки.

## 🎨 UI/UX компоненты

### Основные элементы интерфейса

```typescript
// Структура компонентов чата
interface ChatInterface {
  messageList: MessageList;      // Список сообщений
  inputArea: InputArea;          // Область ввода
  contextPanel: ContextPanel;    // Панель контекста
  suggestionsBar: SuggestionsBar; // Подсказки
  attachments: AttachmentsArea;  // Вложения
}
```

### Компонент сообщений

```jsx
// components/chat/MessageList.tsx
import React from 'react';
import { Message } from '@/types/chat';

interface MessageListProps {
  messages: Message[];
  sessionId: string;
  onMessageAction: (action: string, messageId: string) => void;
}

export const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  sessionId, 
  onMessageAction 
}) => {
  return (
    <div className="flex flex-col space-y-4 p-4">
      {messages.map((message) => (
        <MessageBubble 
          key={message.id}
          message={message}
          isUser={message.role === 'user'}
          onAction={onMessageAction}
        />
      ))}
    </div>
  );
};
```

## 📡 WebSocket соединение

### Установка соединения

```typescript
// services/chat/websocket.service.ts
import { io, Socket } from 'socket.io-client';

export class ChatWebSocketService {
  private socket: Socket;
  private sessionId: string;

  constructor() {
    this.socket = io(process.env.NEXT_PUBLIC_WS_URL, {
      transports: ['websocket'],
      auth: {
        token: this.getAuthToken()
      }
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Подключение
    this.socket.on('connect', () => {
      console.log('Connected to chat service');
      this.joinSession();
    });

    // Получение сообщений
    this.socket.on('message', (data: ChatMessage) => {
      this.handleIncomingMessage(data);
    });

    // Статус набора текста
    this.socket.on('typing', (data: TypingStatus) => {
      this.updateTypingIndicator(data);
    });

    // Обработка ошибок
    this.socket.on('error', (error: Error) => {
      this.handleError(error);
    });
  }

  sendMessage(content: string, attachments?: File[]) {
    this.socket.emit('message', {
      sessionId: this.sessionId,
      content,
      attachments: attachments?.map(f => f.name),
      timestamp: new Date().toISOString()
    });
  }
}
```

## 🎯 Функциональные возможности

### 1. Отправка сообщений

```typescript
// Обработка отправки сообщения
const handleSendMessage = async (content: string) => {
  // Валидация
  if (!content.trim()) return;

  // Оптимистичное обновление UI
  addMessage({
    id: generateTempId(),
    role: 'user',
    content,
    timestamp: new Date(),
    status: 'sending'
  });

  try {
    // Отправка через API
    const response = await chatApi.sendMessage({
      sessionId,
      message: content,
      context: getCurrentContext()
    });

    // Обновление с ответом ИИ
    updateMessage(response);
  } catch (error) {
    handleMessageError(error);
  }
};
```

### 2. Загрузка файлов

```typescript
// Обработка загрузки смет
const handleFileUpload = async (files: FileList) => {
  const validFiles = Array.from(files).filter(file => 
    ALLOWED_FILE_TYPES.includes(file.type)
  );

  for (const file of validFiles) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('sessionId', sessionId);

    try {
      const result = await chatApi.uploadFile(formData);
      
      // Автоматический анализ загруженной сметы
      if (result.fileType === 'estimate') {
        await requestEstimateAnalysis(result.fileId);
      }
    } catch (error) {
      showNotification({
        type: 'error',
        message: `Ошибка загрузки файла ${file.name}`
      });
    }
  }
};
```

### 3. Контекстуальные подсказки

```typescript
// Система умных подсказок
interface SmartSuggestion {
  id: string;
  text: string;
  icon: string;
  action: () => void;
  relevance: number;
}

const generateSuggestions = (
  currentInput: string,
  chatHistory: Message[],
  userContext: UserContext
): SmartSuggestion[] => {
  const suggestions: SmartSuggestion[] = [];

  // Анализ контекста
  if (isDiscussingEstimate(chatHistory)) {
    suggestions.push({
      id: 'optimize',
      text: 'Оптимизировать смету',
      icon: '💰',
      action: () => sendMessage('Помоги оптимизировать текущую смету'),
      relevance: 0.9
    });
  }

  // Частые запросы
  if (currentInput.includes('ФСБЦ')) {
    suggestions.push({
      id: 'fsbc-search',
      text: 'Найти расценки ФСБЦ',
      icon: '🔍',
      action: () => openFSBCSearch(),
      relevance: 0.95
    });
  }

  return suggestions.sort((a, b) => b.relevance - a.relevance);
};
```

## 🎨 Стилизация и темы

### Светлая/Темная тема

```scss
// styles/chat-interface.scss
.chat-container {
  @apply bg-white dark:bg-gray-900;
  @apply text-gray-900 dark:text-gray-100;
  
  .message-bubble {
    &.user {
      @apply bg-blue-500 text-white;
      @apply rounded-bl-2xl rounded-tl-2xl rounded-tr-2xl;
    }
    
    &.assistant {
      @apply bg-gray-100 dark:bg-gray-800;
      @apply rounded-br-2xl rounded-tr-2xl rounded-tl-2xl;
    }
  }
  
  .typing-indicator {
    @apply flex space-x-1;
    
    .dot {
      @apply w-2 h-2 bg-gray-400 rounded-full;
      @apply animate-bounce;
      
      &:nth-child(2) { animation-delay: 0.1s; }
      &:nth-child(3) { animation-delay: 0.2s; }
    }
  }
}
```

## 📱 Адаптивный дизайн

### Мобильная версия

```tsx
// components/chat/MobileChatInterface.tsx
const MobileChatInterface: React.FC = () => {
  return (
    <div className="h-screen flex flex-col">
      {/* Заголовок с информацией о сессии */}
      <header className="bg-primary p-4 flex items-center">
        <BackButton />
        <h1 className="flex-1 text-center">ИИ-ассистент</h1>
        <MenuButton />
      </header>

      {/* Область сообщений */}
      <MessageArea className="flex-1 overflow-y-auto" />

      {/* Панель ввода */}
      <InputPanel className="border-t p-4">
        <AttachButton />
        <MessageInput className="flex-1 mx-2" />
        <SendButton />
      </InputPanel>
    </div>
  );
};
```

## 🔧 Настройки и персонализация

### Пользовательские настройки

```typescript
interface ChatSettings {
  // Визуальные настройки
  theme: 'light' | 'dark' | 'auto';
  fontSize: 'small' | 'medium' | 'large';
  compactMode: boolean;
  
  // Функциональные настройки
  autoSaveConversations: boolean;
  showTypingIndicator: boolean;
  enableSoundNotifications: boolean;
  
  // ИИ настройки
  aiResponseStyle: 'concise' | 'detailed' | 'technical';
  preferredLanguage: 'ru' | 'en';
  showConfidenceScores: boolean;
}

// Применение настроек
const applyUserSettings = (settings: ChatSettings) => {
  // Тема
  document.documentElement.classList.toggle('dark', settings.theme === 'dark');
  
  // Размер шрифта
  document.documentElement.style.setProperty(
    '--chat-font-size', 
    FONT_SIZES[settings.fontSize]
  );
  
  // Сохранение в localStorage
  localStorage.setItem('chatSettings', JSON.stringify(settings));
};
```

## 🚀 Горячие клавиши

| Комбинация | Действие |
|------------|----------|
| `Ctrl + Enter` | Отправить сообщение |
| `Ctrl + U` | Загрузить файл |
| `Ctrl + N` | Новая сессия чата |
| `Ctrl + /` | Показать подсказки |
| `Esc` | Отменить действие |
| `↑` | Предыдущее сообщение |
| `↓` | Следующее сообщение |

## 📊 Аналитика использования

```typescript
// Отслеживание действий пользователя
const trackChatInteraction = (action: ChatAction) => {
  analytics.track('chat_interaction', {
    action: action.type,
    sessionId: action.sessionId,
    timestamp: new Date().toISOString(),
    metadata: {
      messageLength: action.messageLength,
      hasAttachments: action.hasAttachments,
      responseTime: action.responseTime
    }
  });
};
```

## 🛡️ Безопасность

### Валидация ввода

```typescript
// Защита от XSS и инъекций
const sanitizeUserInput = (input: string): string => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'br'],
    ALLOWED_ATTR: ['href', 'target']
  });
};

// Проверка размера файлов
const validateFileUpload = (file: File): ValidationResult => {
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'Файл слишком большой' };
  }
  
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { valid: false, error: 'Неподдерживаемый формат файла' };
  }
  
  return { valid: true };
};
```

## 🔗 API интеграция

Подробное описание API endpoints см. в [API документации](./api-endpoints.md).

## 📱 Прогрессивные функции

### Offline режим

```typescript
// Service Worker для offline функциональности
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/chat')) {
    event.respondWith(
      caches.match(event.request)
        .then(response => response || fetch(event.request))
        .catch(() => caches.match('/offline-chat.html'))
    );
  }
});
```

## 🆘 Решение проблем

Распространенные проблемы и решения описаны в [руководстве по устранению неполадок](./troubleshooting.md).

---

**Версия**: 1.0  
**Обновлено**: 15.07.2025
