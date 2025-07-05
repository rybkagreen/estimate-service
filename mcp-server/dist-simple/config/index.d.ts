import { z } from 'zod';
declare const configSchema: z.ZodObject<{
    server: z.ZodObject<{
        port: z.ZodDefault<z.ZodNumber>;
        host: z.ZodDefault<z.ZodString>;
        logLevel: z.ZodDefault<z.ZodEnum<["error", "warn", "info", "debug"]>>;
    }, "strip", z.ZodTypeAny, {
        port: number;
        host: string;
        logLevel: "error" | "warn" | "info" | "debug";
    }, {
        port?: number | undefined;
        host?: string | undefined;
        logLevel?: "error" | "warn" | "info" | "debug" | undefined;
    }>;
    project: z.ZodObject<{
        rootPath: z.ZodDefault<z.ZodString>;
        servicePath: z.ZodDefault<z.ZodString>;
        docsPath: z.ZodDefault<z.ZodString>;
        libsPath: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        rootPath: string;
        servicePath: string;
        docsPath: string;
        libsPath: string;
    }, {
        rootPath?: string | undefined;
        servicePath?: string | undefined;
        docsPath?: string | undefined;
        libsPath?: string | undefined;
    }>;
    database: z.ZodObject<{
        url: z.ZodString;
        maxConnections: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        url: string;
        maxConnections: number;
    }, {
        url: string;
        maxConnections?: number | undefined;
    }>;
    ai: z.ZodObject<{
        deepseek: z.ZodObject<{
            apiKey: z.ZodString;
            model: z.ZodDefault<z.ZodString>;
            baseUrl: z.ZodDefault<z.ZodString>;
            maxTokens: z.ZodDefault<z.ZodNumber>;
            temperature: z.ZodDefault<z.ZodNumber>;
            timeout: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            apiKey: string;
            model: string;
            baseUrl: string;
            maxTokens: number;
            temperature: number;
            timeout: number;
        }, {
            apiKey: string;
            model?: string | undefined;
            baseUrl?: string | undefined;
            maxTokens?: number | undefined;
            temperature?: number | undefined;
            timeout?: number | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        deepseek: {
            apiKey: string;
            model: string;
            baseUrl: string;
            maxTokens: number;
            temperature: number;
            timeout: number;
        };
    }, {
        deepseek: {
            apiKey: string;
            model?: string | undefined;
            baseUrl?: string | undefined;
            maxTokens?: number | undefined;
            temperature?: number | undefined;
            timeout?: number | undefined;
        };
    }>;
    external: z.ZodObject<{
        grandSmeta: z.ZodObject<{
            apiUrl: z.ZodDefault<z.ZodString>;
            apiKey: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            apiUrl: string;
            apiKey?: string | undefined;
        }, {
            apiKey?: string | undefined;
            apiUrl?: string | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        grandSmeta: {
            apiUrl: string;
            apiKey?: string | undefined;
        };
    }, {
        grandSmeta: {
            apiKey?: string | undefined;
            apiUrl?: string | undefined;
        };
    }>;
    development: z.ZodObject<{
        enableDebug: z.ZodDefault<z.ZodBoolean>;
        enableMetrics: z.ZodDefault<z.ZodBoolean>;
        enableTesting: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        enableDebug: boolean;
        enableMetrics: boolean;
        enableTesting: boolean;
    }, {
        enableDebug?: boolean | undefined;
        enableMetrics?: boolean | undefined;
        enableTesting?: boolean | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    server: {
        port: number;
        host: string;
        logLevel: "error" | "warn" | "info" | "debug";
    };
    project: {
        rootPath: string;
        servicePath: string;
        docsPath: string;
        libsPath: string;
    };
    database: {
        url: string;
        maxConnections: number;
    };
    ai: {
        deepseek: {
            apiKey: string;
            model: string;
            baseUrl: string;
            maxTokens: number;
            temperature: number;
            timeout: number;
        };
    };
    external: {
        grandSmeta: {
            apiUrl: string;
            apiKey?: string | undefined;
        };
    };
    development: {
        enableDebug: boolean;
        enableMetrics: boolean;
        enableTesting: boolean;
    };
}, {
    server: {
        port?: number | undefined;
        host?: string | undefined;
        logLevel?: "error" | "warn" | "info" | "debug" | undefined;
    };
    project: {
        rootPath?: string | undefined;
        servicePath?: string | undefined;
        docsPath?: string | undefined;
        libsPath?: string | undefined;
    };
    database: {
        url: string;
        maxConnections?: number | undefined;
    };
    ai: {
        deepseek: {
            apiKey: string;
            model?: string | undefined;
            baseUrl?: string | undefined;
            maxTokens?: number | undefined;
            temperature?: number | undefined;
            timeout?: number | undefined;
        };
    };
    external: {
        grandSmeta: {
            apiKey?: string | undefined;
            apiUrl?: string | undefined;
        };
    };
    development: {
        enableDebug?: boolean | undefined;
        enableMetrics?: boolean | undefined;
        enableTesting?: boolean | undefined;
    };
}>;
type Config = z.infer<typeof configSchema>;
export declare const config: Config;
export {};
