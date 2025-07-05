# Advanced Features Implementation

## Обзор

Этот документ описывает реализацию продвинутых функций frontend приложения, включая real-time коммуникацию, offline support, PWA возможности и advanced UX паттерны.

## Real-time Features

### WebSocket Integration

```typescript
// src/services/websocket.ts
import { io, Socket } from 'socket.io-client'

export class WebSocketService {
  private socket: Socket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5

  connect(token: string) {
    if (this.socket?.connected) {
      return this.socket
    }

    this.socket = io(import.meta.env.VITE_WS_URL, {
      auth: { token },
      transports: ['websocket'],
      autoConnect: true,
    })

    this.setupEventListeners()
    return this.socket
  }

  private setupEventListeners() {
    if (!this.socket) return

    this.socket.on('connect', () => {
      console.log('WebSocket connected')
      this.reconnectAttempts = 0
    })

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason)
      if (reason === 'io server disconnect') {
        this.socket?.connect()
      }
    })

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error)
      this.handleReconnect()
    })
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      setTimeout(() => {
        this.socket?.connect()
      }, Math.pow(2, this.reconnectAttempts) * 1000)
    }
  }

  subscribe<T>(event: string, callback: (data: T) => void) {
    this.socket?.on(event, callback)
    return () => this.socket?.off(event, callback)
  }

  emit<T>(event: string, data: T) {
    this.socket?.emit(event, data)
  }

  disconnect() {
    this.socket?.disconnect()
    this.socket = null
  }
}

export const wsService = new WebSocketService()
```

### Real-time Hooks

```typescript
// src/hooks/useRealtime.ts
import { useEffect, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { wsService } from '@/services/websocket'
import { useAuth } from './useAuth'

export const useRealtime = () => {
  const { token } = useAuth()
  const queryClient = useQueryClient()

  const handleProjectUpdate = useCallback((data: any) => {
    queryClient.setQueryData(['projects', data.id], data)
    queryClient.invalidateQueries({ queryKey: ['projects'] })
  }, [queryClient])

  const handleEstimateUpdate = useCallback((data: any) => {
    queryClient.setQueryData(['estimates', data.id], data)
    queryClient.invalidateQueries({ queryKey: ['estimates'] })
  }, [queryClient])

  const handleChatMessage = useCallback((data: any) => {
    queryClient.setQueryData(
      ['chat-messages', data.chatId],
      (old: any[]) => [...(old || []), data]
    )
  }, [queryClient])

  useEffect(() => {
    if (token) {
      wsService.connect(token)

      const unsubscribeProject = wsService.subscribe('project:updated', handleProjectUpdate)
      const unsubscribeEstimate = wsService.subscribe('estimate:updated', handleEstimateUpdate)
      const unsubscribeChat = wsService.subscribe('chat:message', handleChatMessage)

      return () => {
        unsubscribeProject()
        unsubscribeEstimate()
        unsubscribeChat()
      }
    }
  }, [token, handleProjectUpdate, handleEstimateUpdate, handleChatMessage])

  return {
    emit: wsService.emit.bind(wsService),
    subscribe: wsService.subscribe.bind(wsService),
  }
}
```

### Real-time Chat Component

