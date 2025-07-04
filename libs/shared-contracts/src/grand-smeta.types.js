/**
 * Типы для работы с форматом Гранд Смета
 * Основано на спецификации файлов .gs, .gsp, .gsw
 */
// Основные категории работ в Гранд Смета
export var GrandSmetaWorkCategory;
(function (GrandSmetaWorkCategory) {
    GrandSmetaWorkCategory["EARTHWORKS"] = "EARTHWORKS";
    GrandSmetaWorkCategory["CONCRETE"] = "CONCRETE";
    GrandSmetaWorkCategory["REINFORCEMENT"] = "REINFORCEMENT";
    GrandSmetaWorkCategory["MASONRY"] = "MASONRY";
    GrandSmetaWorkCategory["STEEL_STRUCTURES"] = "STEEL_STRUCTURES";
    GrandSmetaWorkCategory["ROOFING"] = "ROOFING";
    GrandSmetaWorkCategory["INSULATION"] = "INSULATION";
    GrandSmetaWorkCategory["FINISHING"] = "FINISHING";
    GrandSmetaWorkCategory["ENGINEERING"] = "ENGINEERING";
    GrandSmetaWorkCategory["LANDSCAPING"] = "LANDSCAPING";
})(GrandSmetaWorkCategory || (GrandSmetaWorkCategory = {}));
// Уровень уверенности ИИ
export var ConfidenceLevel;
(function (ConfidenceLevel) {
    ConfidenceLevel["HIGH"] = "HIGH";
    ConfidenceLevel["MEDIUM"] = "MEDIUM";
    ConfidenceLevel["LOW"] = "LOW";
    ConfidenceLevel["UNCERTAIN"] = "UNCERTAIN";
})(ConfidenceLevel || (ConfidenceLevel = {}));
// Источник данных для расценки
export var PriceSource;
(function (PriceSource) {
    PriceSource["FER"] = "FER";
    PriceSource["TER"] = "TER";
    PriceSource["MARKET"] = "MARKET";
    PriceSource["MANUAL"] = "MANUAL";
    PriceSource["AI_SUGGESTED"] = "AI_SUGGESTED";
})(PriceSource || (PriceSource = {}));
// Экспорт типов
export * from './grand-smeta.types';
//# sourceMappingURL=grand-smeta.types.js.map