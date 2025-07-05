import React from 'react'

const Estimates: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Сметы
        </h1>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
          Создать смету
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-400">
            Здесь будет список ваших смет...
          </p>
        </div>
      </div>
    </div>
  )
}

export default Estimates
