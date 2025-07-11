import React from 'react';

const mockEvents = [
  { id: '1', title: 'Сдача сметы', date: '2025-07-15', type: 'deadline' },
  { id: '2', title: 'Совещание по проекту', date: '2025-07-13', type: 'meeting' },
  { id: '3', title: 'Обновление шаблонов', date: '2025-07-12', type: 'update' },
];

const typeColor = {
  deadline: 'bg-red-100 text-red-800',
  meeting: 'bg-blue-100 text-blue-800',
  update: 'bg-green-100 text-green-800',
};

const Calendar: React.FC = () => {
  return (
    <div className='space-y-6'>
      <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>Календарь</h1>
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
        <table className='min-w-full'>
          <thead>
            <tr>
              <th className='px-4 py-2 text-left'>Событие</th>
              <th className='px-4 py-2 text-left'>Дата</th>
              <th className='px-4 py-2 text-left'>Тип</th>
            </tr>
          </thead>
          <tbody>
            {mockEvents.length === 0 ? (
              <tr>
                <td colSpan={3} className='text-center p-4'>
                  Нет событий
                </td>
              </tr>
            ) : (
              mockEvents.map(ev => (
                <tr key={ev.id} className='border-t'>
                  <td className='px-4 py-2'>{ev.title}</td>
                  <td className='px-4 py-2'>{ev.date}</td>
                  <td
                    className={`px-4 py-2 font-semibold ${
                      typeColor[ev.type as keyof typeof typeColor]
                    }`}
                  >
                    {ev.type}
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

export default Calendar;
