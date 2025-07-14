import React, { useState } from 'react';

interface Risk {
  id: string;
  title: string;
  description: string;
  category: 'financial' | 'technical' | 'legal' | 'environmental' | 'personnel';
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  severity: 'low' | 'medium' | 'high' | 'critical';
  mitigation: string;
  owner: string;
  dueDate: string;
  status: 'identified' | 'mitigating' | 'resolved' | 'accepted';
}

const mockRisks: Risk[] = [
  {
    id: '1',
    title: 'Рост цен на материалы',
    description: 'Ожидается рост цен на строительные материалы на 15-20%',
    category: 'financial',
    probability: 'high',
    impact: 'medium',
    severity: 'high',
    mitigation: 'Заключить долгосрочные контракты с фиксированными ценами',
    owner: 'Мария Сидорова',
    dueDate: '2025-07-30',
    status: 'mitigating'
  },
  {
    id: '2',
    title: 'Задержка поставок',
    description: 'Риск задержки поставок ключевых материалов',
    category: 'technical',
    probability: 'medium',
    impact: 'high',
    severity: 'high',
    mitigation: 'Подготовить список резервных поставщиков',
    owner: 'Иван Петров',
    dueDate: '2025-07-25',
    status: 'identified'
  },
  {
    id: '3',
    title: 'Нехватка квалифицированных рабочих',
    description: 'Дефицит квалифицированных специалистов на рынке',
    category: 'personnel',
    probability: 'high',
    impact: 'high',
    severity: 'critical',
    mitigation: 'Начать поиск и привлечение специалистов заранее',
    owner: 'Алексей Козлов',
    dueDate: '2025-07-20',
    status: 'mitigating'
  },
];

const RiskMatrix: React.FC = () => {
  return (
    <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
      <h2 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>Матрица рисков</h2>
      <div className='bg-white dark:bg-gray-900 shadow overflow-hidden sm:rounded-md'>
        <ul className='divide-y divide-gray-200 dark:divide-gray-700'>
          {mockRisks.map(risk => (
            <li key={risk.id} className='px-4 py-4 sm:px-6'>
              <div className='flex items-center justify-between'>
                <p className='text-sm font-medium text-indigo-600 truncate'>{risk.title}</p>
                <div className='ml-2 flex-shrink-0 flex'>
                  <span className={`badge badge-${risk.severity}`}>{risk.severity}</span>
                </div>
              </div>
              <div className='mt-2 sm:flex sm:justify-between'>
                <p className='flex items-center text-sm text-gray-500 dark:text-gray-400'>
                  <svg className='flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20' stroke='currentColor' aria-hidden='true'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 9V3.5a1 1 0 011-1h.01a1 1 0 011 1V9l3 2m0 7h5a2 2 0 002-2V6a2 2 0 00-2-2h-5L9 2H4a2 2 0 00-2 2v12a2 2 0 002 2h.5' />
                  </svg>
                  {risk.category}
                </p>
                <p className='mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400 sm:mt-0'>
                  <span className='flex items-center'>
                    <svg className='flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20' stroke='currentColor' aria-hidden='true'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 8h16M4 12h8m-8 4h16m-2 0a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2m0 4a2 2 0 002 2h6' />
                    </svg>
                    <span className='ml-2'>{risk.owner}</span>
                  </span>
                  <span className='ml-4 flex-shrink-0 flex items-center'>
                    <svg className='flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20' stroke='currentColor' aria-hidden='true'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 4h16v12H4V4z' />
                    </svg>
                    <span className='ml-2'>{risk.dueDate}</span>
                  </span>
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default RiskMatrix;
