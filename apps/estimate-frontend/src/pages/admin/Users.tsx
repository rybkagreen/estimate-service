import React, { useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const mockUsers: User[] = [
  { id: '1', name: 'Иван Иванов', email: 'ivan@example.com', role: 'admin' },
  { id: '2', name: 'Мария Смирнова', email: 'maria@example.com', role: 'manager' },
];

const Users: React.FC = () => {
  const [search, setSearch] = useState('');
  const filtered = mockUsers.filter(
    u =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>Пользователи</h1>
        <input
          className='border rounded px-2 py-1'
          placeholder='Поиск по пользователям...'
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
        <table className='min-w-full'>
          <thead>
            <tr>
              <th className='px-4 py-2 text-left'>Имя</th>
              <th className='px-4 py-2 text-left'>Email</th>
              <th className='px-4 py-2 text-left'>Роль</th>
              <th className='px-4 py-2'>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className='text-center p-4'>
                  Нет пользователей
                </td>
              </tr>
            ) : (
              filtered.map(user => (
                <tr key={user.id} className='border-t'>
                  <td className='px-4 py-2'>{user.name}</td>
                  <td className='px-4 py-2'>{user.email}</td>
                  <td className='px-4 py-2'>{user.role}</td>
                  <td className='px-4 py-2 flex gap-2'>
                    <button className='text-blue-600 hover:underline'>Изменить</button>
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

export default Users;
