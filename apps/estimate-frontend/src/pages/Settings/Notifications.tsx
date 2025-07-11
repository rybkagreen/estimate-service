import React, { useState } from 'react';

const NotificationsSettings: React.FC = () => {
  const [email, setEmail] = useState(true);
  const [push, setPush] = useState(false);

  return (
    <div className='max-w-xl mx-auto py-10 space-y-6'>
      <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>Уведомления</h1>
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4'>
        <div className='flex items-center justify-between'>
          <span>Email-уведомления</span>
          <input type='checkbox' checked={email} onChange={() => setEmail(e => !e)} />
        </div>
        <div className='flex items-center justify-between'>
          <span>Push-уведомления</span>
          <input type='checkbox' checked={push} onChange={() => setPush(p => !p)} />
        </div>
        <div className='text-gray-500 text-sm'>
          Настройки уведомлений применяются только для текущей сессии.
        </div>
      </div>
    </div>
  );
};

export default NotificationsSettings;
