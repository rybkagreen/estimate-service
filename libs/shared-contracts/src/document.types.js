// Document management system types and enums
export var DocumentType;
(function (DocumentType) {
    DocumentType["TECHNICAL_DRAWING"] = "TECHNICAL_DRAWING";
    DocumentType["CONTRACT"] = "CONTRACT";
    DocumentType["REPORT"] = "REPORT";
    DocumentType["PHOTO"] = "PHOTO";
    DocumentType["VIDEO"] = "VIDEO";
    DocumentType["SPECIFICATION"] = "SPECIFICATION";
    DocumentType["CERTIFICATE"] = "CERTIFICATE";
    DocumentType["PERMIT"] = "PERMIT";
    DocumentType["OTHER"] = "OTHER";
})(DocumentType || (DocumentType = {}));
export var DocumentStatus;
(function (DocumentStatus) {
    DocumentStatus["DRAFT"] = "DRAFT";
    DocumentStatus["UNDER_REVIEW"] = "UNDER_REVIEW";
    DocumentStatus["APPROVED"] = "APPROVED";
    DocumentStatus["REJECTED"] = "REJECTED";
    DocumentStatus["ARCHIVED"] = "ARCHIVED";
    DocumentStatus["EXPIRED"] = "EXPIRED";
})(DocumentStatus || (DocumentStatus = {}));
export var ReviewStatus;
(function (ReviewStatus) {
    ReviewStatus["PENDING"] = "PENDING";
    ReviewStatus["IN_PROGRESS"] = "IN_PROGRESS";
    ReviewStatus["COMPLETED"] = "COMPLETED";
    ReviewStatus["REJECTED"] = "REJECTED";
})(ReviewStatus || (ReviewStatus = {}));
export var ReviewType;
(function (ReviewType) {
    ReviewType["TECHNICAL"] = "TECHNICAL";
    ReviewType["LEGAL"] = "LEGAL";
    ReviewType["FINANCIAL"] = "FINANCIAL";
    ReviewType["COMPLIANCE"] = "COMPLIANCE";
    ReviewType["QUALITY"] = "QUALITY";
})(ReviewType || (ReviewType = {}));
export var ApprovalStatus;
(function (ApprovalStatus) {
    ApprovalStatus["PENDING"] = "PENDING";
    ApprovalStatus["APPROVED"] = "APPROVED";
    ApprovalStatus["REJECTED"] = "REJECTED";
    ApprovalStatus["CONDITIONALLY_APPROVED"] = "CONDITIONALLY_APPROVED";
})(ApprovalStatus || (ApprovalStatus = {}));
//# sourceMappingURL=document.types.js.map