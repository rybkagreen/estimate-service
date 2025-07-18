import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class ProxyService {
  constructor(
    @Inject('ESTIMATE_SERVICE') private estimateClient: ClientProxy,
    @Inject('AI_SERVICE') private aiClient: ClientProxy,
    @Inject('DATA_COLLECTOR_SERVICE') private dataClient: ClientProxy,
  ) {}

  async getEstimate(id: string) {
    return this.estimateClient.send({ cmd: 'get-estimate' }, { id }).toPromise();
  }

  async getAIResult(query: string) {
    return this.aiClient.send({ cmd: 'analyze' }, { query }).toPromise();
  }

  async getData(type: string) {
    return this.dataClient.send({ cmd: 'get-data' }, { type }).toPromise();
  }
}