```typescript
// src/components/Chat/RealTimeChat.tsx
import React, { useState, useRef, useEffect } from 'react'
import { useRealtime } from '@/hooks/useRealtime'
import { useChatMessages } from '@/hooks/useChatMessages'
import { Message } from '@/types/chat'

interface RealTimeChatProps {
  chatId: string
  userId: string
}

export const RealTimeChat: React.FC<RealTimeChatProps> = ({ chatId, userId }) => {
  const [message, setMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data: messages, isLoading } = useChatMessages(chatId)
  const { emit, subscribe } = useRealtime()

  // Автоскролл к последнему сообщению
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Подписка на typing events
  useEffect(() => {
    const unsubscribeTyping = subscribe('user:typing', (data: { userId: string; isTyping: boolean }) => {
      setTypingUsers(prev =>
        data.isTyping
          ? [...prev.filter(id => id !== data.userId), data.userId]
          : prev.filter(id => id !== data.userId)
      )
    })

    return unsubscribeTyping
  }, [subscribe])

  // Обработка typing
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false)
        emit('user:typing', { chatId, userId, isTyping: false })
      }
    }, 1000)

    return () => clearTimeout(timeout)
  }, [message, isTyping, emit, chatId, userId])

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value)

    if (!isTyping) {
      setIsTyping(true)
      emit('user:typing', { chatId, userId, isTyping: true })
    }
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    const newMessage: Message = {
      id: Date.now().toString(),
      chatId,
      userId,
      content: message,
      createdAt: new Date().toISOString(),
    }

    emit('chat:send-message', newMessage)
    setMessage('')
    setIsTyping(false)
  }

  if (isLoading) {
    return <div className="animate-pulse">Loading chat...</div>
  }

  return (
    <div className="flex flex-col h-96 border rounded-lg">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages?.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.userId === userId ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-3 py-2 rounded-lg ${
                msg.userId === userId
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-900'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {typingUsers.length > 0 && (
          <div className="flex items-center space-x-2 text-gray-500 text-sm">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
            </div>
            <span>{typingUsers.length} user(s) typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={handleMessageChange}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!message.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  )
}
```

## Offline Support

### Service Worker

```typescript
// public/sw.js
const CACHE_NAME = 'estimate-service-v1'
const STATIC_CACHE = 'static-v1'
const DYNAMIC_CACHE = 'dynamic-v1'

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/static/css/main.css',
  '/static/js/main.js',
  '/manifest.json'
]

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  )
})

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => {
        return Promise.all(
          keys.filter(key => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
            .map(key => caches.delete(key))
        )
      })
      .then(() => self.clients.claim())
  )
})

// Fetch event
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Cache successful GET requests
          if (request.method === 'GET' && response.ok) {
            const responseClone = response.clone()
            caches.open(DYNAMIC_CACHE)
              .then(cache => cache.put(request, responseClone))
          }
          return response
        })
        .catch(() => {
          // Return cached data if available
          return caches.match(request)
            .then(cached => {
              if (cached) {
                return cached
              }
              // Return offline page for HTML requests
              if (request.headers.get('accept').includes('text/html')) {
                return caches.match('/offline.html')
              }
              throw new Error('No cached version available')
            })
        })
    )
    return
  }

  // Handle static assets
  event.respondWith(
    caches.match(request)
      .then(cached => {
        if (cached) {
          return cached
        }
        return fetch(request)
          .then(response => {
            if (response.ok) {
              const responseClone = response.clone()
              caches.open(DYNAMIC_CACHE)
                .then(cache => cache.put(request, responseClone))
            }
            return response
          })
      })
  )
})

// Background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData())
  }
})

async function syncData() {
  // Sync offline data when connection is restored
  const offlineData = await getOfflineData()
  for (const item of offlineData) {
    try {
      await syncItem(item)
      await removeOfflineItem(item.id)
    } catch (error) {
      console.error('Sync failed for item:', item.id, error)
    }
  }
}
```

### Offline Storage Hook

