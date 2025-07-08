import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class HuggingFaceService {
  private readonly logger = new Logger(HuggingFaceService.name);
  private readonly apiUrl = 'https://api-inference.huggingface.co/models/';
  private readonly apiKey: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.apiKey = this.configService.get<string>('HUGGINGFACE_API_KEY');
  }

  async predictWithModel(modelId: string, inputs: any): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.apiUrl}${modelId}`,
          { inputs },
          {
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );
      
      return response.data;
    } catch (error) {
      this.logger.error(`Error calling Hugging Face API: ${error.message}`);
      throw error;
    }
  }

  async analyzeSentiment(text: string): Promise<any> {
    // Use a sentiment analysis model for risk assessment
    const modelId = 'nlptown/bert-base-multilingual-uncased-sentiment';
    return this.predictWithModel(modelId, text);
  }

  async extractFeatures(projectData: any): Promise<number[]> {
    // Convert project data to numerical features for prediction
    // This is a simplified example - you'd need to implement proper feature engineering
    const features = [
      projectData.area || 0,
      projectData.floors || 1,
      projectData.materials?.length || 0,
      this.encodeLocation(projectData.location),
      this.getProjectDuration(projectData.startDate, projectData.endDate),
    ];
    
    return features;
  }

  private encodeLocation(location: string): number {
    // Simple location encoding - in practice, you'd use proper geocoding
    const locationMap = {
      'moscow': 1.5,
      'spb': 1.3,
      'default': 1.0,
    };
    
    return locationMap[location?.toLowerCase()] || locationMap.default;
  }

  private getProjectDuration(startDate: Date, endDate: Date): number {
    if (!startDate || !endDate) return 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }
}
