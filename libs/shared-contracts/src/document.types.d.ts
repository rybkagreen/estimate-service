export declare enum DocumentType {
    TECHNICAL_DRAWING = "TECHNICAL_DRAWING",
    CONTRACT = "CONTRACT",
    REPORT = "REPORT",
    PHOTO = "PHOTO",
    VIDEO = "VIDEO",
    SPECIFICATION = "SPECIFICATION",
    CERTIFICATE = "CERTIFICATE",
    PERMIT = "PERMIT",
    OTHER = "OTHER"
}
export declare enum DocumentStatus {
    DRAFT = "DRAFT",
    UNDER_REVIEW = "UNDER_REVIEW",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    ARCHIVED = "ARCHIVED",
    EXPIRED = "EXPIRED"
}
export declare enum ReviewStatus {
    PENDING = "PENDING",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    REJECTED = "REJECTED"
}
export declare enum ReviewType {
    TECHNICAL = "TECHNICAL",
    LEGAL = "LEGAL",
    FINANCIAL = "FINANCIAL",
    COMPLIANCE = "COMPLIANCE",
    QUALITY = "QUALITY"
}
export declare enum ApprovalStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    CONDITIONALLY_APPROVED = "CONDITIONALLY_APPROVED"
}
export interface Document {
    id: string;
    name: string;
    description?: string;
    type: DocumentType;
    status: DocumentStatus;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
    version: number;
    checksum: string;
    createdById: string;
    createdAt: string;
    updatedAt: string;
    metadata?: Record<string, any>;
}
export interface DocumentVersion {
    id: string;
    documentId: string;
    version: number;
    fileUrl: string;
    fileSize: number;
    checksum: string;
    description?: string;
    createdById: string;
    createdAt: string;
}
export interface DocumentReview {
    id: string;
    documentId: string;
    reviewerId: string;
    type: ReviewType;
    status: ReviewStatus;
    comments?: string;
    rating?: number;
    createdAt: string;
    updatedAt: string;
}
export interface DocumentApproval {
    id: string;
    documentId: string;
    approverId: string;
    status: ApprovalStatus;
    comments?: string;
    approvedAt?: string;
    createdAt: string;
    updatedAt: string;
}
export interface CreateDocumentRequest {
    name: string;
    description?: string;
    type: DocumentType;
    file: File | string | ArrayBuffer;
    metadata?: Record<string, any>;
}
export interface CreateDocumentDto {
    name: string;
    description?: string;
    type: DocumentType;
    metadata?: Record<string, any>;
}
export interface DocumentResponse {
    id: string;
    name: string;
    description?: string;
    type: DocumentType;
    status: DocumentStatus;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
    version: number;
    createdAt: string;
    updatedAt: string;
    createdBy?: {
        id: string;
        name: string;
        email: string;
    };
    metadata?: Record<string, any>;
}
export interface UpdateDocumentDto {
    name?: string;
    description?: string;
    type?: DocumentType;
    metadata?: Record<string, any>;
}
export interface DocumentQueryDto {
    type?: DocumentType;
    status?: DocumentStatus;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
//# sourceMappingURL=document.types.d.ts.map