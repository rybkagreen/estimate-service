/**
 * Validation Types and Interfaces for Answer Validation System
 */

/**
 * Enum for different validation levels
 */
export enum ValidationLevel {
  SYNTAX = 'syntax',
  SEMANTIC = 'semantic',
  LOGIC = 'logic',
  COMPLETENESS = 'completeness',
  ACCURACY = 'accuracy',
  CONSISTENCY = 'consistency',
}

/**
 * Enum for validation severity levels
 */
export enum ValidationSeverity {
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
  SUGGESTION = 'suggestion',
}

/**
 * Enum for validation status
 */
export enum ValidationStatus {
  PASSED = 'passed',
  FAILED = 'failed',
  PARTIAL = 'partial',
  SKIPPED = 'skipped',
}

/**
 * Interface for confidence score details
 */
export interface ConfidenceScore {
  /** Overall confidence score (0-1) */
  overall: number;
  
  /** Confidence breakdown by validation level */
  byLevel: Record<ValidationLevel, number>;
  
  /** Factors that influenced the confidence score */
  factors: ConfidenceFactor[];
  
  /** Timestamp when the score was calculated */
  calculatedAt: Date;
}

/**
 * Interface for factors affecting confidence score
 */
export interface ConfidenceFactor {
  /** Name of the factor */
  name: string;
  
  /** Impact on confidence (-1 to 1) */
  impact: number;
  
  /** Description of why this factor affected confidence */
  reason: string;
  
  /** Weight of this factor in overall calculation */
  weight: number;
}

/**
 * Interface for individual validation issues
 */
export interface ValidationIssue {
  /** Unique identifier for the issue */
  id: string;
  
  /** Validation level where the issue was found */
  level: ValidationLevel;
  
  /** Severity of the issue */
  severity: ValidationSeverity;
  
  /** Human-readable message describing the issue */
  message: string;
  
  /** Detailed description of the issue */
  details?: string;
  
  /** Location in the answer where the issue was found */
  location?: IssueLocation;
  
  /** Suggested fix for the issue */
  suggestion?: string;
  
  /** Additional metadata */
  metadata?: Record<string, any>;
}

/**
 * Interface for issue location information
 */
export interface IssueLocation {
  /** Line number (1-indexed) */
  line?: number;
  
  /** Column number (1-indexed) */
  column?: number;
  
  /** Character offset from start */
  offset?: number;
  
  /** Length of the problematic section */
  length?: number;
  
  /** The actual text snippet */
  snippet?: string;
}

/**
 * Interface for validation metrics
 */
export interface ValidationMetrics {
  /** Total number of checks performed */
  totalChecks: number;
  
  /** Number of passed checks */
  passedChecks: number;
  
  /** Number of failed checks */
  failedChecks: number;
  
  /** Number of skipped checks */
  skippedChecks: number;
  
  /** Time taken for validation (in milliseconds) */
  executionTime: number;
  
  /** Memory usage (in bytes) */
  memoryUsage?: number;
}

/**
 * Interface for per-level validation report
 */
export interface LevelValidationReport {
  /** The validation level */
  level: ValidationLevel;
  
  /** Status of validation at this level */
  status: ValidationStatus;
  
  /** Confidence score for this level (0-1) */
  confidence: number;
  
  /** Issues found at this level */
  issues: ValidationIssue[];
  
  /** Metrics for this level */
  metrics: ValidationMetrics;
  
  /** Additional context or notes */
  notes?: string[];
  
  /** Timestamp when this level was validated */
  validatedAt: Date;
}

/**
 * Main interface for answer validation result
 */
export interface AnswerValidationResult {
  /** Unique identifier for this validation run */
  id: string;
  
  /** ID of the answer being validated */
  answerId: string;
  
  /** ID of the question this answer responds to */
  questionId: string;
  
  /** Overall validation status */
  status: ValidationStatus;
  
  /** Overall confidence score */
  confidence: ConfidenceScore;
  
  /** Per-level validation reports */
  levelReports: LevelValidationReport[];
  
  /** All validation issues */
  issues: ValidationIssue[];
  
  /** Summary statistics */
  summary: ValidationSummary;
  
  /** Validation metadata */
  metadata: ValidationMetadata;
  
  /** Timestamp when validation started */
  startedAt: Date;
  
  /** Timestamp when validation completed */
  completedAt: Date;
}

/**
 * Interface for validation summary
 */
export interface ValidationSummary {
  /** Total number of issues by severity */
  issuesBySeverity: Record<ValidationSeverity, number>;
  
  /** Total number of issues by level */
  issuesByLevel: Record<ValidationLevel, number>;
  
  /** Overall pass rate (0-1) */
  passRate: number;
  
  /** List of critical issues that must be addressed */
  criticalIssues: string[];
  
  /** Recommended actions */
  recommendations: string[];
  
  /** Overall quality score (0-100) */
  qualityScore: number;
}

/**
 * Interface for validation metadata
 */
export interface ValidationMetadata {
  /** Version of the validation system */
  validatorVersion: string;
  
  /** Type of answer being validated */
  answerType: string;
  
  /** Language of the answer */
  language: string;
  
  /** User who triggered the validation */
  validatedBy?: string;
  
  /** Environment where validation was performed */
  environment: string;
  
  /** Additional custom metadata */
  custom?: Record<string, any>;
}

/**
 * Interface for validation configuration
 */
export interface ValidationConfig {
  /** Levels to include in validation */
  enabledLevels: ValidationLevel[];
  
  /** Minimum confidence threshold for passing */
  minConfidenceThreshold: number;
  
  /** Whether to stop on first error */
  stopOnFirstError: boolean;
  
  /** Maximum execution time (in milliseconds) */
  maxExecutionTime: number;
  
  /** Custom validation rules */
  customRules?: ValidationRule[];
  
  /** Whether to include suggestions */
  includeSuggestions: boolean;
  
  /** Detailed logging */
  verbose: boolean;
}

/**
 * Interface for custom validation rules
 */
export interface ValidationRule {
  /** Unique identifier for the rule */
  id: string;
  
  /** Name of the rule */
  name: string;
  
  /** Description of what the rule checks */
  description: string;
  
  /** Validation level this rule applies to */
  level: ValidationLevel;
  
  /** Severity if the rule fails */
  severity: ValidationSeverity;
  
  /** Whether this rule is enabled */
  enabled: boolean;
  
  /** Custom validation function */
  validate?: (answer: any) => Promise<ValidationIssue[]>;
}

/**
 * Interface for validation context
 */
export interface ValidationContext {
  /** The original question */
  question: any;
  
  /** The answer to validate */
  answer: any;
  
  /** Previous validation results (if any) */
  previousResults?: AnswerValidationResult[];
  
  /** Additional context data */
  additionalData?: Record<string, any>;
}

/**
 * Type for validation result callback
 */
export type ValidationCallback = (result: AnswerValidationResult) => void;

/**
 * Type for validation progress callback
 */
export type ValidationProgressCallback = (progress: ValidationProgress) => void;

/**
 * Interface for validation progress
 */
export interface ValidationProgress {
  /** Current validation level being processed */
  currentLevel: ValidationLevel;
  
  /** Overall progress percentage (0-100) */
  percentage: number;
  
  /** Current status message */
  message: string;
  
  /** Estimated time remaining (in milliseconds) */
  estimatedTimeRemaining?: number;
}
