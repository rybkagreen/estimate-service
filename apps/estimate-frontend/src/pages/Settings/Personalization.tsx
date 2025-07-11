import React, { useState } from 'react';

const Personalization: React.FC = () => {
  const [language, setLanguage] = useState('ru');
  const [dateFormat, setDateFormat] = useState('DD.MM.YYYY');

  return (
    <div className='max-w-xl mx-auto py-10 space-y-6'>
      <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>Персонализация</h1>
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4'>
        <div>
          <label className='block mb-2 font-semibold'>Язык интерфейса</label>
          <select
            className='border rounded px-2 py-1'
            value={language}
            onChange={e => setLanguage(e.target.value)}
          >
            <option value='ru'>Русский</option>
            <option value='en'>English</option>
          </select>
        </div>
        <div>
          <label className='block mb-2 font-semibold'>Формат даты</label>
          <select
            className='border rounded px-2 py-1'
            value={dateFormat}
            onChange={e => setDateFormat(e.target.value)}
          >
            <option value='DD.MM.YYYY'>ДД.ММ.ГГГГ</option>
            <option value='YYYY-MM-DD'>ГГГГ-ММ-ДД</option>
          </select>
        </div>
        <div className='text-gray-500 text-sm'>
          Настройки применяются только для текущей сессии.
        </div>
      </div>
    </div>
  );
};

export default Personalization;