```typescript
// src/hooks/useOfflineStorage.ts
import { useState, useEffect } from 'react'
import { openDB, DBSchema, IDBPDatabase } from 'idb'

interface OfflineDB extends DBSchema {
  projects: {
    key: string
    value: {
      id: string
      data: any
      timestamp: number
      synced: boolean
    }
  }
  estimates: {
    key: string
    value: {
      id: string
      data: any
      timestamp: number
      synced: boolean
    }
  }
}

export const useOfflineStorage = () => {
  const [db, setDb] = useState<IDBPDatabase<OfflineDB> | null>(null)
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const initDB = async () => {
      const database = await openDB<OfflineDB>('EstimateServiceDB', 1, {
        upgrade(db) {
          db.createObjectStore('projects', { keyPath: 'id' })
          db.createObjectStore('estimates', { keyPath: 'id' })
        },
      })
      setDb(database)
    }

    initDB()

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const saveOfflineData = async (store: keyof OfflineDB, id: string, data: any) => {
    if (!db) return

    await db.put(store, {
      id,
      data,
      timestamp: Date.now(),
      synced: false,
    })
  }

  const getOfflineData = async (store: keyof OfflineDB, id?: string) => {
    if (!db) return null

    if (id) {
      return await db.get(store, id)
    }
    return await db.getAll(store)
  }

  const syncOfflineData = async () => {
    if (!db || !isOnline) return

    const stores: (keyof OfflineDB)[] = ['projects', 'estimates']

    for (const store of stores) {
      const unsyncedItems = await db.getAllFromIndex(store, 'synced', false)

      for (const item of unsyncedItems) {
        try {
          // Sync with server
          await syncItemWithServer(store, item)

          // Mark as synced
          await db.put(store, { ...item, synced: true })
        } catch (error) {
          console.error(`Failed to sync ${store} item:`, item.id, error)
        }
      }
    }
  }

  return {
    isOnline,
    saveOfflineData,
    getOfflineData,
    syncOfflineData,
  }
}

async function syncItemWithServer(store: string, item: any) {
  const response = await fetch(`/api/${store}/${item.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item.data),
  })

  if (!response.ok) {
    throw new Error(`Failed to sync ${store} item: ${response.statusText}`)
  }
}
```

## Progressive Web App (PWA)

### Manifest

```json
{
  "name": "Estimate Service",
  "short_name": "EstimateApp",
  "description": "Professional estimation and project management tool",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#0969da",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable any"
    }
  ],
  "categories": ["business", "productivity"],
  "screenshots": [
    {
      "src": "/screenshots/desktop-1.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide"
    },
    {
      "src": "/screenshots/mobile-1.png",
      "sizes": "390x844",
      "type": "image/png",
      "form_factor": "narrow"
    }
  ]
}
```

### PWA Installation Hook

```typescript
// src/hooks/usePWAInstall.ts
import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsInstallable(true)
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const promptInstall = async () => {
    if (!deferredPrompt) return false

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      setDeferredPrompt(null)
      setIsInstallable(false)
      return true
    }

    return false
  }

  return {
    isInstallable,
    isInstalled,
    promptInstall,
  }
}
```

## Advanced UX Patterns

### Command Palette

```typescript
// src/components/CommandPalette/CommandPalette.tsx
import React, { useState, useMemo, useEffect } from 'react'
import { Dialog } from '@headlessui/react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { useNavigate } from 'react-router-dom'
import { useCommands } from './useCommands'

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const navigate = useNavigate()

  const { commands } = useCommands()

  const filteredCommands = useMemo(() => {
    if (!query) return commands.slice(0, 10)

    return commands
      .filter(command =>
        command.title.toLowerCase().includes(query.toLowerCase()) ||
        command.keywords?.some(keyword => keyword.toLowerCase().includes(query.toLowerCase()))
      )
      .slice(0, 10)
  }, [commands, query])

  useEffect(() => {
    setSelectedIndex(0)
  }, [filteredCommands])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const selectedCommand = filteredCommands[selectedIndex]
      if (selectedCommand) {
        selectedCommand.action()
        onClose()
      }
    }
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-start justify-center pt-20">
        <Dialog.Panel className="w-full max-w-lg bg-white rounded-lg shadow-2xl">
          <div className="flex items-center px-4 py-3 border-b">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search commands..."
              className="ml-3 flex-1 border-none outline-none text-gray-900 placeholder-gray-500"
              autoFocus
            />
            <kbd className="hidden sm:block px-2 py-1 text-xs text-gray-500 bg-gray-100 rounded">
              ESC
            </kbd>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {filteredCommands.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                No commands found
              </div>
            ) : (
              filteredCommands.map((command, index) => (
                <div
                  key={command.id}
                  className={`flex items-center px-4 py-3 cursor-pointer ${
                    index === selectedIndex ? 'bg-gray-100' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    command.action()
                    onClose()
                  }}
                >
                  <command.icon className="w-5 h-5 text-gray-400" />
                  <div className="ml-3 flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {command.title}
                    </div>
                    {command.description && (
                      <div className="text-xs text-gray-500">
                        {command.description}
                      </div>
                    )}
                  </div>
                  {command.shortcut && (
                    <kbd className="px-2 py-1 text-xs text-gray-500 bg-gray-100 rounded">
                      {command.shortcut}
                    </kbd>
                  )}
                </div>
              ))
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
```

### Virtual Scrolling

```typescript
// src/components/VirtualList/VirtualList.tsx
import React, { useState, useEffect, useRef } from 'react'

interface VirtualListProps<T> {
  items: T[]
  itemHeight: number
  containerHeight: number
  renderItem: (item: T, index: number) => React.ReactNode
  overscan?: number
}

export function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const totalHeight = items.length * itemHeight
  const visibleCount = Math.ceil(containerHeight / itemHeight)
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(items.length - 1, startIndex + visibleCount + overscan * 2)

  const visibleItems = items.slice(startIndex, endIndex + 1)
  const offsetY = startIndex * itemHeight

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }

  return (
    <div
      ref={containerRef}
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={startIndex + index}
              style={{ height: itemHeight }}
            >
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

### Infinite Scroll Hook

```typescript
// src/hooks/useInfiniteScroll.ts
import { useCallback, useRef } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'

interface UseInfiniteScrollProps<T> {
  queryKey: string[]
  queryFn: ({ pageParam }: { pageParam: number }) => Promise<{
    data: T[]
    nextPage?: number
    hasMore: boolean
  }>
  initialPageParam?: number
}

export function useInfiniteScroll<T>({
  queryKey,
  queryFn,
  initialPageParam = 1
}: UseInfiniteScrollProps<T>) {
  const observer = useRef<IntersectionObserver>()

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error
  } = useInfiniteQuery({
    queryKey,
    queryFn,
    initialPageParam,
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextPage : undefined,
  })

  const lastElementRef = useCallback((node: HTMLElement | null) => {
    if (isFetchingNextPage) return
    if (observer.current) observer.current.disconnect()

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNextPage) {
        fetchNextPage()
      }
    })

    if (node) observer.current.observe(node)
  }, [isFetchingNextPage, fetchNextPage, hasNextPage])

  const items = data?.pages.flatMap(page => page.data) ?? []

  return {
    items,
    lastElementRef,
    isFetchingNextPage,
    isLoading,
    error,
    hasNextPage
  }
}
```

### Drag and Drop Hook

```typescript
// src/hooks/useDragAndDrop.ts
import { useState, useRef, useCallback } from 'react'

