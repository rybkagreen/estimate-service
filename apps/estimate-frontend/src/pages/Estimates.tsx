import axios from 'axios';
import 'jspdf-autotable';
import React, { useEffect, useState } from 'react';
import { downloadFile } from '../services/fileService';
import {
  useCreateEstimateMutation,
  useDeleteEstimateMutation,
  useGetEstimatesQuery,
  useUpdateEstimateStatusMutation,
} from '../store/api/estimateApi';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { selectEstimate } from '../store/slices/estimatesSlice';
import { addNotification, openModal, setSearchQuery } from '../store/slices/uiSlice';
import { EstimateStatus } from '../types/estimate.types';

const Estimates: React.FC = () => {
  const dispatch = useAppDispatch();
  const searchQuery = useAppSelector(state => state.ui.searchQuery);
  const [filter, setFilter] = useState<{ status?: EstimateStatus[] }>({});
  const [dateRange, setDateRange] = useState<{ from: string; to: string } | null>(null);
  const [project, setProject] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>('');
  const [editCost, setEditCost] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; id: string } | null>(null);
  const [aiCheckResult, setAICheckResult] = useState<string | null>(null);

  // RTK Query hooks
  const {
    data: estimatesData,
    error,
    isLoading,
    refetch,
  } = useGetEstimatesQuery({
    search: searchQuery,
    ...filter,
    project,
  });
  const [createEstimate, { isLoading: isCreating }] = useCreateEstimateMutation();
  const [deleteEstimate] = useDeleteEstimateMutation();
  const [updateStatus] = useUpdateEstimateStatusMutation();

  const handleCreateEstimate = () => {
    dispatch(openModal('createEstimate'));
  };

  const handleDeleteEstimate = async (id: string) => {
    try {
      await deleteEstimate(id).unwrap();
      dispatch(
        addNotification({
          type: 'success',
          message: 'Смета успешно удалена',
        }),
      );
    } catch (error) {
      dispatch(
        addNotification({
          type: 'error',
          message: 'Ошибка при удалении сметы',
        }),
      );
    }
  };

  const handleStatusChange = async (id: string, status: EstimateStatus) => {
    try {
      await updateStatus({ id, status }).unwrap();
      dispatch(
        addNotification({
          type: 'success',
          message: 'Статус сметы обновлен',
        }),
      );
    } catch (error) {
      dispatch(
        addNotification({
          type: 'error',
          message: 'Ошибка при обновлении статуса',
        }),
      );
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchQuery(e.target.value));
  };

  const handleFilterChange = (status: EstimateStatus | null) => {
    if (status) {
      setFilter({ status: [status] });
    } else {
      setFilter({});
    }
  };

  const handleDateChange = (from: string, to: string) => {
    setDateRange({ from, to });
  };

  const handleProjectChange = (projectId: string | null) => {
    setProject(projectId);
  };

  const handleEdit = (estimate: any) => {
    setEditingId(estimate.id);
    setEditName(estimate.name);
    setEditCost(estimate.totalCost.toString());
  };

  const handleEditSave = async (estimate: any) => {
    // TODO: заменить на RTK Query updateEstimate
    // await updateEstimate({ id: estimate.id, name: editName, totalCost: Number(editCost) })
    setEditingId(null);
  };

  const handleEditCancel = () => {
    setEditingId(null);
  };

  const allSelected = estimates.length > 0 && selectedIds.length === estimates.length;
  const toggleSelectAll = () => {
    setSelectedIds(allSelected ? [] : estimates.map(e => e.id));
  };
  const toggleSelect = (id: string) => {
    setSelectedIds(
      selectedIds.includes(id) ? selectedIds.filter(_id => _id !== id) : [...selectedIds, id],
    );
  };
  const handleMassDelete = async () => {
    for (const id of selectedIds) {
      await handleDeleteEstimate(id);
    }
    setSelectedIds([]);
  };
  const handleMassExport = (format: 'xlsx' | 'csv' | 'json' | 'pdf') => {
    const selectedEstimates = estimates.filter(e => selectedIds.includes(e.id));
    if (!selectedEstimates.length) return;
    // Переиспользуем handleExport, но с выбранными
    handleExport(format, selectedEstimates);
  };

  // Изменяем handleExport для поддержки передачи массива
  const handleExport = (format: 'xlsx' | 'csv' | 'json' | 'pdf', dataOverride?: any[]) => {
    const exportData = dataOverride || estimates;
    if (!exportData.length) return;
    let content: Blob | string;
    let filename = `estimates_export.${format}`;
    if (format === 'json') {
      content = JSON.stringify(exportData, null, 2);
      downloadFile(filename, content);
    } else if (format === 'csv') {
      const header = Object.keys(exportData[0]).join(',');
      const rows = exportData.map(e => Object.values(e).join(','));
      content = [header, ...rows].join('\n');
      downloadFile(filename, content);
    } else if (format === 'xlsx') {
      import('xlsx').then(XLSX => {
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Estimates');
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        downloadFile(filename, new Blob([wbout], { type: 'application/octet-stream' }));
      });
    } else if (format === 'pdf') {
      Promise.all([import('jspdf'), import('jspdf-autotable')]).then(
        ([jsPDFModule, autoTableModule]) => {
          const jsPDF = jsPDFModule.default;
          const autoTable = autoTableModule.default;
          const doc = new jsPDF();
          doc.setFontSize(14);
          doc.text('Экспорт смет', 14, 16);
          autoTable(doc, {
            head: [
              [
                '#',
                'Название',
                'Описание',
                'Сумма',
                'Валюта',
                'Статус',
                'Создано',
                'ID',
                'Проект',
                'Автор',
                'Последнее обновление',
              ],
            ],
            body: exportData.map((e, idx) => [
              idx + 1,
              e.name,
              e.description || '',
              e.totalCost,
              e.currency,
              e.status,
              new Date(e.createdAt).toLocaleDateString('ru-RU'),
              e.id,
              e.projectName || e.project || '',
              e.authorName || e.author || '',
              e.updatedAt ? new Date(e.updatedAt).toLocaleDateString('ru-RU') : '',
            ]),
            startY: 22,
            styles: { fontSize: 10 },
            headStyles: { fillColor: [41, 128, 185] },
            alternateRowStyles: { fillColor: [245, 245, 245] },
            margin: { left: 8, right: 8 },
            didDrawPage: (data: any) => {
              doc.setFontSize(10);
              doc.text(`Дата экспорта: ${new Date().toLocaleString('ru-RU')}`, 8, 8);
            },
          });
          // Добавляем футер с номером страницы
          const pageCount = doc.internal.getNumberOfPages();
          for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(9);
            doc.text(
              `Стр. ${i} из ${pageCount}`,
              doc.internal.pageSize.getWidth() - 30,
              doc.internal.pageSize.getHeight() - 10,
            );
          }
          doc.save(filename);
        },
      );
    }
  };

  const handleContextMenu = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, id });
  };

  const closeContextMenu = () => setContextMenu(null);

  const handleContextAction = (action: string, id: string) => {
    if (action === 'delete') handleDeleteEstimate(id);
    if (action === 'export') handleExport('pdf', [estimates.find(e => e.id === id)]);
    if (action === 'edit') handleEdit(estimates.find(e => e.id === id));
    if (action === 'ai-check') handleAICheck(id);
    closeContextMenu();
  };
  const handleAICheck = async (id: string) => {
    const estimate = estimates.find(e => e.id === id);
    if (!estimate) return;
    try {
      // 1. Создать сессию
      const sessionRes = await axios.post('/ai-assistant/chat/session', {
        userId: estimate.author || 'frontend-user',
      });
      const sessionId = sessionRes.data.id;
      // 2. Отправить смету как текст
      const message = `Проверь смету:\nНазвание: ${estimate.name}\nОписание: ${
        estimate.description || ''
      }\nСумма: ${estimate.totalCost} ${estimate.currency}\nСтатус: ${estimate.status}`;
      const msgRes = await axios.post(`/ai-assistant/chat/session/${sessionId}/message`, {
        message,
      });
      setAICheckResult(msgRes.data.response || 'Нет ответа от ИИ');
      dispatch(addNotification({ type: 'success', message: 'Смета отправлена на AI-проверку' }));
    } catch (e) {
      setAICheckResult('Ошибка при отправке на AI-проверку');
      dispatch(addNotification({ type: 'error', message: 'Ошибка AI-проверки' }));
    }
  };

  useEffect(() => {
    if (!contextMenu) return;
    const handler = () => closeContextMenu();
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, [contextMenu]);

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded'>
        Ошибка загрузки смет. Пожалуйста, попробуйте позже.
      </div>
    );
  }

  const estimates = estimatesData?.data || [];

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>Сметы</h1>
        <button
          onClick={handleCreateEstimate}
          disabled={isCreating}
          className='bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg transition-colors'
        >
          {isCreating ? 'Создание...' : 'Создать смету'}
        </button>
      </div>

      {/* Search and Filters */}
      <div className='flex gap-4 items-center flex-wrap'>
        <div className='flex-1 min-w-[200px]'>
          <input
            type='text'
            placeholder='Поиск смет...'
            value={searchQuery}
            onChange={handleSearch}
            className='w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          />
        </div>
        <select
          onChange={e => handleFilterChange(e.target.value as EstimateStatus | null)}
          className='px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
        >
          <option value=''>Все статусы</option>
          <option value={EstimateStatus.DRAFT}>Черновик</option>
          <option value={EstimateStatus.IN_REVIEW}>На проверке</option>
          <option value={EstimateStatus.APPROVED}>Утверждено</option>
          <option value={EstimateStatus.REJECTED}>Отклонено</option>
          <option value={EstimateStatus.ARCHIVED}>В архиве</option>
        </select>
        {/* Date filter */}
        <div className='flex items-center gap-2'>
          <input
            type='date'
            value={dateRange?.from || ''}
            onChange={e => handleDateChange(e.target.value, dateRange?.to || '')}
            className='px-2 py-1 border rounded'
          />
          <span>-</span>
          <input
            type='date'
            value={dateRange?.to || ''}
            onChange={e => handleDateChange(dateRange?.from || '', e.target.value)}
            className='px-2 py-1 border rounded'
          />
        </div>
        {/* Project filter (заглушка, заменить на реальные проекты) */}
        <select
          onChange={e => handleProjectChange(e.target.value || null)}
          className='px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
        >
          <option value=''>Все проекты</option>
          <option value='project1'>Проект 1</option>
          <option value='project2'>Проект 2</option>
        </select>
      </div>

      {/* Export buttons */}
      <div className='flex gap-2 mb-2'>
        <button
          onClick={() => handleExport('xlsx')}
          className='px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700'
        >
          Экспорт в XLSX
        </button>
        <button
          onClick={() => handleExport('csv')}
          className='px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700'
        >
          Экспорт в CSV
        </button>
        <button
          onClick={() => handleExport('json')}
          className='px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700'
        >
          Экспорт в JSON
        </button>
        <button
          onClick={() => handleExport('pdf')}
          className='px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700'
        >
          Экспорт в PDF
        </button>
      </div>

      {/* Панель массовых действий */}
      {selectedIds.length > 0 && (
        <div className='flex gap-2 mb-2 bg-blue-50 dark:bg-blue-900 p-2 rounded items-center'>
          <span className='font-medium'>Выбрано: {selectedIds.length}</span>
          <button
            onClick={handleMassDelete}
            className='px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700'
          >
            Удалить
          </button>
          <button
            onClick={() => handleMassExport('xlsx')}
            className='px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700'
          >
            Экспорт в XLSX
          </button>
          <button
            onClick={() => handleMassExport('csv')}
            className='px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700'
          >
            Экспорт в CSV
          </button>
          <button
            onClick={() => handleMassExport('json')}
            className='px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700'
          >
            Экспорт в JSON
          </button>
          <button
            onClick={() => handleMassExport('pdf')}
            className='px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700'
          >
            Экспорт в PDF
          </button>
        </div>
      )}

      {/* Estimates List */}
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden'>
        {estimates.length === 0 ? (
          <div className='p-6 text-center'>
            <p className='text-gray-600 dark:text-gray-400'>
              Сметы не найдены. Создайте первую смету для начала работы.
            </p>
          </div>
        ) : (
          <div className='divide-y divide-gray-200 dark:divide-gray-700'>
            {estimates.map(estimate => (
              <div
                key={estimate.id}
                className='p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors relative'
                onContextMenu={e => handleContextMenu(e, estimate.id)}
              >
                <div className='flex items-center justify-between'>
                  <div className='flex-1'>
                    {editingId === estimate.id ? (
                      <>
                        <input
                          className='text-lg font-semibold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 border rounded px-2 py-1 mb-1'
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                        />
                        <input
                          className='text-sm font-medium text-blue-600 dark:text-blue-400 bg-gray-100 dark:bg-gray-800 border rounded px-2 py-1 ml-2'
                          value={editCost}
                          onChange={e => setEditCost(e.target.value)}
                          style={{ width: 100 }}
                        />
                        <button
                          className='ml-2 text-green-600'
                          onClick={() => handleEditSave(estimate)}
                        >
                          ✔
                        </button>
                        <button className='ml-1 text-red-500' onClick={handleEditCancel}>
                          ✖
                        </button>
                      </>
                    ) : (
                      <>
                        <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                          {estimate.name}
                        </h3>
                        <span className='text-sm font-medium text-blue-600 dark:text-blue-400 ml-2'>
                          {estimate.totalCost.toLocaleString('ru-RU')} {estimate.currency}
                        </span>
                        <button
                          className='ml-2 text-gray-500 hover:text-blue-600'
                          onClick={() => handleEdit(estimate)}
                        >
                          ✎
                        </button>
                      </>
                    )}
                    <div className='flex items-center gap-4 mt-2'>
                      <span className='text-sm text-gray-500 dark:text-gray-400'>
                        Создано: {new Date(estimate.createdAt).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <select
                      value={estimate.status}
                      onChange={e =>
                        handleStatusChange(estimate.id, e.target.value as EstimateStatus)
                      }
                      className='px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                    >
                      <option value={EstimateStatus.DRAFT}>Черновик</option>
                      <option value={EstimateStatus.IN_REVIEW}>На проверке</option>
                      <option value={EstimateStatus.APPROVED}>Утверждено</option>
                      <option value={EstimateStatus.REJECTED}>Отклонено</option>
                      <option value={EstimateStatus.ARCHIVED}>В архиве</option>
                    </select>
                    <button
                      onClick={() => dispatch(selectEstimate(estimate.id))}
                      className='px-3 py-1 text-sm bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 rounded transition-colors'
                    >
                      Открыть
                    </button>
                    <button
                      onClick={() => handleDeleteEstimate(estimate.id)}
                      className='px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded transition-colors'
                    >
                      Удалить
                    </button>
                  </div>
                </div>
                <div className='flex items-center'>
                  <input
                    type='checkbox'
                    checked={selectedIds.includes(estimate.id)}
                    onChange={() => toggleSelect(estimate.id)}
                    className='mr-2 accent-blue-600'
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Контекстное меню */}
      {contextMenu && (
        <div
          className='fixed z-50 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded shadow-lg py-1'
          style={{ top: contextMenu.y, left: contextMenu.x, minWidth: 180 }}
          onClick={closeContextMenu}
        >
          <button
            className='block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700'
            onClick={() => handleContextAction('edit', contextMenu.id)}
          >
            Редактировать
          </button>
          <button
            className='block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700'
            onClick={() => handleContextAction('export', contextMenu.id)}
          >
            Экспорт в PDF
          </button>
          <button
            className='block w-full text-left px-4 py-2 hover:bg-blue-50 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300'
            onClick={() => handleContextAction('ai-check', contextMenu.id)}
          >
            Отправить на проверку ИИ
          </button>
          <button
            className='block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900'
            onClick={() => handleContextAction('delete', contextMenu.id)}
          >
            Удалить
          </button>
        </div>
      )}

      {/* Модальное окно с результатом AI-проверки */}
      {aiCheckResult && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40'>
          <div className='bg-white dark:bg-gray-900 p-6 rounded shadow-lg max-w-lg w-full relative'>
            <button
              className='absolute top-2 right-2 text-gray-400 hover:text-gray-700'
              onClick={() => setAICheckResult(null)}
            >
              ×
            </button>
            <h2 className='text-lg font-bold mb-2'>Результат AI-проверки</h2>
            <pre className='whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200'>
              {aiCheckResult}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default Estimates;
