export class ClassificationTool {
  getTool() {
    return {
      name: 'classification',
      description: 'Classify construction works and materials',
      inputSchema: {
        type: 'object',
        properties: {
          text: { type: 'string' },
          type: { type: 'string', enum: ['work', 'material', 'equipment'] },
        },
        required: ['text', 'type'],
      },
    };
  }

  async execute(args: Record<string, unknown>) {
    return {
      content: [{ type: 'text', text: 'Classification tool placeholder' }],
      isError: false,
    };
  }
}
