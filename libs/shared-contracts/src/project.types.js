export var ConstructionObjectType;
(function (ConstructionObjectType) {
    ConstructionObjectType["RESIDENTIAL"] = "RESIDENTIAL";
    ConstructionObjectType["COMMERCIAL"] = "COMMERCIAL";
    ConstructionObjectType["INDUSTRIAL"] = "INDUSTRIAL";
    ConstructionObjectType["INFRASTRUCTURE"] = "INFRASTRUCTURE";
    ConstructionObjectType["SOCIAL"] = "SOCIAL";
    ConstructionObjectType["MIXED_USE"] = "MIXED_USE";
    ConstructionObjectType["TRANSPORTATION"] = "TRANSPORTATION";
    ConstructionObjectType["ENERGY"] = "ENERGY";
    ConstructionObjectType["OTHER"] = "OTHER";
})(ConstructionObjectType || (ConstructionObjectType = {}));
export var ConstructionObjectStatus;
(function (ConstructionObjectStatus) {
    ConstructionObjectStatus["PLANNING"] = "PLANNING";
    ConstructionObjectStatus["DESIGN"] = "DESIGN";
    ConstructionObjectStatus["EXPERTISE"] = "EXPERTISE";
    ConstructionObjectStatus["APPROVAL"] = "APPROVAL";
    ConstructionObjectStatus["PREPARATION"] = "PREPARATION";
    ConstructionObjectStatus["CONSTRUCTION"] = "CONSTRUCTION";
    ConstructionObjectStatus["IN_PROGRESS"] = "IN_PROGRESS";
    ConstructionObjectStatus["ON_HOLD"] = "ON_HOLD";
    ConstructionObjectStatus["INSPECTION"] = "INSPECTION";
    ConstructionObjectStatus["COMMISSIONING"] = "COMMISSIONING";
    ConstructionObjectStatus["COMMISSIONED"] = "COMMISSIONED";
    ConstructionObjectStatus["COMPLETED"] = "COMPLETED";
    ConstructionObjectStatus["MAINTENANCE"] = "MAINTENANCE";
    ConstructionObjectStatus["SUSPENDED"] = "SUSPENDED";
    ConstructionObjectStatus["CANCELLED"] = "CANCELLED";
})(ConstructionObjectStatus || (ConstructionObjectStatus = {}));
export var ProjectStatus;
(function (ProjectStatus) {
    ProjectStatus["PLANNING"] = "planning";
    ProjectStatus["DESIGN"] = "design";
    ProjectStatus["PERMITS"] = "permits";
    ProjectStatus["CONSTRUCTION"] = "construction";
    ProjectStatus["INSPECTION"] = "inspection";
    ProjectStatus["COMPLETION"] = "completion";
    ProjectStatus["MAINTENANCE"] = "maintenance";
    ProjectStatus["CANCELLED"] = "cancelled";
})(ProjectStatus || (ProjectStatus = {}));
export var PhaseStatus;
(function (PhaseStatus) {
    PhaseStatus["NOT_STARTED"] = "not_started";
    PhaseStatus["IN_PROGRESS"] = "in_progress";
    PhaseStatus["COMPLETED"] = "completed";
    PhaseStatus["DELAYED"] = "delayed";
    PhaseStatus["CANCELLED"] = "cancelled";
})(PhaseStatus || (PhaseStatus = {}));
export var TaskStatus;
(function (TaskStatus) {
    TaskStatus["PENDING"] = "pending";
    TaskStatus["IN_PROGRESS"] = "in_progress";
    TaskStatus["REVIEW"] = "review";
    TaskStatus["COMPLETED"] = "completed";
    TaskStatus["BLOCKED"] = "blocked";
})(TaskStatus || (TaskStatus = {}));
export var Priority;
(function (Priority) {
    Priority["LOW"] = "LOW";
    Priority["MEDIUM"] = "MEDIUM";
    Priority["HIGH"] = "HIGH";
    Priority["URGENT"] = "URGENT";
})(Priority || (Priority = {}));
export var StakeholderRole;
(function (StakeholderRole) {
    StakeholderRole["OWNER"] = "owner";
    StakeholderRole["ARCHITECT"] = "architect";
    StakeholderRole["CONTRACTOR"] = "contractor";
    StakeholderRole["ENGINEER"] = "engineer";
    StakeholderRole["SUPERVISOR"] = "supervisor";
    StakeholderRole["INSPECTOR"] = "inspector";
    StakeholderRole["CLIENT"] = "client";
})(StakeholderRole || (StakeholderRole = {}));
export var AccessLevel;
(function (AccessLevel) {
    AccessLevel["READ"] = "read";
    AccessLevel["WRITE"] = "write";
    AccessLevel["ADMIN"] = "admin";
})(AccessLevel || (AccessLevel = {}));
export var MilestoneStatus;
(function (MilestoneStatus) {
    MilestoneStatus["PENDING"] = "pending";
    MilestoneStatus["ACHIEVED"] = "achieved";
    MilestoneStatus["MISSED"] = "missed";
    MilestoneStatus["CANCELLED"] = "cancelled";
})(MilestoneStatus || (MilestoneStatus = {}));
//# sourceMappingURL=project.types.js.map