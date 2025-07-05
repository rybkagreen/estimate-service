# Production Deployment Guide для Frontend

## Обзор

Этот документ описывает процесс подготовки и деплоя frontend приложения в production среду.

## Подготовка к Production

### 1. Оптимизация сборки

#### Vite конфигурация для production
```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  build: {
    // Оптимизация сборки
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    // Разделение на чанки
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@headlessui/react', 'framer-motion'],
          utils: ['clsx', 'date-fns']
        }
      }
    },
    // Размер предупреждения
    chunkSizeWarningLimit: 1000
  },
  // Сжатие gzip
  server: {
    compress: true
  }
})
```

#### Environment Variables
```bash
# .env.production
VITE_API_URL=https://api.yourdomain.com
VITE_WS_URL=wss://api.yourdomain.com
VITE_APP_VERSION=$npm_package_version
VITE_BUILD_TIME=$BUILD_TIME
VITE_SENTRY_DSN=your_sentry_dsn
VITE_GOOGLE_ANALYTICS_ID=your_ga_id
```

### 2. Docker конфигурация

#### Multi-stage Dockerfile
```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/estimate-frontend/package.json ./apps/estimate-frontend/

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY apps/estimate-frontend ./apps/estimate-frontend
COPY libs ./libs

# Build application
WORKDIR /app/apps/estimate-frontend
RUN npm run build

# Production stage
FROM nginx:alpine AS production

# Copy custom nginx config
COPY apps/estimate-frontend/nginx.conf /etc/nginx/nginx.conf

# Copy built assets
COPY --from=builder /app/apps/estimate-frontend/dist /usr/share/nginx/html

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

#### Nginx конфигурация
```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # Security headers
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    server {
        listen 80;
        server_name _;
        root /usr/share/nginx/html;
        index index.html;

        # Enable HTTP/2 Push
        location / {
            try_files $uri $uri/ /index.html;

            # Cache static assets
            location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
                expires 1y;
                add_header Cache-Control "public, immutable";
            }
        }

        # API proxy
        location /api {
            proxy_pass http://backend:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # Health check
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
```

### 3. CI/CD Pipeline

#### GitHub Actions
```yaml
# .github/workflows/frontend-deploy.yml
name: Frontend Deploy

on:
  push:
    branches: [main]
    paths: ['apps/estimate-frontend/**']

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test:frontend

      - name: Run E2E tests
        run: npm run test:e2e:frontend

      - name: Lighthouse CI
        run: npx lhci autorun

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build Docker image
        run: |
          docker build -f apps/estimate-frontend/Dockerfile \
            -t estimate-frontend:${{ github.sha }} .

      - name: Push to registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push estimate-frontend:${{ github.sha }}

      - name: Deploy to production
        run: |
          # Deploy using your preferred method (Kubernetes, Docker Swarm, etc.)
```

## Мониторинг и Analytics

### 1. Sentry для Error Tracking
```typescript
// src/utils/sentry.ts
import * as Sentry from '@sentry/react'
import { BrowserTracing } from '@sentry/tracing'

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    new BrowserTracing(),
  ],
  tracesSampleRate: 1.0,
  environment: import.meta.env.MODE,
})

export default Sentry
```

### 2. Google Analytics
```typescript
// src/utils/analytics.ts
import { gtag } from 'ga-gtag'

export const initGA = () => {
  if (import.meta.env.VITE_GOOGLE_ANALYTICS_ID) {
    gtag('config', import.meta.env.VITE_GOOGLE_ANALYTICS_ID, {
      page_title: document.title,
      page_location: window.location.href,
    })
  }
}

export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  })
}
```

### 3. Performance Monitoring
```typescript
// src/utils/performance.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

const sendToAnalytics = (metric: any) => {
  // Отправка метрик в ваш analytics сервис
  gtag('event', metric.name, {
    event_category: 'Web Vitals',
    value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    event_label: metric.id,
    non_interaction: true,
  })
}

export const initPerformanceMonitoring = () => {
  getCLS(sendToAnalytics)
  getFID(sendToAnalytics)
  getFCP(sendToAnalytics)
  getLCP(sendToAnalytics)
  getTTFB(sendToAnalytics)
}
```

## CDN и Static Assets

### 1. AWS CloudFront
```typescript
// vite.config.ts для CDN
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          const ext = info[info.length - 1]
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name)) {
            return `images/[name]-[hash].${ext}`
          }
          if (/\.(woff2?|ttf|otf|eot)$/i.test(assetInfo.name)) {
            return `fonts/[name]-[hash].${ext}`
          }
          return `assets/[name]-[hash].${ext}`
        }
      }
    }
  }
})
```

### 2. Service Worker для кэширования
```typescript
// public/sw.js
const CACHE_NAME = 'estimate-service-v1'
const urlsToCache = [
  '/',
  '/static/css/main.css',
  '/static/js/main.js',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  )
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response
        }
        return fetch(event.request)
      })
  )
})
```

## Security

### 1. Content Security Policy
```html
<!-- index.html -->
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self';
               script-src 'self' 'unsafe-inline' https://www.googletagmanager.com;
               style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
               font-src 'self' https://fonts.gstatic.com;
               img-src 'self' data: https:;
               connect-src 'self' https://api.yourdomain.com wss://api.yourdomain.com;">
