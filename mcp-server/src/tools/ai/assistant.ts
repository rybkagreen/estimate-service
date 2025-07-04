// AI tools placeholders
export class AIAssistantTool {
  getTool() {
    return {
      name: 'ai_assistant',
      description: 'AI assistant for estimate generation',
      inputSchema: {
        type: 'object',
        properties: {
          prompt: { type: 'string' },
          context: { type: 'string' },
        },
        required: ['prompt'],
      },
    };
  }

  async execute(args: Record<string, unknown>) {
    return {
      content: [{ type: 'text', text: 'AI Assistant tool placeholder' }],
      isError: false,
    };
  }
}
