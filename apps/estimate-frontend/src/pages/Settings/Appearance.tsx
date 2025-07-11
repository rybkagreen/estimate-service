import React, { useState } from 'react';

const Appearance: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  return (
    <div className='max-w-xl mx-auto py-10 space-y-6'>
      <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>Внешний вид</h1>
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4'>
        <div>
          <label className='block mb-2 font-semibold'>Тема оформления</label>
          <select
            className='border rounded px-2 py-1'
            value={theme}
            onChange={e => setTheme(e.target.value as 'light' | 'dark')}
          >
            <option value='light'>Светлая</option>
            <option value='dark'>Тёмная</option>
          </select>
        </div>
        <div className='text-gray-500 text-sm'>
          Настройки темы применяются только для текущей сессии.
        </div>
      </div>
    </div>
  );
};

export default Appearance;
