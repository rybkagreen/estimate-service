import React, { useState, useRef } from 'react';
import { sendAIMessage, AIMessage } from '../services/aiService';

const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg: AIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const aiMsg = await sendAIMessage(userMsg.content, [...messages, userMsg]);
      setMessages(prev => [...prev, aiMsg]);
    } catch (e) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + '_err',
          role: 'assistant',
          content: 'Ошибка при обращении к ИИ',
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  return (
    <div className='flex flex-col h-[70vh] max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-4'>
      <h1 className='text-2xl font-bold mb-4 text-gray-900 dark:text-white'>ИИ-Ассистент</h1>
      <div className='flex-1 overflow-y-auto mb-4 border rounded p-2 bg-gray-50 dark:bg-gray-900'>
        {messages.length === 0 && (
          <div className='text-gray-400 text-center mt-8'>Начните диалог с ИИ...</div>
        )}
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`mb-2 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`px-3 py-2 rounded-lg max-w-[70%] ${
                msg.role === 'user'
                  ? 'bg-blue-100 dark:bg-blue-900 text-right'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <div className='text-xs text-gray-500 mb-1'>{msg.role === 'user' ? 'Вы' : 'ИИ'}</div>
              <div>{msg.content}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className='flex gap-2'>
        <input
          className='flex-1 border rounded px-3 py-2'
          placeholder='Введите сообщение...'
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !loading && handleSend()}
          disabled={loading}
        />
        <button
          className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg'
          onClick={handleSend}
          disabled={loading}
        >
          {loading ? 'Отправка...' : 'Отправить'}
        </button>
      </div>
    </div>
  );
};

export default AIAssistant;
