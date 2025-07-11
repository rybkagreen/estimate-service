import React, { useState } from 'react';

interface TemplateItem {
  id: string;
  name: string;
  description: string;
  updatedAt: string;
}

const mockTemplates: TemplateItem[] = [
  { id: '1', name: 'Базовый шаблон', description: 'Для стандартных смет', updatedAt: '2025-07-10' },
  { id: '2', name: 'Шаблон договора', description: 'Для договоров', updatedAt: '2025-07-08' },
];

const Templates: React.FC = () => {
  const [search, setSearch] = useState('');
  const filtered = mockTemplates.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>Шаблоны</h1>
        <input
          className='border rounded px-2 py-1'
          placeholder='Поиск по шаблонам...'
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
        <table className='min-w-full'>
          <thead>
            <tr>
              <th className='px-4 py-2 text-left'>Название</th>
              <th className='px-4 py-2 text-left'>Описание</th>
              <th className='px-4 py-2 text-left'>Обновлено</th>
              <th className='px-4 py-2'>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className='text-center p-4'>
                  Нет шаблонов
                </td>
              </tr>
            ) : (
              filtered.map(tpl => (
                <tr key={tpl.id} className='border-t'>
                  <td className='px-4 py-2'>{tpl.name}</td>
                  <td className='px-4 py-2'>{tpl.description}</td>
                  <td className='px-4 py-2'>{tpl.updatedAt}</td>
                  <td className='px-4 py-2 flex gap-2'>
                    <button className='text-blue-600 hover:underline'>Редактировать</button>
                    <button className='text-red-600 hover:underline'>Удалить</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Templates;
