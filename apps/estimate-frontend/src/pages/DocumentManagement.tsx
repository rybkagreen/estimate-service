import React, { useState } from 'react';

interface DocumentItem {
  id: string;
  name: string;
  type: string;
  updatedAt: string;
}

const mockDocuments: DocumentItem[] = [
  { id: '1', name: 'Договор.pdf', type: 'PDF', updatedAt: '2025-07-10' },
  { id: '2', name: 'Смета.xlsx', type: 'XLSX', updatedAt: '2025-07-09' },
  { id: '3', name: 'Пояснительная записка.docx', type: 'DOCX', updatedAt: '2025-07-08' },
];

const DocumentManagement: React.FC = () => {
  const [search, setSearch] = useState('');
  const filtered = mockDocuments.filter(doc =>
    doc.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>Документы</h1>
        <input
          className='border rounded px-2 py-1'
          placeholder='Поиск по документам...'
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
              <th className='px-4 py-2 text-left'>Обновлено</th>
              <th className='px-4 py-2'>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className='text-center p-4'>
                  Нет документов
                </td>
              </tr>
            ) : (
              filtered.map(doc => (
                <tr key={doc.id} className='border-t'>
                  <td className='px-4 py-2'>{doc.name}</td>
                  <td className='px-4 py-2'>{doc.type}</td>
                  <td className='px-4 py-2'>{doc.updatedAt}</td>
                  <td className='px-4 py-2 flex gap-2'>
                    <button className='text-blue-600 hover:underline'>Скачать</button>
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

export default DocumentManagement;
