"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv = require('dotenv');
dotenv.config({ path: '.env', override: true });
exports.config = {
    "srv_mongo": process.env.SRV_MONGO,
    "secret_key": process.env.SECRET_KEY
};
//# sourceMappingURL=config.js.map