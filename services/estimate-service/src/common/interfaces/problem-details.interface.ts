/**
 * RFC 7807 Problem Details for HTTP APIs
 * @see https://tools.ietf.org/html/rfc7807
 */
export interface ProblemDetails {
  /**
   * A URI reference that identifies the problem type
   */
  type: string;

  /**
   * A short, human-readable summary of the problem type
   */
  title: string;

  /**
   * The HTTP status code
   */
  status: number;

  /**
   * A human-readable explanation specific to this occurrence of the problem
   */
  detail?: string;

  /**
   * A URI reference that identifies the specific occurrence of the problem
   */
  instance?: string;

  /**
   * Additional members for extending the problem details
   */
  [key: string]: any;
}

export interface ExtendedProblemDetails extends ProblemDetails {
  /**
   * Timestamp when the error occurred
   */
  timestamp: string;

  /**
   * Request path that caused the error
   */
  path: string;

  /**
   * Unique error tracking ID
   */
  traceId: string;

  /**
   * Error code for internal tracking
   */
  code?: string;

  /**
   * Validation errors for bad requests
   */
  errors?: ValidationError[];

  /**
   * Stack trace (only in development mode)
   */
  stack?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
  constraints?: Record<string, string>;
}
