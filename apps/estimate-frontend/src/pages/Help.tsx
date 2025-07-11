import React from 'react';

const Help: React.FC = () => (
  <div className='max-w-2xl mx-auto py-10 space-y-6'>
    <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>Справка и поддержка</h1>
    <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4'>
      <section>
        <h2 className='text-lg font-semibold mb-2'>Часто задаваемые вопросы</h2>
        <ul className='list-disc pl-6 text-gray-800 dark:text-gray-200'>
          <li>Как создать новый проект?</li>
          <li>Как добавить пользователя?</li>
          <li>Как восстановить удалённую смету?</li>
        </ul>
      </section>
      <section>
        <h2 className='text-lg font-semibold mb-2'>Контакты поддержки</h2>
        <p>
          Email:{' '}
          <a href='mailto:support@estimate.local' className='text-blue-600 hover:underline'>
            support@estimate.local
          </a>
        </p>
        <p>
          Телефон: <span className='text-gray-900 dark:text-white'>+7 (495) 123-45-67</span>
        </p>
      </section>
      <section>
        <h2 className='text-lg font-semibold mb-2'>Документация</h2>
        <a href='/docs/user-guides/' className='text-blue-600 hover:underline'>
          Руководство пользователя
        </a>
      </section>
    </div>
  </div>
);

export default Help;
