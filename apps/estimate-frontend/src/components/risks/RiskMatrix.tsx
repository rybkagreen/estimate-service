import React from 'react';

interface Risk {
  id: string;
  title: string;
  probability: 'Низкая' | 'Средняя' | 'Высокая';
  impact: 'Низкий' | 'Средний' | 'Высокий';
  mitigation: string;
}

const mockRisks: Risk[] = [
  {
    id: '1',
    title: 'Рост цен на материалы',
    probability: 'Высокая',
    impact: 'Средний',
    mitigation: 'Заключить долгосрочные контракты',
  },
  {
    id: '2',
    title: 'Задержка поставок',
    probability: 'Средняя',
    impact: 'Высокий',
    mitigation: 'Иметь резервных поставщиков',
  },
];

const RiskMatrix: React.FC = () => {
  return (
    <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
      <h2 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>Матрица рисков</h2>
      <table className='min-w-full mb-4'>
        <thead>
          <tr>
            <th className='px-4 py-2 text-left'>Риск</th>
            <th className='px-4 py-2 text-left'>Вероятность</th>
            <th className='px-4 py-2 text-left'>Влияние</th>
            <th className='px-4 py-2 text-left'>План митигации</th>
          </tr>
        </thead>
        <tbody>
          {mockRisks.map(risk => (
            <tr key={risk.id} className='border-t'>
              <td className='px-4 py-2'>{risk.title}</td>
              <td className='px-4 py-2'>{risk.probability}</td>
              <td className='px-4 py-2'>{risk.impact}</td>
              <td className='px-4 py-2'>{risk.mitigation}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className='text-gray-500 text-sm'>
        * Для каждого риска предусмотрен план реагирования
      </div>
    </div>
  );
};

export default RiskMatrix;
