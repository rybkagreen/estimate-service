import React, { useState } from 'react';

const Backup: React.FC = () => {
  const [lastBackup, setLastBackup] = useState('2025-07-10 14:00');
  const [message, setMessage] = useState('');

  const handleBackup = () => {
    setLastBackup(new Date().toLocaleString());
    setMessage('Резервная копия успешно создана!');
  };

  const handleRestore = () => {
    setMessage('Восстановление из резервной копии выполнено!');
  };

  return (
    <div className='max-w-xl mx-auto py-10 space-y-6'>
      <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>Резервное копирование</h1>
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4'>
        <div>
          Последняя копия: <span className='font-semibold'>{lastBackup}</span>
        </div>
        <div className='flex gap-4 mt-4'>
          <button className='bg-blue-600 text-white px-4 py-2 rounded' onClick={handleBackup}>
            Создать копию
          </button>
          <button className='bg-green-600 text-white px-4 py-2 rounded' onClick={handleRestore}>
            Восстановить
          </button>
        </div>
        {message && <div className='text-sm text-center mt-2 text-blue-600'>{message}</div>}
      </div>
    </div>
  );
};

export default Backup;
