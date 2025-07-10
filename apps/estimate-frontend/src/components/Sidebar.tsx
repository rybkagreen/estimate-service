import {
    ChevronDoubleLeftIcon,
    ChevronDoubleRightIcon,
    Cog6ToothIcon,
    CpuChipIcon,
    DocumentTextIcon,
    FolderIcon,
    HomeIcon,
} from '@heroicons/react/24/outline'
import { clsx } from 'clsx'
import { motion } from 'framer-motion'
import React from 'react'
import { Link, useLocation } from 'react-router-dom'

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

const navigation = [
  { name: 'Дашборд', href: '/', icon: HomeIcon },
  { name: 'Сметы', href: '/estimates', icon: DocumentTextIcon },
  { name: 'Проекты', href: '/projects', icon: FolderIcon },
  { name: 'Документы', href: '/documents', icon: DocumentTextIcon },
  { name: 'ИИ-Ассистент', href: '/ai-assistant', icon: CpuChipIcon },
  { name: 'Настройки', href: '/settings', icon: Cog6ToothIcon },
]

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const location = useLocation()

  return (
    <div className="sidebar h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-dark-200 dark:border-dark-700">
        <motion.div
          initial={false}
          animate={{
            opacity: isOpen ? 1 : 0,
            scale: isOpen ? 1 : 0.8,
          }}
          transition={{ duration: 0.2 }}
          className="flex items-center space-x-3"
        >
          {isOpen && (
            <>
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <CpuChipIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-dark-900 dark:text-dark-100">
                  Estimate
                </h1>
                <p className="text-xs text-dark-500 dark:text-dark-400">
                  Service
                </p>
              </div>
            </>
          )}
        </motion.div>

        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors"
        >
          {isOpen ? (
            <ChevronDoubleLeftIcon className="w-5 h-5 text-dark-600 dark:text-dark-400" />
          ) : (
            <ChevronDoubleRightIcon className="w-5 h-5 text-dark-600 dark:text-dark-400" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              to={item.href}
              className={clsx(
                'nav-item relative',
                isActive ? 'nav-item-active' : 'nav-item-inactive'
              )}
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeNavItem"
                  className="absolute inset-0 bg-primary-100 dark:bg-primary-900 rounded-lg"
                  initial={false}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}

              <div className="relative flex items-center space-x-3">
                <Icon className="w-5 h-5 flex-shrink-0" />
                <motion.span
                  initial={false}
                  animate={{
                    opacity: isOpen ? 1 : 0,
                    width: isOpen ? 'auto' : 0,
                  }}
                  transition={{ duration: 0.2 }}
                  className="font-medium overflow-hidden whitespace-nowrap"
                >
                  {item.name}
                </motion.span>
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-dark-200 dark:border-dark-700">
        <motion.div
          initial={false}
          animate={{
            opacity: isOpen ? 1 : 0,
          }}
          transition={{ duration: 0.2 }}
          className="text-xs text-dark-500 dark:text-dark-400"
        >
          {isOpen && (
            <div className="space-y-1">
              <p>Версия 1.0.0</p>
              <p>DeepSeek R1 AI</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default Sidebar
