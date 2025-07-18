# AI Services Merge Documentation

## Date: 17.01.2025

### What was merged
- **Primary Service**: `ai-assistant-service` (kept as the main service)
- **Secondary Service**: `ai-assistant` (removed after merging unique features)

### Changes made

#### 1. Frontend Changes
- Combined `aiService.ts` and `aiServiceNew.ts` into single `aiService.ts`
- Removed `aiServiceNew.ts`
- Updated all imports in `AIAssistant.tsx` and other components

#### 2. Backend Changes
- Added WebSocket Gateway support from `ai-assistant` to `ai-assistant-service`
  - Created `chat.gateway.ts` in `ai-assistant-service`
  - Updated `ChatModule` to include ChatGateway
  - Added `createSession` and `sendMessage` methods to ChatService

#### 3. DTO Migration
- Moved all DTOs from `ai-assistant` to `ai-assistant-service`
  - `send-message.dto.ts`
  - `analyze-estimate.dto.ts`
  - `generate-estimate.dto.ts`
- Updated ChatController to use DTOs from separate files

#### 4. Unique Features Preserved
- WebSocket real-time communication (from ai-assistant)
- Conversation management (from ai-assistant-service)
- Context management (from ai-assistant-service)
- All chat, analytics, and knowledge modules

### Backup
- The original `ai-assistant` service is backed up in:
  - `services/ai-assistant-merged-backup/`
  - `services/ai-assistant.backup/` (original backup)

### Next Steps
1. Update any remaining imports in other services
2. Test WebSocket functionality
3. Update deployment configurations
4. Update documentation

### Service Endpoints
The unified service is now available at:
- REST API: `http://localhost:3001/api/v1/ai/`
- WebSocket: `ws://localhost:3001/ai-assistant`
