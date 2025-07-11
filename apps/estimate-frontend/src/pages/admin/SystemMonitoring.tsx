import React from 'react';

const mockMetrics = [
  { name: 'CPU', value: '23%' },
  { name: 'RAM', value: '1.2 GB' },
  { name: 'Активных пользователей', value: '17' },
  { name: 'Запросов к ИИ', value: '42' },
];

const SystemMonitoring: React.FC = () => {
  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>Мониторинг системы</h1>
      </div>
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
        <h2 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>Метрики</h2>
        <ul className='divide-y divide-gray-200 dark:divide-gray-700'>
          {mockMetrics.map(m => (
            <li key={m.name} className='py-2 flex items-center justify-between'>
              <span>{m.name}</span>
              <span className='font-mono'>{m.value}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
        <h2 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
          Логи активности
        </h2>
        <div className='text-gray-500'>Логи пользователей и ИИ будут отображаться здесь...</div>
      </div>
    </div>
  );
};

export default SystemMonitoring;
