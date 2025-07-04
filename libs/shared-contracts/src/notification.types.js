// Notification system types and enums
export var ChannelType;
(function (ChannelType) {
    ChannelType["EMAIL"] = "EMAIL";
    ChannelType["SMS"] = "SMS";
    ChannelType["PUSH"] = "PUSH";
    ChannelType["WEBHOOK"] = "WEBHOOK";
    ChannelType["SLACK"] = "SLACK";
    ChannelType["TELEGRAM"] = "TELEGRAM";
})(ChannelType || (ChannelType = {}));
export var NotificationType;
(function (NotificationType) {
    NotificationType["INFO"] = "INFO";
    NotificationType["WARNING"] = "WARNING";
    NotificationType["ERROR"] = "ERROR";
    NotificationType["SUCCESS"] = "SUCCESS";
    NotificationType["ALERT"] = "ALERT";
})(NotificationType || (NotificationType = {}));
export var NotificationPriority;
(function (NotificationPriority) {
    NotificationPriority["LOW"] = "LOW";
    NotificationPriority["MEDIUM"] = "MEDIUM";
    NotificationPriority["HIGH"] = "HIGH";
    NotificationPriority["URGENT"] = "URGENT";
})(NotificationPriority || (NotificationPriority = {}));
export var NotificationStatus;
(function (NotificationStatus) {
    NotificationStatus["PENDING"] = "PENDING";
    NotificationStatus["SENT"] = "SENT";
    NotificationStatus["DELIVERED"] = "DELIVERED";
    NotificationStatus["FAILED"] = "FAILED";
    NotificationStatus["READ"] = "READ";
})(NotificationStatus || (NotificationStatus = {}));
export var DeliveryStatus;
(function (DeliveryStatus) {
    DeliveryStatus["PENDING"] = "PENDING";
    DeliveryStatus["PROCESSING"] = "PROCESSING";
    DeliveryStatus["SENT"] = "SENT";
    DeliveryStatus["DELIVERED"] = "DELIVERED";
    DeliveryStatus["FAILED"] = "FAILED";
    DeliveryStatus["BOUNCED"] = "BOUNCED";
    DeliveryStatus["REJECTED"] = "REJECTED";
})(DeliveryStatus || (DeliveryStatus = {}));
//# sourceMappingURL=notification.types.js.map