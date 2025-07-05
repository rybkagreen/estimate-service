import React from 'react'

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Панель управления
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Активные проекты
          </h3>
          <p className="text-3xl font-bold text-blue-600">12</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Сметы в работе
          </h3>
          <p className="text-3xl font-bold text-green-600">8</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Завершенные сметы
          </h3>
          <p className="text-3xl font-bold text-purple-600">24</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Экономия средств
          </h3>
          <p className="text-3xl font-bold text-red-600">₽2.1M</p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
