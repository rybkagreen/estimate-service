import React, { useState } from 'react';

interface E2EResult {
  id: string;
  name: string;
  status: 'passed' | 'failed';
  duration: string;
  date: string;
}

const mockResults: E2EResult[] = [
  { id: '1', name: 'Авторизация', status: 'passed', duration: '2.1s', date: '2025-07-10' },
  { id: '2', name: 'Создание проекта', status: 'failed', duration: '3.4s', date: '2025-07-10' },
  { id: '3', name: 'Загрузка документа', status: 'passed', duration: '1.7s', date: '2025-07-09' },
];

const statusColor = {
  passed: 'text-green-600',
  failed: 'text-red-600',
};

const E2E: React.FC = () => {
  const [results] = useState(mockResults);

  return (
    <div className='space-y-6'>
      <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>E2E тесты</h1>
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
        <table className='min-w-full'>
          <thead>
            <tr>
              <th className='px-4 py-2 text-left'>Название теста</th>
              <th className='px-4 py-2 text-left'>Статус</th>
              <th className='px-4 py-2 text-left'>Длительность</th>
              <th className='px-4 py-2 text-left'>Дата</th>
            </tr>
          </thead>
          <tbody>
            {results.length === 0 ? (
              <tr>
                <td colSpan={4} className='text-center p-4'>
                  Нет результатов
                </td>
              </tr>
            ) : (
              results.map(res => (
                <tr key={res.id} className='border-t'>
                  <td className='px-4 py-2'>{res.name}</td>
                  <td className={`px-4 py-2 font-semibold ${statusColor[res.status]}`}>
                    {res.status === 'passed' ? 'Успешно' : 'Ошибка'}
                  </td>
                  <td className='px-4 py-2'>{res.duration}</td>
                  <td className='px-4 py-2'>{res.date}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default E2E;
