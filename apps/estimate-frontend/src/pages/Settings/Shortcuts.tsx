import React, { useState } from 'react';

const defaultShortcuts = [
  { id: '1', action: 'Создать проект', keys: 'Ctrl+N' },
  { id: '2', action: 'Сохранить', keys: 'Ctrl+S' },
  { id: '3', action: 'Поиск', keys: 'Ctrl+F' },
];

const Shortcuts: React.FC = () => {
  const [shortcuts] = useState(defaultShortcuts);

  return (
    <div className='max-w-xl mx-auto py-10 space-y-6'>
      <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>Горячие клавиши</h1>
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4'>
        <table className='min-w-full'>
          <thead>
            <tr>
              <th className='px-4 py-2 text-left'>Действие</th>
              <th className='px-4 py-2 text-left'>Сочетание клавиш</th>
            </tr>
          </thead>
          <tbody>
            {shortcuts.length === 0 ? (
              <tr>
                <td colSpan={2} className='text-center p-4'>
                  Нет горячих клавиш
                </td>
              </tr>
            ) : (
              shortcuts.map(s => (
                <tr key={s.id} className='border-t'>
                  <td className='px-4 py-2'>{s.action}</td>
                  <td className='px-4 py-2'>{s.keys}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Shortcuts;
