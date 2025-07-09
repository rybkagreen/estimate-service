# Configuration Changes Documentation

## Overview
This document tracks changes made to repository configuration files including CODEOWNERS and PERMISSIONS.md to reflect the evolving team structure and responsibilities in the Estimate Service project.

## Changes Made (January 2025)

### CODEOWNERS Updates

#### New Service Ownership Assignments
1. **AI Assistant Service** (`/services/ai-assistant/`)
   - Added ownership: `@estimate-service/ai-specialists` (primary)
   - Co-owners: `@estimate-service/tech-leads`, `@estimate-service/senior-developers`
   - Rationale: AI specialists have domain expertise in AI/ML models and integrations

2. **Data Collector Service** (`/services/data-collector/`)
   - Added ownership: `@estimate-service/data-engineers` (primary)
   - Co-owners: `@estimate-service/tech-leads`, `@estimate-service/senior-developers`
   - Rationale: Data engineers specialize in ETL pipelines and data quality

3. **Knowledge Base Service** (`/services/knowledge-base/`)
   - Added ownership: `@estimate-service/ai-specialists`, `@estimate-service/domain-experts`
   - Co-owner: `@estimate-service/tech-leads`
   - Rationale: Requires both AI expertise and construction domain knowledge

4. **MCP Server** (`/mcp-server/`)
   - Added `@estimate-service/ai-specialists` to existing ownership
   - Rationale: Model Context Protocol requires AI/ML expertise

#### New Path Patterns Added
- `**/models/` - AI model files owned by AI specialists
- `**/prompts/` - Prompt engineering files owned by AI specialists and domain experts
- `**/*.prompt` - Prompt template files
- `**/embeddings/` - Embedding data owned by AI specialists and data engineers

### PERMISSIONS.md Updates

#### New Teams Added

1. **@estimate-service/ai-specialists**
   - Members: AI/ML engineers, Data scientists
   - Permissions: Push to AI feature branches, Pull request to develop
   - Key Responsibilities:
     - AI model development and optimization
     - Prompt engineering for construction domain
     - Model integration and deployment
     - AI service performance monitoring
     - MCP server maintenance

2. **@estimate-service/data-engineers**
   - Members: Data engineers, ETL specialists
   - Permissions: Push to data pipeline branches, Pull request to develop
   - Key Responsibilities:
     - Data pipeline development
     - ФСБЦ-2022 data integration
     - Data quality and validation
     - Performance optimization
     - Knowledge base maintenance

#### Copilot Access Updates
- Added `@estimate-service/ai-specialists` to Copilot-enabled teams
- Added `@estimate-service/data-engineers` to Copilot-enabled teams

#### New Code Review Requirements
1. **AI Model Changes**
   - Required reviewers: `@estimate-service/ai-specialists`, `@estimate-service/tech-leads`
   - Applies to: Model files, training scripts, inference code

2. **Data Pipeline Changes**
   - Required reviewers: `@estimate-service/data-engineers`, `@estimate-service/tech-leads`
   - Applies to: ETL scripts, data validation, pipeline configurations

#### New API Keys Added
- `OPENAI_API_KEY` - For GPT model integrations
- `ANTHROPIC_API_KEY` - For Claude model integrations

## Impact Analysis

### Positive Impacts
1. **Clearer Ownership**: Specialized teams now have clear ownership of their domains
2. **Better Code Reviews**: Domain experts review relevant changes
3. **Improved Security**: AI and data pipeline changes require specialized review
4. **Scalability**: Structure supports growing AI/ML capabilities

### Considerations
1. **Review Load**: Tech leads are co-owners of many areas - monitor for bottlenecks
2. **Cross-team Coordination**: AI specialists and data engineers need to collaborate closely
3. **Onboarding**: New team members need clear guidance on team boundaries

## Future Recommendations

1. **Regular Reviews**: Review team assignments quarterly
2. **Load Balancing**: Consider adding more senior developers to AI teams as they grow
3. **Documentation**: Create team-specific onboarding guides
4. **Automation**: Consider automating some review assignments based on file patterns

## Rollback Instructions

If these changes need to be reverted:
1. Restore previous version of `.github/CODEOWNERS`
2. Restore previous version of `.github/PERMISSIONS.md`
3. Update GitHub team settings to remove new teams
4. Notify affected team members

## Change History

| Date | Author | Changes |
|------|---------|----------|
| 2025-01-09 | Configuration Update | Added AI specialists and data engineers teams, updated ownership rules |

---

*This document should be reviewed and updated with each significant configuration change.*
