import React, { useState } from 'react';

interface NotificationItem {
  id: string;
  type: 'info' | 'warning' | 'error';
  message: string;
  date: string;
  read: boolean;
}

const mockNotifications: NotificationItem[] = [
  {
    id: '1',
    type: 'info',
    message: 'Проект "Смета 2025" обновлен.',
    date: '2025-07-11',
    read: false,
  },
  {
    id: '2',
    type: 'warning',
    message: 'Срок задачи "Анализ рисков" истекает завтра.',
    date: '2025-07-10',
    read: true,
  },
  {
    id: '3',
    type: 'error',
    message: 'Ошибка синхронизации с сервером.',
    date: '2025-07-09',
    read: false,
  },
];

const typeColor = {
  info: 'bg-blue-100 text-blue-800',
  warning: 'bg-yellow-100 text-yellow-800',
  error: 'bg-red-100 text-red-800',
};

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState(mockNotifications);

  const markAsRead = (id: string) => {
    setNotifications(n => n.map(item => (item.id === id ? { ...item, read: true } : item)));
  };

  return (
    <div className='space-y-6'>
      <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>Уведомления</h1>
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
        {notifications.length === 0 ? (
          <div className='text-center text-gray-500'>Нет уведомлений</div>
        ) : (
          <ul className='divide-y divide-gray-200 dark:divide-gray-700'>
            {notifications.map(n => (
              <li key={n.id} className='flex items-center justify-between py-3'>
                <div
                  className={`px-2 py-1 rounded ${
                    typeColor[n.type]
                  } mr-4 min-w-[100px] text-center`}
                >
                  {n.type.toUpperCase()}
                </div>
                <div className='flex-1 text-gray-900 dark:text-gray-100'>{n.message}</div>
                <div className='text-xs text-gray-500 mr-4'>{n.date}</div>
                {!n.read && (
                  <button
                    className='text-blue-600 hover:underline text-sm'
                    onClick={() => markAsRead(n.id)}
                  >
                    Отметить как прочитано
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Notifications;