interface DragItem {
  id: string
  type: string
  data: any
}

export const useDragAndDrop = <T extends DragItem>() => {
  const [draggedItem, setDraggedItem] = useState<T | null>(null)
  const [dropZone, setDropZone] = useState<string | null>(null)
  const dragRef = useRef<HTMLElement>()

  const handleDragStart = useCallback((item: T) => {
    setDraggedItem(item)
  }, [])

  const handleDragEnd = useCallback(() => {
    setDraggedItem(null)
    setDropZone(null)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, zoneId: string) => {
    e.preventDefault()
    setDropZone(zoneId)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDropZone(null)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent, zoneId: string, onDrop?: (item: T, zone: string) => void) => {
    e.preventDefault()

    if (draggedItem && onDrop) {
      onDrop(draggedItem, zoneId)
    }

    setDraggedItem(null)
    setDropZone(null)
  }, [draggedItem])

  const dragProps = {
    draggable: true,
    onDragStart: (e: React.DragEvent, item: T) => {
      e.dataTransfer.setData('text/plain', JSON.stringify(item))
      handleDragStart(item)
    },
    onDragEnd: handleDragEnd,
  }

  const dropProps = (zoneId: string, onDrop?: (item: T, zone: string) => void) => ({
    onDragOver: (e: React.DragEvent) => handleDragOver(e, zoneId),
    onDragLeave: handleDragLeave,
    onDrop: (e: React.DragEvent) => handleDrop(e, zoneId, onDrop),
  })

  return {
    draggedItem,
    dropZone,
    dragProps,
    dropProps,
  }
}
```

## Performance Optimizations

### React.memo with comparison

```typescript
// src/components/OptimizedList.tsx
import React, { memo } from 'react'

