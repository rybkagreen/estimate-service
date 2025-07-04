import { Resource, TextResourceContents } from '@modelcontextprotocol/sdk/types.js';
import { logger } from '../utils/logger.js';

class ResourceRegistry {
  private resources: Map<string, Resource> = new Map();

  constructor() {
    this.registerResources();
  }

  private registerResources(): void {
    // Project documentation resources
    this.registerResource({
      uri: 'file:///docs/README.md',
      name: 'Documentation Index',
      description: 'Main documentation index',
      mimeType: 'text/markdown',
    });

    this.registerResource({
      uri: 'file:///docs/api/API_REFERENCE.md',
      name: 'API Reference',
      description: 'Complete API documentation',
      mimeType: 'text/markdown',
    });

    this.registerResource({
      uri: 'file:///docs/development/CODING_STANDARDS.md',
      name: 'Coding Standards',
      description: 'Project coding standards and guidelines',
      mimeType: 'text/markdown',
    });

    // Project configuration resources
    this.registerResource({
      uri: 'file:///package.json',
      name: 'Package Configuration',
      description: 'NPM package configuration',
      mimeType: 'application/json',
    });

    this.registerResource({
      uri: 'file:///prisma/schema.prisma',
      name: 'Database Schema',
      description: 'Prisma database schema',
      mimeType: 'text/plain',
    });

    // VS Code configuration
    this.registerResource({
      uri: 'file:///.vscode/tasks.json',
      name: 'VS Code Tasks',
      description: 'Development tasks configuration',
      mimeType: 'application/json',
    });

    logger.info(`Registered ${this.resources.size} resources`);
  }

  private registerResource(resource: Resource): void {
    this.resources.set(resource.uri, resource);
  }

  getAllResources(): Resource[] {
    return Array.from(this.resources.values());
  }

  async readResource(uri: string): Promise<TextResourceContents> {
    const resource = this.resources.get(uri);
    if (!resource) {
      throw new Error(`Resource not found: ${uri}`);
    }

    try {
      // For now, return placeholder content
      // In a real implementation, you would read the actual file
      const content = await this.loadResourceContent(uri);

      return {
        type: 'text',
        text: content,
        uri,
      };
    } catch (error) {
      logger.error(`Failed to read resource: ${uri}`, { error });
      throw error;
    }
  }

  private async loadResourceContent(uri: string): Promise<string> {
    // Placeholder implementation
    // In a real implementation, you would use fs.readFile or similar
    return `Content of ${uri} would be loaded here`;
  }

  hasResource(uri: string): boolean {
    return this.resources.has(uri);
  }
}

export const resourceRegistry = new ResourceRegistry();
