import React from 'react';

const mockBackups = [
  { id: '1', date: '2025-07-10', status: 'Успешно', size: '12 MB' },
  { id: '2', date: '2025-07-08', status: 'Успешно', size: '11 MB' },
];

const BackupRestore: React.FC = () => {
  return (
    <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
      <h2 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
        Резервное копирование
      </h2>
      <button className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg mb-4'>
        Создать резервную копию
      </button>
      <table className='min-w-full'>
        <thead>
          <tr>
            <th className='px-4 py-2 text-left'>Дата</th>
            <th className='px-4 py-2 text-left'>Статус</th>
            <th className='px-4 py-2 text-left'>Размер</th>
            <th className='px-4 py-2'>Действия</th>
          </tr>
        </thead>
        <tbody>
          {mockBackups.length === 0 ? (
            <tr>
              <td colSpan={4} className='text-center p-4'>
                Нет резервных копий
              </td>
            </tr>
          ) : (
            mockBackups.map(b => (
              <tr key={b.id} className='border-t'>
                <td className='px-4 py-2'>{b.date}</td>
                <td className='px-4 py-2'>{b.status}</td>
                <td className='px-4 py-2'>{b.size}</td>
                <td className='px-4 py-2 flex gap-2'>
                  <button className='text-green-600 hover:underline'>Восстановить</button>
                  <button className='text-red-600 hover:underline'>Удалить</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default BackupRestore;
