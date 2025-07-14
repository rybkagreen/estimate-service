import React, { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { addDocument } from '../store/slices/documentsSlice';
import { v4 as uuidv4 } from 'uuid';
import { parseFile } from '../services/fileService';

interface DocumentItem {
  id: string;
  name: string;
  type: string;
  size: string;
  updatedAt: string;
  author: string;
  status: 'draft' | 'review' | 'approved' | 'archived';
  tags: string[];
}

const mockDocuments: DocumentItem[] = [
  { 
    id: '1', 
    name: 'Договор подряда #123.pdf', 
    type: 'PDF', 
    size: '2.5 MB',
    updatedAt: '2025-07-10', 
    author: 'Иван Петров',
    status: 'approved',
    tags: ['Договор', 'Подряд']
  },
  { 
    id: '2', 
    name: 'Смета на строительство.xlsx', 
    type: 'XLSX', 
    size: '1.8 MB',
    updatedAt: '2025-07-09',
    author: 'Мария Сидорова',
    status: 'review',
    tags: ['Смета', 'Строительство']
  },
  { 
    id: '3', 
    name: 'Пояснительная записка.docx', 
    type: 'DOCX', 
    size: '0.5 MB',
    updatedAt: '2025-07-08',
    author: 'Алексей Козлов',
    status: 'draft',
    tags: ['Документация']
  },
];

const getStatusBadgeClass = (status: DocumentItem['status']) => {
  switch (status) {
    case 'approved':
      return 'badge badge-approved';
    case 'review':
      return 'badge badge-pending';
    case 'draft':
      return 'badge badge-draft';
    case 'archived':
      return 'badge badge-rejected';
    default:
      return 'badge';
  }
};

const getFileIcon = (type: string) => {
  switch (type) {
    case 'PDF':
      return (
        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-5L9 2H4z" clipRule="evenodd" />
        </svg>
      );
    case 'XLSX':
      return (
        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-5L9 2H4z" clipRule="evenodd" />
        </svg>
      );
    case 'DOCX':
      return (
        <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-5L9 2H4z" clipRule="evenodd" />
        </svg>
      );
    default:
      return (
        <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-5L9 2H4z" clipRule="evenodd" />
        </svg>
      );
  }
};

const DocumentManagement: React.FC = () => {
  const dispatch = useDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [documents, setDocuments] = useState(mockDocuments);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  
  const filtered = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase()) ||
                         doc.author.toLowerCase().includes(search.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = selectedStatus === 'all' || doc.status === selectedStatus;
    const matchesType = selectedType === 'all' || doc.type === selectedType;
    
    return matchesSearch && matchesStatus && matchesType;
  });
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const parsed = await parseFile(file);
      const newDoc: DocumentItem = {
        id: uuidv4(),
        name: file.name,
        type: file.name.split('.').pop()?.toUpperCase() || 'FILE',
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        updatedAt: new Date().toISOString().split('T')[0],
        author: 'Текущий пользователь',
        status: 'draft',
        tags: []
      };
      setDocuments(prev => [newDoc, ...prev]);
      dispatch(addDocument({
        id: newDoc.id,
        name: parsed.name,
        type: parsed.type,
        content: parsed.content,
        file,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
    }
  };
  
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedDocs(filtered.map(doc => doc.id));
    } else {
      setSelectedDocs([]);
    }
  };
  
  const handleSelectDoc = (docId: string) => {
    setSelectedDocs(prev => {
      if (prev.includes(docId)) {
        return prev.filter(id => id !== docId);
      } else {
        return [...prev, docId];
      }
    });
  };
  
  const handleDeleteSelected = () => {
    if (window.confirm(`Удалить ${selectedDocs.length} документов?`)) {
      setDocuments(prev => prev.filter(doc => !selectedDocs.includes(doc.id)));
      setSelectedDocs([]);
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>Управление документами</h1>
        <div className='flex gap-2'>
          <input
            ref={fileInputRef}
            type='file'
            multiple
            className='hidden'
            onChange={handleFileUpload}
            accept='.pdf,.xlsx,.xls,.doc,.docx,.txt,.csv'
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2'
          >
            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12' />
            </svg>
            Загрузить
          </button>
        </div>
      </div>
      
      <div className='flex flex-col md:flex-row gap-4'>
        <div className='flex-1'>
          <input
            className='w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            placeholder='Поиск по названию, автору или тегам...'
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          value={selectedStatus}
          onChange={e => setSelectedStatus(e.target.value)}
          className='border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
        >
          <option value='all'>Все статусы</option>
          <option value='draft'>Черновик</option>
          <option value='review'>На рассмотрении</option>
          <option value='approved'>Утверждено</option>
          <option value='archived'>В архиве</option>
        </select>
        <select
          value={selectedType}
          onChange={e => setSelectedType(e.target.value)}
          className='border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
        >
          <option value='all'>Все типы</option>
          <option value='PDF'>PDF</option>
          <option value='XLSX'>Excel</option>
          <option value='DOCX'>Word</option>
        </select>
      </div>
      
      {selectedDocs.length > 0 && (
        <div className='bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-center justify-between'>
          <span className='text-sm text-blue-700 dark:text-blue-300'>
            Выбрано {selectedDocs.length} документов
          </span>
          <div className='flex gap-2'>
            <button
              onClick={handleDeleteSelected}
              className='text-sm text-red-600 hover:text-red-700 font-medium'
            >
              Удалить выбранное
            </button>
            <button
              onClick={() => setSelectedDocs([])}
              className='text-sm text-gray-600 hover:text-gray-700'
            >
              Отменить
            </button>
          </div>
        </div>
      )}
      
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden'>
        <table className='min-w-full'>
          <thead className='bg-gray-50 dark:bg-gray-700'>
            <tr>
              <th className='px-6 py-3 text-left'>
                <input
                  type='checkbox'
                  checked={selectedDocs.length === filtered.length && filtered.length > 0}
                  onChange={handleSelectAll}
                  className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                />
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                Документ
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                Автор
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                Статус
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                Размер
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                Обновлено
              </th>
              <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                Действия
              </th>
            </tr>
          </thead>
          <tbody className='bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700'>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className='px-6 py-8 text-center text-gray-500'>
                  Нет документов
                </td>
              </tr>
            ) : (
              filtered.map(doc => (
                <tr key={doc.id} className='hover:bg-gray-50 dark:hover:bg-gray-700'>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <input
                      type='checkbox'
                      checked={selectedDocs.includes(doc.id)}
                      onChange={() => handleSelectDoc(doc.id)}
                      className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                    />
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='flex items-center'>
                      {getFileIcon(doc.type)}
                      <div className='ml-3'>
                        <div className='text-sm font-medium text-gray-900 dark:text-white'>
                          {doc.name}
                        </div>
                        <div className='text-sm text-gray-500 dark:text-gray-400'>
                          {doc.tags.map(tag => (
                            <span key={tag} className='tag tag-sm mr-1'>{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='text-sm text-gray-900 dark:text-white'>{doc.author}</div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <span className={getStatusBadgeClass(doc.status)}>
                      {doc.status === 'draft' && 'Черновик'}
                      {doc.status === 'review' && 'На рассмотрении'}
                      {doc.status === 'approved' && 'Утверждено'}
                      {doc.status === 'archived' && 'В архиве'}
                    </span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>
                    {doc.size}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>
                    {doc.updatedAt}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                    <button className='text-blue-600 hover:text-blue-900 dark:hover:text-blue-400 mr-3'>
                      Скачать
                    </button>
                    <button className='text-indigo-600 hover:text-indigo-900 dark:hover:text-indigo-400 mr-3'>
                      Подписать
                    </button>
                    <button className='text-red-600 hover:text-red-900 dark:hover:text-red-400'>
                      Удалить
                    </button>
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

export default DocumentManagement;
