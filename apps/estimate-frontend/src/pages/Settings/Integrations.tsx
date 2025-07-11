import React from 'react';

const mockIntegrations = [
  { id: '1', name: 'Telegram', enabled: true },
  { id: '2', name: 'Slack', enabled: false },
  { id: '3', name: 'Email', enabled: true },
];

const IntegrationsSettings: React.FC = () => (
  <div className='max-w-xl mx-auto py-10 space-y-6'>
    <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>Интеграции</h1>
    <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4'>
      <table className='min-w-full'>
        <thead>
          <tr>
            <th className='px-4 py-2 text-left'>Сервис</th>
            <th className='px-4 py-2 text-left'>Статус</th>
          </tr>
        </thead>
        <tbody>
          {mockIntegrations.length === 0 ? (
            <tr>
              <td colSpan={2} className='text-center p-4'>
                Нет интеграций
              </td>
            </tr>
          ) : (
            mockIntegrations.map(integ => (
              <tr key={integ.id} className='border-t'>
                <td className='px-4 py-2'>{integ.name}</td>
                <td className='px-4 py-2 font-semibold'>
                  {integ.enabled ? (
                    <span className='text-green-600'>Включено</span>
                  ) : (
                    <span className='text-gray-400'>Отключено</span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export default IntegrationsSettings;
