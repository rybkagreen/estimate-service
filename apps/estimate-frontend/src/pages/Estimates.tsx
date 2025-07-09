import React, { useState } from 'react'
import { useGetEstimatesQuery, useCreateEstimateMutation, useDeleteEstimateMutation, useUpdateEstimateStatusMutation } from '../store/api/estimateApi'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { openModal, addNotification, setSearchQuery } from '../store/slices/uiSlice'
import { selectEstimate } from '../store/slices/estimatesSlice'
import { EstimateStatus } from '../types/estimate.types'

const Estimates: React.FC = () => {
  const dispatch = useAppDispatch();
  const searchQuery = useAppSelector((state) => state.ui.searchQuery);
  const [filter, setFilter] = useState<{ status?: EstimateStatus[] }>({});

  // RTK Query hooks
  const { data: estimatesData, error, isLoading, refetch } = useGetEstimatesQuery({
    search: searchQuery,
    ...filter
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
      dispatch(addNotification({
        type: 'success',
        message: 'Смета успешно удалена'
      }));
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: 'Ошибка при удалении сметы'
      }));
    }
  };

  const handleStatusChange = async (id: string, status: EstimateStatus) => {
    try {
      await updateStatus({ id, status }).unwrap();
      dispatch(addNotification({
        type: 'success',
        message: 'Статус сметы обновлен'
      }));
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: 'Ошибка при обновлении статуса'
      }));
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Ошибка загрузки смет. Пожалуйста, попробуйте позже.
      </div>
    );
  }

  const estimates = estimatesData?.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Сметы
        </h1>
        <button 
          onClick={handleCreateEstimate}
          disabled={isCreating}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg transition-colors"
        >
          {isCreating ? 'Создание...' : 'Создать смету'}
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Поиск смет..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          onChange={(e) => handleFilterChange(e.target.value as EstimateStatus | null)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="">Все статусы</option>
          <option value={EstimateStatus.DRAFT}>Черновик</option>
          <option value={EstimateStatus.IN_REVIEW}>На проверке</option>
          <option value={EstimateStatus.APPROVED}>Утверждено</option>
          <option value={EstimateStatus.REJECTED}>Отклонено</option>
          <option value={EstimateStatus.ARCHIVED}>В архиве</option>
        </select>
      </div>

      {/* Estimates List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {estimates.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Сметы не найдены. Создайте первую смету для начала работы.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {estimates.map((estimate) => (
              <div key={estimate.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {estimate.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {estimate.description || 'Без описания'}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Создано: {new Date(estimate.createdAt).toLocaleDateString('ru-RU')}
                      </span>
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        {estimate.totalCost.toLocaleString('ru-RU')} {estimate.currency}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={estimate.status}
                      onChange={(e) => handleStatusChange(estimate.id, e.target.value as EstimateStatus)}
                      className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value={EstimateStatus.DRAFT}>Черновик</option>
                      <option value={EstimateStatus.IN_REVIEW}>На проверке</option>
                      <option value={EstimateStatus.APPROVED}>Утверждено</option>
                      <option value={EstimateStatus.REJECTED}>Отклонено</option>
                      <option value={EstimateStatus.ARCHIVED}>В архиве</option>
                    </select>
                    <button
                      onClick={() => dispatch(selectEstimate(estimate.id))}
                      className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 rounded transition-colors"
                    >
                      Открыть
                    </button>
                    <button
                      onClick={() => handleDeleteEstimate(estimate.id)}
                      className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Estimates