```

### 2. Environment Variables Security
```typescript
// src/config/env.ts
const requiredEnvVars = [
  'VITE_API_URL',
  'VITE_WS_URL',
] as const

type RequiredEnvVar = typeof requiredEnvVars[number]

const validateEnv = (): Record<RequiredEnvVar, string> => {
  const env: Partial<Record<RequiredEnvVar, string>> = {}

  for (const envVar of requiredEnvVars) {
    const value = import.meta.env[envVar]
    if (!value) {
      throw new Error(`Missing required environment variable: ${envVar}`)
    }
    env[envVar] = value
  }

  return env as Record<RequiredEnvVar, string>
}

export const config = validateEnv()
```

## Performance Optimization

### 1. Bundle Analysis
```bash
# Добавить в package.json
{
  "scripts": {
    "analyze": "npx vite-bundle-analyzer dist"
  }
}
```

### 2. Image Optimization
```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import { imageOptimize } from 'vite-plugin-imagemin'

export default defineConfig({
  plugins: [
    imageOptimize({
      gifsicle: { optimizationLevel: 7 },
      mozjpeg: { quality: 80 },
      pngquant: { quality: [0.65, 0.8] },
      svgo: {
        plugins: [
          { name: 'removeViewBox', active: false },
          { name: 'removeEmptyAttrs', active: false }
        ]
      }
    })
  ]
})
```

### 3. Code Splitting
```typescript
// src/utils/lazyLoad.ts
import { lazy, ComponentType } from 'react'

export const lazyLoad = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: ComponentType
) => {
  const Component = lazy(importFunc)

  return (props: any) => (
    <Suspense fallback={fallback ? <fallback /> : <div>Loading...</div>}>
      <Component {...props} />
    </Suspense>
  )
}

// Использование
const Dashboard = lazyLoad(() => import('../pages/Dashboard'))
const Projects = lazyLoad(() => import('../pages/Projects'))
```

## Rollback Strategy

### 1. Blue-Green Deployment
```bash
#!/bin/bash
# deploy.sh

# Build new version
docker build -t estimate-frontend:new .

# Test new version
docker run -d --name frontend-test -p 8081:80 estimate-frontend:new
# Run smoke tests
npm run test:smoke -- --baseUrl=http://localhost:8081

if [ $? -eq 0 ]; then
  # Switch traffic to new version
  docker stop frontend-prod
  docker run -d --name frontend-prod-new -p 8080:80 estimate-frontend:new
  docker rm frontend-prod
  docker rename frontend-prod-new frontend-prod
  echo "Deployment successful"
else
  # Rollback
  docker stop frontend-test
  docker rm frontend-test
  echo "Deployment failed, keeping current version"
  exit 1
fi
```

### 2. Feature Flags
```typescript
// src/utils/featureFlags.ts
export const featureFlags = {
  newDashboard: import.meta.env.VITE_FEATURE_NEW_DASHBOARD === 'true',
  aiAssistant: import.meta.env.VITE_FEATURE_AI_ASSISTANT === 'true',
  advancedAnalytics: import.meta.env.VITE_FEATURE_ADVANCED_ANALYTICS === 'true',
}

export const useFeatureFlag = (flag: keyof typeof featureFlags) => {
  return featureFlags[flag]
}
```

## Health Checks

### 1. Application Health
```typescript
// src/utils/healthCheck.ts
export const healthCheck = async () => {
  try {
    const response = await fetch('/api/health')
    return response.ok
  } catch (error) {
    return false
  }
}

export const useHealthCheck = () => {
  const [isHealthy, setIsHealthy] = useState(true)

  useEffect(() => {
    const interval = setInterval(async () => {
      const healthy = await healthCheck()
      setIsHealthy(healthy)
    }, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [])

  return isHealthy
}
```

### 2. Kubernetes Health Probes
```yaml
# k8s/frontend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: estimate-frontend
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: frontend
        image: estimate-frontend:latest
        ports:
        - containerPort: 80
        livenessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 5
```

## Backup и Recovery

### 1. Automated Backups
```bash
#!/bin/bash
# backup.sh

# Backup static assets
aws s3 sync /app/dist s3://backups/frontend/$(date +%Y%m%d_%H%M%S)/

# Backup configuration
kubectl get configmap frontend-config -o yaml > backup-config-$(date +%Y%m%d).yaml
```

### 2. Quick Recovery
```bash
#!/bin/bash
# restore.sh

BACKUP_DATE=$1
if [ -z "$BACKUP_DATE" ]; then
  echo "Usage: ./restore.sh YYYYMMDD_HHMMSS"
  exit 1
fi

# Restore from backup
aws s3 sync s3://backups/frontend/$BACKUP_DATE/ /app/dist/
docker restart frontend-prod
```

Этот документ обеспечивает полную готовность frontend приложения к production развертыванию с учетом всех аспектов безопасности, производительности и надежности.
