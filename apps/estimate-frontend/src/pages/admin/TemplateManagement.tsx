import React from 'react';

const mockTemplates = [
  { id: '1', name: 'Шаблон сметы', version: 'v1.2', access: 'Глобальный' },
  { id: '2', name: 'Шаблон договора', version: 'v1.0', access: 'Только для админов' },
];

const TemplateManagement: React.FC = () => {
  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>Управление шаблонами</h1>
      </div>
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
        <table className='min-w-full'>
          <thead>
            <tr>
              <th className='px-4 py-2 text-left'>Название</th>
              <th className='px-4 py-2 text-left'>Версия</th>
              <th className='px-4 py-2 text-left'>Доступ</th>
              <th className='px-4 py-2'>Действия</th>
            </tr>
          </thead>
          <tbody>
            {mockTemplates.length === 0 ? (
              <tr>
                <td colSpan={4} className='text-center p-4'>
                  Нет шаблонов
                </td>
              </tr>
            ) : (
              mockTemplates.map(tpl => (
                <tr key={tpl.id} className='border-t'>
                  <td className='px-4 py-2'>{tpl.name}</td>
                  <td className='px-4 py-2'>{tpl.version}</td>
                  <td className='px-4 py-2'>{tpl.access}</td>
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

export default TemplateManagement;
