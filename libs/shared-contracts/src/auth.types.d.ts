export interface User {
    id: string;
    username?: string;
    email: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    middleName?: string;
    avatarUrl?: string;
    isActive?: boolean;
    roles?: UserRole[];
    role?: UserRole;
    permissions: Permission[];
    profile?: UserProfile;
    createdAt: string;
    updatedAt: string;
    lastLoginAt?: string;
    phoneNumber?: string;
    position?: string;
    department?: string;
    organization?: string;
}
export interface UserBasic {
    id: string;
    email: string;
    name: string;
    role: UserRole;
}
export declare enum UserRole {
    ADMIN = "admin",
    SYSTEM_ADMIN = "system_admin",
    PROJECT_MANAGER = "project_manager",
    ENGINEER = "engineer",
    CONTRACTOR = "contractor",
    CLIENT = "client",
    AI_OPERATOR = "ai_operator",
    MANAGER = "manager",
    OPERATOR = "operator",
    INSPECTOR = "inspector",
    VIEWER = "viewer"
}
export declare enum Permission {
    VIEW_USERS = "view_users",
    CREATE_USER = "create_user",
    UPDATE_USER = "update_user",
    DELETE_USER = "delete_user",
    USER_READ = "user_read",
    USER_UPDATE = "user_update",
    VIEW_OBJECTS = "view_objects",
    CREATE_OBJECT = "create_object",
    UPDATE_OBJECT = "update_object",
    DELETE_OBJECT = "delete_object",
    VIEW_CONTRACTS = "view_contracts",
    CREATE_CONTRACT = "create_contract",
    UPDATE_CONTRACT = "update_contract",
    DELETE_CONTRACT = "delete_contract",
    VIEW_DOCUMENTS = "view_documents",
    CREATE_DOCUMENT = "create_document",
    UPDATE_DOCUMENT = "update_document",
    DELETE_DOCUMENT = "delete_document",
    AI_AGENT_MANAGEMENT = "ai_agent_management",
    AI_AGENT_READ = "ai_agent_read"
}
export interface UserProfile {
    firstName: string;
    lastName: string;
    avatar?: string;
    phone?: string;
    company?: string;
    position?: string;
    specializations: string[];
}
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}
export interface LoginRequest {
    email: string;
    password: string;
}
export interface RegisterRequest {
    email: string;
    password: string;
    name: string;
    role: UserRole;
}
export interface CreateUserRequest {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: UserRole;
}
export interface UpdateUserRequest {
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: UserRole;
    avatar?: string;
    phone?: string;
    company?: string;
    position?: string;
    department?: string;
    organization?: string;
}
export interface ChangePasswordRequest {
    oldPassword: string;
    newPassword: string;
}
export interface RefreshTokenRequest {
    refreshToken: string;
}
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: ApiError;
    metadata?: ApiMetadata;
    meta?: Record<string, any>;
}
export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, any>;
}
export declare enum ApiErrorCode {
    VALIDATION_ERROR = "VALIDATION_ERROR",
    NOT_FOUND = "NOT_FOUND",
    RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND",
    UNAUTHORIZED = "UNAUTHORIZED",
    FORBIDDEN = "FORBIDDEN",
    INTERNAL_ERROR = "INTERNAL_ERROR",
    BAD_REQUEST = "BAD_REQUEST"
}
export interface ApiMetadata {
    timestamp: Date;
    requestId: string;
    version: string;
}
//# sourceMappingURL=auth.types.d.ts.map