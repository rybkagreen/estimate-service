import React, { useState } from 'react';

interface ReportItem {
  id: string;
  title: string;
  createdAt: string;
  type: string;
}

const mockReports: ReportItem[] = [
  { id: '1', title: 'Финансовый отчет за июнь', createdAt: '2025-07-01', type: 'Финансы' },
  { id: '2', title: 'Отчет по проекту X', createdAt: '2025-06-28', type: 'Проект' },
];

const Reports: React.FC = () => {
  const [search, setSearch] = useState('');
  const filtered = mockReports.filter(r => r.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>Отчеты</h1>
        <input
          className='border rounded px-2 py-1'
          placeholder='Поиск по отчетам...'
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
        <table className='min-w-full'>
          <thead>
            <tr>
              <th className='px-4 py-2 text-left'>Название</th>
              <th className='px-4 py-2 text-left'>Тип</th>
              <th className='px-4 py-2 text-left'>Создан</th>
              <th className='px-4 py-2'>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className='text-center p-4'>
                  Нет отчетов
                </td>
              </tr>
            ) : (
              filtered.map(report => (
                <tr key={report.id} className='border-t'>
                  <td className='px-4 py-2'>{report.title}</td>
                  <td className='px-4 py-2'>{report.type}</td>
                  <td className='px-4 py-2'>{report.createdAt}</td>
                  <td className='px-4 py-2 flex gap-2'>
                    <button className='text-blue-600 hover:underline'>Скачать</button>
                    <button className='text-green-600 hover:underline'>Визуализировать</button>
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

export default Reports;
