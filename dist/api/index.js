"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = __importDefault(require("../src/api"));
const PORT = 3000;
api_1.default.get("/", (req, res) => res.send("Express on Vercel"));
api_1.default.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
module.exports = api_1.default;
//# sourceMappingURL=index.js.map