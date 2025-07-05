import {
  BellIcon,
  MagnifyingGlassIcon,
  MoonIcon,
  SunIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import React from 'react'
import { useTheme } from '../contexts/ThemeContext'

const Header: React.FC = () => {
  const { darkMode, toggleDarkMode } = useTheme()

  return (
    <header className="bg-white dark:bg-dark-800 border-b border-dark-200 dark:border-dark-700 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-400" />
            <input
              type="text"
              placeholder="Поиск смет, проектов..."
              className="input pl-10 w-full"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          {/* Theme toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors"
          >
            {darkMode ? (
              <SunIcon className="w-5 h-5 text-yellow-500" />
            ) : (
              <MoonIcon className="w-5 h-5 text-dark-600" />
            )}
          </motion.button>

          {/* Notifications */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors"
          >
            <BellIcon className="w-5 h-5 text-dark-600 dark:text-dark-400" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-error-500 rounded-full"></span>
          </motion.button>

          {/* User menu */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors"
          >
            <UserCircleIcon className="w-8 h-8 text-dark-600 dark:text-dark-400" />
            <div className="text-left">
              <p className="text-sm font-medium text-dark-900 dark:text-dark-100">
                Пользователь
              </p>
              <p className="text-xs text-dark-500 dark:text-dark-400">
                Админ
              </p>
            </div>
          </motion.button>
        </div>
      </div>
    </header>
  )
}

export default Header
