export { default as databaseConfig } from './database.config';
export { default as fsbcConfig } from './fsbc.config';
export { default as securityConfig, SecurityConfig } from './security.config';
export { default as securityAdvancedConfig, SecurityAdvancedConfig } from './security-advanced.config';
export { default as monitoringConfig, MonitoringConfig } from './monitoring.config';

// Реэкспорт всех конфигураций для удобства
export * from './database.config';
export * from './fsbc.config';
export * from './security.config';
export * from './security-advanced.config';
export * from './monitoring.config';
export { default as performanceConfig, PerformanceConfig } from './performance.config';
export * from './performance.config';
export { default as scalingConfig, ScalingConfig } from './scaling.config';
export * from './scaling.config';
