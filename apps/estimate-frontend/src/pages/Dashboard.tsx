import React from 'react';
import { useGetDashboardStatsQuery } from '../store/api/dashboardApi';

const Dashboard: React.FC = () => {
  const { data, isLoading, error } = useGetDashboardStatsQuery();

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>Панель управления</h1>
      </div>
      {isLoading ? (
        <div className='text-center p-8'>Загрузка...</div>
      ) : error ? (
        <div className='text-red-600'>Ошибка загрузки статистики</div>
      ) : data ? (
        <>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            <div className='bg-white dark:bg-gray-800 rounded-lg p-6 shadow'>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
                Активные проекты
              </h3>
              <p className='text-3xl font-bold text-blue-600'>{data.activeProjects}</p>
            </div>
            <div className='bg-white dark:bg-gray-800 rounded-lg p-6 shadow'>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
                Сметы в работе
              </h3>
              <p className='text-3xl font-bold text-green-600'>{data.estimatesInProgress}</p>
            </div>
            <div className='bg-white dark:bg-gray-800 rounded-lg p-6 shadow'>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
                Завершённые сметы
              </h3>
              <p className='text-3xl font-bold text-purple-600'>{data.completedEstimates}</p>
            </div>
            <div className='bg-white dark:bg-gray-800 rounded-lg p-6 shadow'>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
                Экономия средств
              </h3>
              <p className='text-3xl font-bold text-red-600'>₽{data.savings.toLocaleString()}</p>
            </div>
          </div>
          <div className='mt-8'>
            <h2 className='text-xl font-bold mb-4 text-gray-900 dark:text-white'>
              Критические задачи
            </h2>
            {data.criticalTasks.length === 0 ? (
              <div className='text-gray-500'>Нет критических задач</div>
            ) : (
              <ul className='divide-y divide-gray-200 dark:divide-gray-700'>
                {data.criticalTasks.map(task => (
                  <li key={task.id} className='py-2 flex items-center justify-between'>
                    <span>{task.title}</span>
                    <span className='text-xs px-2 py-1 rounded bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200'>
                      {task.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
};

export default Dashboard;
