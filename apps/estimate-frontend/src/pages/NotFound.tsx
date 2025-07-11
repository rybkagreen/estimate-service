import React from 'react';

const NotFound: React.FC = () => (
  <div className='flex flex-col items-center justify-center min-h-[60vh]'>
    <h1 className='text-5xl font-bold text-gray-900 dark:text-white mb-4'>404</h1>
    <p className='text-lg text-gray-600 dark:text-gray-300 mb-6'>Страница не найдена</p>
    <a href='/' className='text-blue-600 hover:underline'>
      На главную
    </a>
  </div>
);

export default NotFound;
