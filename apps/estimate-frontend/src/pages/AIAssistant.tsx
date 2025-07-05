import React from 'react'

const AIAssistant: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          ИИ-Ассистент
        </h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            DeepSeek R1 ИИ-ассистент
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Используйте мощь ИИ для создания и анализа смет
          </p>

          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              Чат с ИИ-ассистентом будет здесь...
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIAssistant
