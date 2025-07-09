# Repository Permissions and Security Configuration

## Branch Protection Rules

### main branch
```yaml
protection_rules:
  required_status_checks:
    strict: true
    contexts:
      - "🔍 Code Quality Analysis"
      - "🧪 Run All Tests"
      - "🎯 Type Check"
      - "🔐 Security Audit"
      - "🤖 AI Code Review"

  enforce_admins: false
  required_pull_request_reviews:
    required_approving_review_count: 2
    dismiss_stale_reviews: true
    require_code_owner_reviews: true

  restrictions:
    users: []
    teams: ["tech-leads", "senior-developers"]
```

### develop branch
```yaml
protection_rules:
  required_status_checks:
    strict: true
    contexts:
      - "🔍 Code Quality Analysis"
      - "🧪 Run All Tests"

  required_pull_request_reviews:
    required_approving_review_count: 1
    dismiss_stale_reviews: true
```

## Team Permissions

### Repository Teams

#### @estimate-service/admins
- **Members**: Repository owners, DevOps engineers
- **Permissions**: Admin
- **Responsibilities**:
  - Repository settings management
  - Security and compliance
  - CI/CD pipeline maintenance
  - Secrets management

#### @estimate-service/tech-leads
- **Members**: Technical leads, Senior architects
- **Permissions**: Maintain
- **Responsibilities**:
  - Code architecture decisions
  - Code review standards
  - Copilot configuration
  - Documentation oversight

#### @estimate-service/senior-developers
- **Members**: Senior developers
- **Permissions**: Push to develop, Pull request to main
- **Responsibilities**:
  - Feature development
  - Code reviews
  - Mentoring junior developers
  - AI/Copilot best practices

#### @estimate-service/developers
- **Members**: Mid-level developers
- **Permissions**: Push to feature branches, Pull request to develop
- **Responsibilities**:
  - Feature implementation
  - Unit testing
  - Following coding standards
  - Using Copilot effectively

#### @estimate-service/junior-developers
- **Members**: Junior developers, Interns
- **Permissions**: Push to personal feature branches only
- **Responsibilities**:
  - Assigned task completion
  - Learning and skill development
  - Following established patterns
  - Getting guidance on Copilot usage

#### @estimate-service/domain-experts
- **Members**: Construction industry experts, Business analysts
- **Permissions**: Read access, Issues, Discussions
- **Responsibilities**:
  - Domain knowledge validation
  - Business requirements clarification
  - ФСБЦ-2022 standards compliance
  - User acceptance testing

#### @estimate-service/ai-specialists
- **Members**: AI/ML engineers, Data scientists
- **Permissions**: Push to AI feature branches, Pull request to develop
- **Responsibilities**:
  - AI model development and optimization
  - Prompt engineering for construction domain
  - Model integration and deployment
  - AI service performance monitoring
  - MCP server maintenance

#### @estimate-service/data-engineers
- **Members**: Data engineers, ETL specialists
- **Permissions**: Push to data pipeline branches, Pull request to develop
- **Responsibilities**:
  - Data pipeline development
  - ФСБЦ-2022 data integration
  - Data quality and validation
  - Performance optimization
  - Knowledge base maintenance

## GitHub Copilot Access Control

### Copilot Enterprise Features
```yaml
copilot_access:
  enabled_for_teams:
    - "@estimate-service/tech-leads"
    - "@estimate-service/senior-developers"
    - "@estimate-service/developers"
    - "@estimate-service/junior-developers"
    - "@estimate-service/ai-specialists"
    - "@estimate-service/data-engineers"

  copilot_business_features:
    - organization_level_policies: true
    - audit_logs: true
    - advanced_security_integration: true

  copilot_individual_restrictions:
    - block_public_code_suggestions: true
    - allow_organization_code_only: true
```

### Copilot Usage Policies
```yaml
policies:
  content_restrictions:
    - no_personal_data: true
    - no_sensitive_business_info: true
    - filter_construction_proprietary_data: true

  code_suggestions:
    - prefer_organization_patterns: true
    - use_project_context_files: true
    - follow_architecture_guidelines: true

  chat_restrictions:
    - log_conversations: true
    - review_sensitive_discussions: true
    - limit_external_integrations: false
```

## Secrets and Environment Variables

### Repository Secrets
```yaml
secrets:
  # Database
  DATABASE_URL: "postgresql://..."
  REDIS_URL: "redis://..."

# APIs
  HUGGINGFACE_API_KEY: "hf_..."
  DEEPSEEK_API_KEY: "sk-..."
  FSBTS_API_KEY: "fsbtc_..."
  OPENAI_API_KEY: "sk-..."
  ANTHROPIC_API_KEY: "sk-ant-..."

  # Infrastructure
  DOCKER_REGISTRY_TOKEN: "ghp_..."
  DEPLOY_SSH_KEY: "-----BEGIN..."

  # GitHub
  GH_TOKEN: "ghp_..."
  CODECOV_TOKEN: "..."

  # Monitoring
  SENTRY_DSN: "https://..."
  DATADOG_API_KEY: "..."
```

### Environment-specific Variables
```yaml
development:
  NODE_ENV: "development"
  LOG_LEVEL: "debug"
  ENABLE_SWAGGER: "true"
  MOCK_EXTERNAL_APIS: "true"

staging:
  NODE_ENV: "staging"
  LOG_LEVEL: "info"
  ENABLE_SWAGGER: "true"
  MOCK_EXTERNAL_APIS: "false"

production:
  NODE_ENV: "production"
  LOG_LEVEL: "warn"
  ENABLE_SWAGGER: "false"
  MOCK_EXTERNAL_APIS: "false"
```

## Security Configurations

### Dependabot Configuration
```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
    open-pull-requests-limit: 10

  - package-ecosystem: "docker"
    directory: "/"
    schedule:
      interval: "weekly"

  - package-ecosystem: "github-actions"
    directory: "/.github/workflows"
    schedule:
      interval: "weekly"
```

### CodeQL Security Analysis
```yaml
# .github/workflows/codeql-analysis.yml
security_scans:
  - static_analysis: true
  - dependency_scanning: true
  - secret_scanning: true
  - vulnerability_alerts: true

languages:
  - typescript
  - javascript

query_suites:
  - security-and-quality
  - security-extended
```

## Compliance and Audit

### Code Review Requirements
```yaml
review_requirements:
  construction_domain_changes:
    required_reviewers: ["@estimate-service/domain-experts"]

  security_changes:
    required_reviewers: ["@estimate-service/security-team"]

  api_changes:
    required_reviewers: ["@estimate-service/tech-leads"]

  database_changes:
    required_reviewers: ["@estimate-service/senior-developers"]
  
  ai_model_changes:
    required_reviewers: ["@estimate-service/ai-specialists", "@estimate-service/tech-leads"]
  
  data_pipeline_changes:
    required_reviewers: ["@estimate-service/data-engineers", "@estimate-service/tech-leads"]
```

### Audit Logging
```yaml
audit_events:
  - repository_access
  - branch_protection_changes
  - secret_access
  - copilot_usage_patterns
  - code_review_decisions
  - deployment_activities
```

## Access Request Process

### New Team Member Onboarding
1. **Request Access**
   - Manager submits access request
   - Specify role and team assignment
   - Business justification required

2. **Security Review**
   - Background verification
   - Security training completion
   - NDA and compliance agreements

3. **Technical Setup**
   - GitHub account verification
   - Team assignment
   - Copilot license assignment
   - Development environment setup

4. **Training and Orientation**
   - Project domain knowledge
   - Coding standards training
   - Copilot best practices
   - Security awareness

### Access Revocation
```yaml
automatic_revocation:
  - employee_termination: "immediate"
  - role_change: "within_24_hours"
  - inactive_90_days: "automatic"

manual_review:
  - quarterly_access_review: true
  - contractor_access_review: "monthly"
  - admin_access_review: "monthly"
```

## Monitoring and Alerts

### Repository Activity Monitoring
```yaml
alerts:
  unusual_access_patterns:
    - off_hours_admin_access
    - bulk_code_downloads
    - unusual_copilot_usage

  security_events:
    - failed_authentication_attempts
    - unauthorized_branch_access
    - secret_exposure_attempts

  compliance_violations:
    - missing_required_reviews
    - bypassed_protection_rules
    - unauthorized_deployments
```

### GitHub Copilot Usage Analytics
```yaml
copilot_monitoring:
  metrics:
    - suggestion_acceptance_rate
    - code_quality_correlation
    - productivity_improvements
    - security_implications

  reporting:
    - weekly_team_reports
    - monthly_org_summary
    - quarterly_roi_analysis
```

---

*This configuration should be implemented through GitHub Enterprise settings and organizational policies.*