interface ListItemProps {
  id: string
  title: string
  description: string
  isSelected: boolean
  onClick: (id: string) => void
}

const ListItem = memo<ListItemProps>(({ id, title, description, isSelected, onClick }) => {
  return (
    <div
      className={`p-4 border rounded cursor-pointer ${
        isSelected ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
      }`}
      onClick={() => onClick(id)}
    >
      <h3 className="font-medium">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}, (prevProps, nextProps) => {
  return (
    prevProps.id === nextProps.id &&
    prevProps.title === nextProps.title &&
    prevProps.description === nextProps.description &&
    prevProps.isSelected === nextProps.isSelected
  )
})

ListItem.displayName = 'ListItem'

export { ListItem }
```

### Web Workers Integration

```typescript
// src/workers/calculations.worker.ts
export interface CalculationMessage {
  type: 'CALCULATE_ESTIMATE'
  payload: {
    items: EstimateItem[]
    settings: CalculationSettings
  }
}

self.onmessage = function(e: MessageEvent<CalculationMessage>) {
  const { type, payload } = e.data

  switch (type) {
    case 'CALCULATE_ESTIMATE':
      const result = calculateEstimate(payload.items, payload.settings)
      self.postMessage({ type: 'CALCULATION_COMPLETE', result })
      break
  }
}

function calculateEstimate(items: EstimateItem[], settings: CalculationSettings) {
  // Сложные вычисления в отдельном потоке
  let total = 0
  let breakdown = {}

  for (const item of items) {
    const itemTotal = item.quantity * item.unitPrice
    const withMarkup = itemTotal * (1 + settings.markup)
    const withTax = withMarkup * (1 + settings.taxRate)

    total += withTax
    breakdown[item.id] = {
      base: itemTotal,
      markup: itemTotal * settings.markup,
      tax: withMarkup * settings.taxRate,
      total: withTax
    }
  }

  return { total, breakdown }
}
```

```typescript
// src/hooks/useWebWorker.ts
import { useEffect, useRef, useState } from 'react'

export const useWebWorker = <T, R>(
  workerScript: string,
  onMessage?: (data: R) => void
) => {
  const workerRef = useRef<Worker>()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    workerRef.current = new Worker(workerScript)

    workerRef.current.onmessage = (e) => {
      setIsLoading(false)
      setError(null)
      onMessage?.(e.data)
    }

    workerRef.current.onerror = (e) => {
      setIsLoading(false)
      setError(new Error(e.message))
    }

    return () => {
      workerRef.current?.terminate()
    }
  }, [workerScript, onMessage])

  const postMessage = (data: T) => {
    if (workerRef.current) {
      setIsLoading(true)
      setError(null)
      workerRef.current.postMessage(data)
    }
  }

  return { postMessage, isLoading, error }
}
```

Эти продвинутые функции значительно улучшают пользовательский опыт и производительность приложения, обеспечивая современные UX паттерны и оптимизации.
