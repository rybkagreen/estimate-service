import { Injectable, Logger } from '@nestjs/common';

export interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface KnowledgeSearchResult {
  items: KnowledgeItem[];
  total: number;
  page: number;
  pageSize: number;
}

@Injectable()
export class KnowledgeService {
  private readonly logger = new Logger(KnowledgeService.name);
  private knowledgeBase: Map<string, KnowledgeItem> = new Map();

  constructor() {
    this.initializeKnowledgeBase();
  }

  /**
   * Initialize knowledge base with default data
   */
  private initializeKnowledgeBase() {
    // Add some default knowledge items
    this.addKnowledgeItem({
      title: 'Строительные нормы и правила',
      content: 'СНиП - основные требования к строительству',
      category: 'regulations',
      tags: ['СНиП', 'нормативы', 'строительство'],
    });

    this.addKnowledgeItem({
      title: 'Расчет стоимости материалов',
      content: 'Методология расчета стоимости строительных материалов',
      category: 'pricing',
      tags: ['материалы', 'цены', 'расчет'],
    });
  }

  /**
   * Add knowledge item to the base
   */
  addKnowledgeItem(data: Omit<KnowledgeItem, 'id' | 'createdAt' | 'updatedAt'>): KnowledgeItem {
    const item: KnowledgeItem = {
      id: `kb_${Date.now()}`,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.knowledgeBase.set(item.id, item);
    return item;
  }

  /**
   * Search knowledge base
   */
  searchKnowledge(
    query: string,
    category?: string,
    page: number = 1,
    pageSize: number = 10,
  ): KnowledgeSearchResult {
    let items = Array.from(this.knowledgeBase.values());

    // Filter by query
    if (query) {
      const lowerQuery = query.toLowerCase();
      items = items.filter(
        item =>
          item.title.toLowerCase().includes(lowerQuery) ||
          item.content.toLowerCase().includes(lowerQuery) ||
          item.tags.some(tag => tag.toLowerCase().includes(lowerQuery)),
      );
    }

    // Filter by category
    if (category) {
      items = items.filter(item => item.category === category);
    }

    // Pagination
    const total = items.length;
    const start = (page - 1) * pageSize;
    const paginatedItems = items.slice(start, start + pageSize);

    return {
      items: paginatedItems,
      total,
      page,
      pageSize,
    };
  }

  /**
   * Get knowledge item by ID
   */
  getKnowledgeItem(id: string): KnowledgeItem | undefined {
    return this.knowledgeBase.get(id);
  }

  /**
   * Update knowledge item
   */
  updateKnowledgeItem(
    id: string,
    updates: Partial<Omit<KnowledgeItem, 'id' | 'createdAt'>>,
  ): KnowledgeItem | undefined {
    const item = this.knowledgeBase.get(id);
    if (!item) return undefined;

    const updatedItem: KnowledgeItem = {
      ...item,
      ...updates,
      updatedAt: new Date(),
    };
    this.knowledgeBase.set(id, updatedItem);
    return updatedItem;
  }

  /**
   * Get knowledge categories
   */
  getCategories(): string[] {
    const categories = new Set<string>();
    this.knowledgeBase.forEach(item => categories.add(item.category));
    return Array.from(categories);
  }
}
