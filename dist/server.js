"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = __importDefault(require("./api"));
const PORT = 9000;
api_1.default.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
//# sourceMappingURL=server.js.map