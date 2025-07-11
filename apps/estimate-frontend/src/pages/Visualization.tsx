import React from 'react';
import { Bar, Pie } from 'react-chartjs-2';

const mockBarData = {
  labels: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'],
  datasets: [
    {
      label: 'Сметы завершены',
      data: [5, 8, 6, 10, 7, 12],
      backgroundColor: 'rgba(59, 130, 246, 0.7)',
    },
  ],
};

const mockPieData = {
  labels: ['В работе', 'Завершено', 'Просрочено'],
  datasets: [
    {
      data: [12, 30, 3],
      backgroundColor: [
        'rgba(59, 130, 246, 0.7)',
        'rgba(16, 185, 129, 0.7)',
        'rgba(239, 68, 68, 0.7)',
      ],
    },
  ],
};

const Visualization: React.FC = () => {
  return (
    <div className='space-y-6'>
      <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>Визуализация данных</h1>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
          <h2 className='text-lg font-semibold mb-4'>Динамика завершения смет</h2>
          <Bar data={mockBarData} />
        </div>
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
          <h2 className='text-lg font-semibold mb-4'>Статус смет</h2>
          <Pie data={mockPieData} />
        </div>
      </div>
    </div>
  );
};

export default Visualization;
