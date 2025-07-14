import React from 'react';
import { useGetDashboardStatsQuery } from '../store/api/dashboardApi';
import RiskMatrix from '../components/risks/RiskMatrix';
import ChangeRequests from '../components/changes/ChangeRequests';

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
      ) : data ? (<>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            <div className='metric-card'>
              <div className='metric-card-value'>{data.activeProjects}</div>
              <div className='metric-card-label'>Активные проекты</div>
            </div>
            <div className='metric-card'>
              <div className='metric-card-value'>{data.estimatesInProgress}</div>
              <div className='metric-card-label'>Сметы в работе</div>
            </div>
            <div className='metric-card'>
              <div className='metric-card-value'>{data.completedEstimates}</div>
              <div className='metric-card-label'>Завершённые сметы</div>
            </div>
            <div className='metric-card'>
              <div className='metric-card-value'>₽{data.savings.toLocaleString()}</div>
              <div className='metric-card-label'>Экономия средств</div>
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
          
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8'>
            <div>
              <h2 className='text-xl font-bold mb-4 text-gray-900 dark:text-white'>
                Управление рисками
              </h2>
              <RiskMatrix />
            </div>
            
            <div>
              <h2 className='text-xl font-bold mb-4 text-gray-900 dark:text-white'>
                Запросы на изменение
              </h2>
              <ChangeRequests />
            </div>
          </div>
          
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8'>
            <div className='stats-widget'>
              <div className='stats-widget-header'>
                <h3 className='stats-widget-title'>Статус проектов</h3>
              </div>
              <div className='stats-list'>
                <div className='stats-item'>
                  <span className='stats-item-label'>В планировании</span>
                  <span className='stats-item-value'>3</span>
                </div>
                <div className='stats-item'>
                  <span className='stats-item-label'>В процессе</span>
                  <span className='stats-item-value'>7</span>
                </div>
                <div className='stats-item'>
                  <span className='stats-item-label'>На проверке</span>
                  <span className='stats-item-value'>2</span>
                </div>
                <div className='stats-item'>
                  <span className='stats-item-label'>Завершено</span>
                  <span className='stats-item-value'>15</span>
                </div>
              </div>
            </div>
            
            <div className='stats-widget'>
              <div className='stats-widget-header'>
                <h3 className='stats-widget-title'>Бюджет проектов</h3>
              </div>
              <div className='space-y-3'>
                <div>
                  <div className='progress-label'>
                    <span className='progress-label-text'>Использовано</span>
                    <span className='progress-label-value'>65%</span>
                  </div>
                  <div className='progress-bar'>
                    <div className='progress-bar-fill' style={{ width: '65%' }}></div>
                  </div>
                </div>
                <div className='stats-list mt-3'>
                  <div className='stats-item'>
                    <span className='stats-item-label'>Выделено</span>
                    <span className='stats-item-value'>₽12.5M</span>
                  </div>
                  <div className='stats-item'>
                    <span className='stats-item-label'>Использовано</span>
                    <span className='stats-item-value'>₽8.1M</span>
                  </div>
                  <div className='stats-item'>
                    <span className='stats-item-label'>Остаток</span>
                    <span className='stats-item-value'>₽4.4M</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className='stats-widget'>
              <div className='stats-widget-header'>
                <h3 className='stats-widget-title'>Активность команды</h3>
              </div>
              <div className='activity-feed'>
                <div className='activity-item'>
                  <div className='activity-avatar'>ИП</div>
                  <div className='activity-content'>
                    <div className='activity-text'>Иван Петров обновил смету #1234</div>
                    <div className='activity-time'>2 часа назад</div>
                  </div>
                </div>
                <div className='activity-item'>
                  <div className='activity-avatar'>МС</div>
                  <div className='activity-content'>
                    <div className='activity-text'>Мария Сидорова утвердила проект</div>
                    <div className='activity-time'>5 часов назад</div>
                  </div>
                </div>
                <div className='activity-item'>
                  <div className='activity-avatar'>АК</div>
                  <div className='activity-content'>
                    <div className='activity-text'>Алексей Козлов добавил новую смету</div>
                    <div className='activity-time'>1 день назад</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default Dashboard;
