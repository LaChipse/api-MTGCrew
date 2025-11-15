"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const journalsSchema = new mongoose_1.default.Schema({
    idUser: String,
    body: Object,
    action: String,
    date: Date
});
const journals = mongoose_1.default.model('journals', journalsSchema);
exports.default = journals;
//# sourceMappingURL=journal.js.map