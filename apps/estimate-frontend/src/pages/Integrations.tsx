import React from 'react';

const mockIntegrations = [
  { id: '1', name: '1C', status: 'active', description: 'Интеграция с 1C для обмена данными.' },
  { id: '2', name: 'SAP', status: 'inactive', description: 'Интеграция с SAP для выгрузки смет.' },
  { id: '3', name: 'Email', status: 'active', description: 'Уведомления по email.' },
];

const statusColor = {
  active: 'text-green-600',
  inactive: 'text-gray-400',
};

const Integrations: React.FC = () => (
  <div className='space-y-6'>
    <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>Интеграции</h1>
    <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
      <table className='min-w-full'>
        <thead>
          <tr>
            <th className='px-4 py-2 text-left'>Название</th>
            <th className='px-4 py-2 text-left'>Описание</th>
            <th className='px-4 py-2 text-left'>Статус</th>
          </tr>
        </thead>
        <tbody>
          {mockIntegrations.length === 0 ? (
            <tr>
              <td colSpan={3} className='text-center p-4'>
                Нет интеграций
              </td>
            </tr>
          ) : (
            mockIntegrations.map(integ => (
              <tr key={integ.id} className='border-t'>
                <td className='px-4 py-2'>{integ.name}</td>
                <td className='px-4 py-2'>{integ.description}</td>
                <td
                  className={`px-4 py-2 font-semibold ${
                    statusColor[integ.status as keyof typeof statusColor]
                  }`}
                >
                  {integ.status === 'active' ? 'Активна' : 'Отключена'}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export default Integrations;
