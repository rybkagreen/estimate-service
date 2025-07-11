import React, { useState } from 'react';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
}

const mockTeam: TeamMember[] = [
  { id: '1', name: 'Иван Иванов', role: 'Руководитель проекта', email: 'ivanov@estimate.local' },
  { id: '2', name: 'Мария Смирнова', role: 'Инженер-сметчик', email: 'smirnova@estimate.local' },
  { id: '3', name: 'Петр Кузнецов', role: 'Аналитик', email: 'kuznetsov@estimate.local' },
];

const Team: React.FC = () => {
  const [search, setSearch] = useState('');
  const filtered = mockTeam.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>Команда</h1>
        <input
          className='border rounded px-2 py-1'
          placeholder='Поиск по имени...'
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
        <table className='min-w-full'>
          <thead>
            <tr>
              <th className='px-4 py-2 text-left'>Имя</th>
              <th className='px-4 py-2 text-left'>Роль</th>
              <th className='px-4 py-2 text-left'>Email</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={3} className='text-center p-4'>
                  Нет участников
                </td>
              </tr>
            ) : (
              filtered.map(member => (
                <tr key={member.id} className='border-t'>
                  <td className='px-4 py-2'>{member.name}</td>
                  <td className='px-4 py-2'>{member.role}</td>
                  <td className='px-4 py-2'>{member.email}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Team;
