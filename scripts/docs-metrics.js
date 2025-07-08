#!/usr/bin/env node

/**
 * Скрипт для анализа и генерации метрик документации
 * Использование: node scripts/docs-metrics.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class DocumentationMetrics {
  constructor() {
    this.docsPath = path.join(__dirname, '..', 'docs');
    this.metrics = {};
  }

  /**
   * Подсчет файлов документации
   */
  countFiles() {
    const findFiles = (dir, extension) => {
      const files = [];
      const items = fs.readdirSync(dir, { withFileTypes: true });

      for (const item of items) {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory()) {
          files.push(...findFiles(fullPath, extension));
        } else if (item.name.endsWith(extension)) {
          files.push(fullPath);
        }
      }
      return files;
    };

    const mdFiles = findFiles(this.docsPath, '.md');
    const imageFiles = findFiles(this.docsPath, '.png')
      .concat(findFiles(this.docsPath, '.jpg'))
      .concat(findFiles(this.docsPath, '.gif'))
      .concat(findFiles(this.docsPath, '.svg'));

    this.metrics.files = {
      markdown: mdFiles.length,
      images: imageFiles.length,
      total: mdFiles.length + imageFiles.length
    };

    return mdFiles;
  }

  /**
   * Анализ содержимого файлов
   */
  analyzeContent(files) {
    let totalLines = 0;
    let totalWords = 0;
    let totalCharacters = 0;
    const largestFiles = [];

    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n').length;
        const words = content.split(/\s+/).filter(word => word.length > 0).length;
        const characters = content.length;

        totalLines += lines;
        totalWords += words;
        totalCharacters += characters;

        largestFiles.push({
          file: path.relative(this.docsPath, file),
          lines,
          words,
          size: Math.round(characters / 1024 * 100) / 100 // KB
        });
      } catch (error) {
        console.warn(`⚠️  Не удалось прочитать файл: ${file}`);
      }
    }

    this.metrics.content = {
      totalLines,
      totalWords,
      totalCharacters,
      averageWordsPerFile: Math.round(totalWords / files.length),
      largestFiles: largestFiles
        .sort((a, b) => b.lines - a.lines)
        .slice(0, 5)
    };
  }

  /**
   * Проверка структуры документации
   */
  checkStructure() {
    const requiredFiles = [
      'README.md',
      'architecture/SYSTEM_ARCHITECTURE.md',
      'development/CODING_STANDARDS.md',
      'api/API_REFERENCE.md',
      'user-guides/QUICK_START_GUIDE.md',
      'standards/DOCUMENTATION_STANDARDS.md'
    ];

    const missingFiles = [];
    const existingFiles = [];

    for (const file of requiredFiles) {
      const fullPath = path.join(this.docsPath, file);
      if (fs.existsSync(fullPath)) {
        existingFiles.push(file);
      } else {
        missingFiles.push(file);
      }
    }

    this.metrics.structure = {
      requiredFiles: requiredFiles.length,
      existingFiles: existingFiles.length,
      missingFiles: missingFiles.length,
      completeness: Math.round((existingFiles.length / requiredFiles.length) * 100),
      missing: missingFiles
    };
  }

  /**
   * Анализ последних изменений
   */
  analyzeRecentChanges() {
    try {
      // Получаем файлы, измененные за последние 30 дней
      const recentFiles = execSync(
        `find ${this.docsPath} -name "*.md" -mtime -30`,
        { encoding: 'utf8' }
      ).trim().split('\n').filter(f => f);

      // Получаем статистику коммитов за последний месяц
      const commitStats = execSync(
        `git log --since="30 days ago" --oneline --grep="docs" | wc -l`,
        { encoding: 'utf8', cwd: path.join(__dirname, '..') }
      ).trim();

      this.metrics.activity = {
        recentlyModified: recentFiles.length,
        documentationCommits: parseInt(commitStats) || 0,
        lastMonth: true
      };
    } catch (error) {
      this.metrics.activity = {
        recentlyModified: 0,
        documentationCommits: 0,
        error: 'Git информация недоступна'
      };
    }
  }

  /**
   * Проверка качества ссылок
   */
  checkLinks() {
    const files = this.countFiles();
    let totalLinks = 0;
    let internalLinks = 0;
    let externalLinks = 0;
    const brokenLinks = [];

    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        let match;

        while ((match = linkRegex.exec(content)) !== null) {
          totalLinks++;
          const url = match[2];

          if (url.startsWith('http')) {
            externalLinks++;
          } else {
            internalLinks++;
            // Проверяем внутренние ссылки
            const relativePath = path.resolve(path.dirname(file), url);
            if (!fs.existsSync(relativePath)) {
              brokenLinks.push({
                file: path.relative(this.docsPath, file),
                link: url,
                text: match[1]
              });
            }
          }
        }
      } catch (error) {
        console.warn(`⚠️  Ошибка при проверке ссылок в файле: ${file}`);
      }
    }

    this.metrics.links = {
      total: totalLinks,
      internal: internalLinks,
      external: externalLinks,
      broken: brokenLinks.length,
      brokenDetails: brokenLinks.slice(0, 10) // Показываем только первые 10
    };
  }

  /**
   * Генерация отчета
   */
  generateReport() {
    console.log('📚 ОТЧЕТ ПО ДОКУМЕНТАЦИИ');
    console.log('='.repeat(50));
    console.log();

    // Общая статистика
    console.log('📊 ОБЩАЯ СТАТИСТИКА');
    console.log(`📄 Файлов Markdown: ${this.metrics.files.markdown}`);
    console.log(`🖼️  Изображений: ${this.metrics.files.images}`);
    console.log(`📝 Общее количество строк: ${this.metrics.content.totalLines.toLocaleString()}`);
    console.log(`📖 Общее количество слов: ${this.metrics.content.totalWords.toLocaleString()}`);
    console.log(`📏 Среднее слов на файл: ${this.metrics.content.averageWordsPerFile}`);
    console.log();

    // Структура
    console.log('🏗️  СТРУКТУРА ДОКУМЕНТАЦИИ');
    console.log(`✅ Полнота структуры: ${this.metrics.structure.completeness}%`);
    console.log(`📋 Обязательных файлов: ${this.metrics.structure.requiredFiles}`);
    console.log(`✅ Существующих файлов: ${this.metrics.structure.existingFiles}`);
    if (this.metrics.structure.missingFiles > 0) {
      console.log(`❌ Отсутствующих файлов: ${this.metrics.structure.missingFiles}`);
      this.metrics.structure.missing.forEach(file => {
        console.log(`   - ${file}`);
      });
    }
    console.log();

    // Активность
    console.log('🔄 АКТИВНОСТЬ ОБНОВЛЕНИЙ');
    console.log(`📅 Файлов обновлено (30 дней): ${this.metrics.activity.recentlyModified}`);
    console.log(`💾 Коммитов с документацией (30 дней): ${this.metrics.activity.documentationCommits}`);
    console.log();

    // Ссылки
    console.log('🔗 АНАЛИЗ ССЫЛОК');
    console.log(`🔗 Всего ссылок: ${this.metrics.links.total}`);
    console.log(`🏠 Внутренних: ${this.metrics.links.internal}`);
    console.log(`🌐 Внешних: ${this.metrics.links.external}`);
    if (this.metrics.links.broken > 0) {
      console.log(`❌ Сломанных ссылок: ${this.metrics.links.broken}`);
      this.metrics.links.brokenDetails.forEach(link => {
        console.log(`   - ${link.file}: "${link.text}" -> ${link.link}`);
      });
    } else {
      console.log(`✅ Все внутренние ссылки работают`);
    }
    console.log();

    // Топ файлов
    console.log('📋 ТОП-5 САМЫХ БОЛЬШИХ ФАЙЛОВ');
    this.metrics.content.largestFiles.forEach((file, index) => {
      console.log(`${index + 1}. ${file.file}`);
      console.log(`   📏 ${file.lines} строк, ${file.words} слов, ${file.size} KB`);
    });
    console.log();

    // Рекомендации
    this.generateRecommendations();
  }

  /**
   * Генерация рекомендаций
   */
  generateRecommendations() {
    console.log('💡 РЕКОМЕНДАЦИИ');
    console.log('-'.repeat(30));

    const recommendations = [];

    if (this.metrics.structure.completeness < 100) {
      recommendations.push(`📋 Создать отсутствующие обязательные файлы (${this.metrics.structure.missingFiles} файлов)`);
    }

    if (this.metrics.activity.recentlyModified === 0) {
      recommendations.push('🔄 Документация не обновлялась последние 30 дней - проверьте актуальность');
    }

    if (this.metrics.links.broken > 0) {
      recommendations.push(`🔗 Исправить ${this.metrics.links.broken} сломанных ссылок`);
    }

    if (this.metrics.content.averageWordsPerFile < 100) {
      recommendations.push('📝 Рассмотрите возможность расширения документации (средний файл очень короткий)');
    }

    if (this.metrics.files.images === 0) {
      recommendations.push('🖼️  Добавить диаграммы и скриншоты для лучшего понимания');
    }

    if (recommendations.length === 0) {
      console.log('🎉 Документация в отличном состоянии! Никаких рекомендаций.');
    } else {
      recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
      });
    }
    console.log();
  }

  /**
   * Сохранение метрик в JSON
   */
  saveMetrics() {
    const outputPath = path.join(__dirname, '..', 'docs-metrics.json');
    const reportData = {
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      summary: {
        health: this.calculateHealthScore(),
        recommendations: this.getRecommendationsCount()
      }
    };

    fs.writeFileSync(outputPath, JSON.stringify(reportData, null, 2));
    console.log(`💾 Метрики сохранены в: ${outputPath}`);
  }

  /**
   * Расчет общего индекса здоровья документации
   */
  calculateHealthScore() {
    let score = 100;

    // Структура (40% веса)
    score -= (100 - this.metrics.structure.completeness) * 0.4;

    // Ссылки (30% веса)
    if (this.metrics.links.total > 0) {
      const brokenPercentage = (this.metrics.links.broken / this.metrics.links.total) * 100;
      score -= brokenPercentage * 0.3;
    }

    // Активность (30% веса)
    if (this.metrics.activity.recentlyModified === 0) {
      score -= 30;
    }

    return Math.max(0, Math.round(score));
  }

  /**
   * Подсчет количества рекомендаций
   */
  getRecommendationsCount() {
    let count = 0;

    if (this.metrics.structure.completeness < 100) count++;
    if (this.metrics.activity.recentlyModified === 0) count++;
    if (this.metrics.links.broken > 0) count++;
    if (this.metrics.content.averageWordsPerFile < 100) count++;
    if (this.metrics.files.images === 0) count++;

    return count;
  }

  /**
   * Главный метод запуска анализа
   */
  run() {
    console.log('🔍 Анализ документации...\n');

    try {
      const files = this.countFiles();
      this.analyzeContent(files);
      this.checkStructure();
      this.analyzeRecentChanges();
      this.checkLinks();

      this.generateReport();
      this.saveMetrics();

      const healthScore = this.calculateHealthScore();
      console.log(`🏥 Общий индекс здоровья документации: ${healthScore}/100`);

      // Установка exit code на основе критических проблем
      if (this.metrics.structure.completeness < 80 || this.metrics.links.broken > 5) {
        process.exit(1);
      }

    } catch (error) {
      console.error('❌ Ошибка при анализе документации:', error.message);
      process.exit(1);
    }
  }
}

// Запуск анализа
const metrics = new DocumentationMetrics();
metrics.run();
