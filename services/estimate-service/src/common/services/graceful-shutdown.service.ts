import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import * as Sentry from '@sentry/node';

@Injectable()
export class GracefulShutdownService implements OnModuleDestroy {
  private readonly logger = new Logger(GracefulShutdownService.name);
  private shutdownListeners: Array<() => Promise<void>> = [];

  /**
   * Register a shutdown listener
   */
  addShutdownListener(listener: () => Promise<void>): void {
    this.shutdownListeners.push(listener);
  }

  /**
   * Called when the module is being destroyed
   */
  async onModuleDestroy(): Promise<void> {
    this.logger.log('Executing graceful shutdown...');
    
    // Execute all shutdown listeners
    await Promise.all(
      this.shutdownListeners.map(async (listener) => {
        try {
          await listener();
        } catch (error) {
          this.logger.error('Error during shutdown listener execution', error);
        }
      }),
    );

    // Flush Sentry
    try {
      await Sentry.close(2000);
      this.logger.log('Sentry client closed');
    } catch (error) {
      this.logger.error('Error closing Sentry', error);
    }

    this.logger.log('Graceful shutdown completed');
  }

  /**
   * Setup process signal handlers
   */
  setupSignalHandlers(app: any): void {
    const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM', 'SIGQUIT'];

    signals.forEach((signal) => {
      process.on(signal, async () => {
        this.logger.log(`Received ${signal}, shutting down gracefully...`);
        
        try {
          await app.close();
          process.exit(0);
        } catch (error) {
          this.logger.error(`Error during ${signal} shutdown`, error);
          process.exit(1);
        }
      });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
      this.logger.error('Uncaught Exception:', error);
      Sentry.captureException(error);
      
      // Give Sentry time to send the error
      setTimeout(() => {
        process.exit(1);
      }, 2000);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
      this.logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      Sentry.captureException(new Error(`Unhandled Rejection: ${reason}`));
      
      // Give Sentry time to send the error
      setTimeout(() => {
        process.exit(1);
      }, 2000);
    });
  }
}
