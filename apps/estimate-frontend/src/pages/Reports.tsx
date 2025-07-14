import React, { useState } from 'react';

interface ReportItem {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  type: 'financial' | 'project' | 'analytics' | 'audit';
  format: 'pdf' | 'excel' | 'word';
  size: string;
  author: string;
  status: 'generating' | 'ready' | 'error';
}

const mockReports: ReportItem[] = [
  { 
    id: '1', 
    title: 'Финансовый отчет за июнь 2025', 
    description: 'Полный финансовый отчет с анализом затрат и доходов',
    createdAt: '2025-07-01', 
    type: 'financial',
    format: 'pdf',
    size: '3.2 MB',
    author: 'Мария Сидорова',
    status: 'ready'
  },
  { 
    id: '2', 
    title: 'Отчет по проекту "ЖК Новый Горизонт"', 
    description: 'Детальный отчет о ходе выполнения работ',
    createdAt: '2025-06-28', 
    type: 'project',
    format: 'excel',
    size: '1.8 MB',
    author: 'Иван Петров',
    status: 'ready'
  },
  { 
    id: '3', 
    title: 'Аналитика эффективности за Q2 2025', 
    description: 'Анализ KPI и метрик эффективности',
    createdAt: '2025-07-05', 
    type: 'analytics',
    format: 'pdf',
    size: '2.1 MB',
    author: 'Алексей Козлов',
    status: 'generating'
  },
];

const getTypeIcon = (type: ReportItem['type']) => {
  switch (type) {
    case 'financial':
      return (
        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'project':
      return (
        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      );
    case 'analytics':
      return (
        <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      );
    case 'audit':
      return (
        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
  }
};

const getFormatIcon = (format: ReportItem['format']) => {
  switch (format) {
    case 'pdf':
      return <span className="text-xs font-medium text-red-600">PDF</span>;
    case 'excel':
      return <span className="text-xs font-medium text-green-600">XLSX</span>;
    case 'word':
      return <span className="text-xs font-medium text-blue-600">DOCX</span>;
  }
};

const getStatusBadge = (status: ReportItem['status']) => {
  switch (status) {
    case 'ready':
      return <span className="badge badge-approved">Готов</span>;
    case 'generating':
      return <span className="badge badge-pending">Создается</span>;
    case 'error':
      return <span className="badge badge-rejected">Ошибка</span>;
  }
};

const Reports: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [reports, setReports] = useState(mockReports);
  
  const filtered = reports.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase()) ||
                         r.description.toLowerCase().includes(search.toLowerCase());
    const matchesType = selectedType === 'all' || r.type === selectedType;
    return matchesSearch && matchesType;
  });
  
  const handleGenerateReport = () => {
    const newReport: ReportItem = {
      id: Date.now().toString(),
      title: 'Новый отчет',
      description: 'Автоматически сгенерированный отчет',
      createdAt: new Date().toISOString().split('T')[0],
      type: 'analytics',
      format: 'pdf',
      size: '0 MB',
      author: 'Текущий пользователь',
      status: 'generating'
    };
    setReports([newReport, ...reports]);
    setShowGenerateModal(false);
    
    // Имитация генерации
    setTimeout(() => {
      setReports(prev => prev.map(r => 
        r.id === newReport.id 
          ? { ...r, status: 'ready' as const, size: '2.5 MB' }
          : r
      ));
    }, 3000);
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>Отчеты и аналитика</h1>
        <button
          onClick={() => setShowGenerateModal(true)}
          className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2'
        >
          <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
          </svg>
          Создать отчет
        </button>
      </div>
      
      <div className='flex flex-col md:flex-row gap-4'>
        <div className='flex-1'>
          <input
            className='w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            placeholder='Поиск по названию или описанию...'
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          value={selectedType}
          onChange={e => setSelectedType(e.target.value)}
          className='border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
        >
          <option value='all'>Все типы</option>
          <option value='financial'>Финансовые</option>
          <option value='project'>Проектные</option>
          <option value='analytics'>Аналитика</option>
          <option value='audit'>Аудит</option>
        </select>
      </div>
      
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {filtered.length === 0 ? (
          <div className='col-span-full text-center py-12 text-gray-500'>
            Нет отчетов
          </div>
        ) : (
          filtered.map(report => (
            <div key={report.id} className='bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6'>
              <div className='flex items-start justify-between mb-4'>
                <div className='flex items-center gap-3'>
                  {getTypeIcon(report.type)}
                  <div>
                    <h3 className='font-medium text-gray-900 dark:text-white'>{report.title}</h3>
                    <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>{report.description}</p>
                  </div>
                </div>
              </div>
              
              <div className='space-y-2 mb-4'>
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-gray-600 dark:text-gray-400'>Автор:</span>
                  <span className='text-gray-900 dark:text-white'>{report.author}</span>
                </div>
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-gray-600 dark:text-gray-400'>Формат:</span>
                  {getFormatIcon(report.format)}
                </div>
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-gray-600 dark:text-gray-400'>Размер:</span>
                  <span className='text-gray-900 dark:text-white'>{report.size}</span>
                </div>
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-gray-600 dark:text-gray-400'>Статус:</span>
                  {getStatusBadge(report.status)}
                </div>
              </div>
              
              <div className='flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700'>
                {report.status === 'ready' ? (
                  <>
                    <button className='flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium'>
                      Скачать
                    </button>
                    <button className='flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg text-sm font-medium'>
                      Просмотр
                    </button>
                  </>
                ) : report.status === 'generating' ? (
                  <div className='flex-1 flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400'>
                    <svg className='animate-spin h-4 w-4' fill='none' viewBox='0 0 24 24'>
                      <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                      <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                    </svg>
                    Создается...
                  </div>
                ) : (
                  <button className='flex-1 bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-700 dark:text-red-400 px-3 py-2 rounded-lg text-sm font-medium'>
                    Повторить
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Модальное окно генерации отчета */}
      {showGenerateModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <div className='bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6'>
            <h2 className='text-xl font-bold text-gray-900 dark:text-white mb-4'>Создать новый отчет</h2>
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                  Тип отчета
                </label>
                <select className='w-full border rounded-lg px-3 py-2'>
                  <option value='financial'>Финансовый</option>
                  <option value='project'>Проектный</option>
                  <option value='analytics'>Аналитический</option>
                  <option value='audit'>Аудит</option>
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                  Период
                </label>
                <select className='w-full border rounded-lg px-3 py-2'>
                  <option>Последний месяц</option>
                  <option>Последний квартал</option>
                  <option>Последний год</option>
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                  Формат
                </label>
                <select className='w-full border rounded-lg px-3 py-2'>
                  <option value='pdf'>PDF</option>
                  <option value='excel'>Excel</option>
                  <option value='word'>Word</option>
                </select>
              </div>
            </div>
            <div className='flex gap-2 mt-6'>
              <button
                onClick={handleGenerateReport}
                className='flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg'
              >
                Создать
              </button>
              <button
                onClick={() => setShowGenerateModal(false)}
                className='flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg'
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
