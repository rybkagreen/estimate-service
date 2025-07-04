export class EstimateTool {
  getTool() {
    return {
      name: 'estimate',
      description: 'Generate construction estimates',
      inputSchema: {
        type: 'object',
        properties: {
          project: { type: 'string' },
          works: { type: 'array', items: { type: 'string' } },
          format: { type: 'string', enum: ['grand-smeta', 'json', 'excel'] },
        },
        required: ['project', 'works'],
      },
    };
  }

  async execute(args: Record<string, unknown>) {
    return {
      content: [{ type: 'text', text: 'Estimate tool placeholder' }],
      isError: false,
    };
  }
}
