import React, { useState } from 'react';

interface ChangeRequest {
  id: string;
  title: string;
  status: 'Ожидание' | 'Согласовано' | 'Отклонено';
  createdAt: string;
}

const mockRequests: ChangeRequest[] = [
  { id: '1', title: 'Изменение бюджета', status: 'Ожидание', createdAt: '2025-07-10' },
  { id: '2', title: 'Добавление нового этапа', status: 'Согласовано', createdAt: '2025-07-08' },
];

const ChangeRequests: React.FC = () => {
  const [title, setTitle] = useState('');
  const [requests, setRequests] = useState(mockRequests);

  const handleAdd = () => {
    if (!title.trim()) return;
    setRequests(prev => [
      {
        id: Date.now().toString(),
        title,
        status: 'Ожидание',
        createdAt: new Date().toISOString().slice(0, 10),
      },
      ...prev,
    ]);
    setTitle('');
  };

  return (
    <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
      <h2 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
        Запросы на изменение
      </h2>
      <div className='flex gap-2 mb-4'>
        <input
          className='flex-1 border rounded px-2 py-1'
          placeholder='Описание запроса...'
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <button
          className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg'
          onClick={handleAdd}
        >
          Добавить
        </button>
      </div>
      <table className='min-w-full'>
        <thead>
          <tr>
            <th className='px-4 py-2 text-left'>Описание</th>
            <th className='px-4 py-2 text-left'>Статус</th>
            <th className='px-4 py-2 text-left'>Создан</th>
          </tr>
        </thead>
        <tbody>
          {requests.length === 0 ? (
            <tr>
              <td colSpan={3} className='text-center p-4'>
                Нет запросов
              </td>
            </tr>
          ) : (
            requests.map(req => (
              <tr key={req.id} className='border-t'>
                <td className='px-4 py-2'>{req.title}</td>
                <td className='px-4 py-2'>{req.status}</td>
                <td className='px-4 py-2'>{req.createdAt}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ChangeRequests;
