import React, { useState } from 'react';
import { useSearchQuery } from '../store/api/knowledgeApi';

const KnowledgeBase: React.FC = () => {
  const [search, setSearch] = useState('');
  const { data = [], isLoading, error } = useSearchQuery({ query: search });

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>База знаний</h1>
        <input
          className='border rounded px-2 py-1'
          placeholder='Поиск по статьям...'
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
        {isLoading ? (
          <div className='text-center p-4'>Загрузка...</div>
        ) : error ? (
          <div className='text-center p-4 text-red-600'>Ошибка загрузки</div>
        ) : (
          <table className='min-w-full'>
            <thead>
              <tr>
                <th className='px-4 py-2 text-left'>Заголовок</th>
                <th className='px-4 py-2 text-left'>Описание</th>
                <th className='px-4 py-2 text-left'>Обновлено</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={3} className='text-center p-4'>
                    Нет статей
                  </td>
                </tr>
              ) : (
                data.map(article => (
                  <tr key={article.id} className='border-t'>
                    <td className='px-4 py-2'>{article.title}</td>
                    <td className='px-4 py-2'>{article.summary}</td>
                    <td className='px-4 py-2'>{article.updatedAt}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default KnowledgeBase;
