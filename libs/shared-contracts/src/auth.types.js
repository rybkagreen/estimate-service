export var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "admin";
    UserRole["SYSTEM_ADMIN"] = "system_admin";
    UserRole["PROJECT_MANAGER"] = "project_manager";
    UserRole["ENGINEER"] = "engineer";
    UserRole["CONTRACTOR"] = "contractor";
    UserRole["CLIENT"] = "client";
    UserRole["AI_OPERATOR"] = "ai_operator";
    UserRole["MANAGER"] = "manager";
    UserRole["OPERATOR"] = "operator";
    UserRole["INSPECTOR"] = "inspector";
    UserRole["VIEWER"] = "viewer";
})(UserRole || (UserRole = {}));
export var Permission;
(function (Permission) {
    // User management
    Permission["VIEW_USERS"] = "view_users";
    Permission["CREATE_USER"] = "create_user";
    Permission["UPDATE_USER"] = "update_user";
    Permission["DELETE_USER"] = "delete_user";
    Permission["USER_READ"] = "user_read";
    Permission["USER_UPDATE"] = "user_update";
    // Object management
    Permission["VIEW_OBJECTS"] = "view_objects";
    Permission["CREATE_OBJECT"] = "create_object";
    Permission["UPDATE_OBJECT"] = "update_object";
    Permission["DELETE_OBJECT"] = "delete_object";
    // Contract management
    Permission["VIEW_CONTRACTS"] = "view_contracts";
    Permission["CREATE_CONTRACT"] = "create_contract";
    Permission["UPDATE_CONTRACT"] = "update_contract";
    Permission["DELETE_CONTRACT"] = "delete_contract";
    // Document management
    Permission["VIEW_DOCUMENTS"] = "view_documents";
    Permission["CREATE_DOCUMENT"] = "create_document";
    Permission["UPDATE_DOCUMENT"] = "update_document";
    Permission["DELETE_DOCUMENT"] = "delete_document";
    // AI Agent management
    Permission["AI_AGENT_MANAGEMENT"] = "ai_agent_management";
    Permission["AI_AGENT_READ"] = "ai_agent_read";
})(Permission || (Permission = {}));
export var ApiErrorCode;
(function (ApiErrorCode) {
    ApiErrorCode["VALIDATION_ERROR"] = "VALIDATION_ERROR";
    ApiErrorCode["NOT_FOUND"] = "NOT_FOUND";
    ApiErrorCode["RESOURCE_NOT_FOUND"] = "RESOURCE_NOT_FOUND";
    ApiErrorCode["UNAUTHORIZED"] = "UNAUTHORIZED";
    ApiErrorCode["FORBIDDEN"] = "FORBIDDEN";
    ApiErrorCode["INTERNAL_ERROR"] = "INTERNAL_ERROR";
    ApiErrorCode["BAD_REQUEST"] = "BAD_REQUEST";
})(ApiErrorCode || (ApiErrorCode = {}));
//# sourceMappingURL=auth.types.js.map