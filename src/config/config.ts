const dotenv = require('dotenv');
dotenv.config({ path: '.env', override: true });

export const config = {
    "srv_mongo": process.env.SRV_MONGO,
    "secret_key": process.env.SECRET_KEY,
    "app_url": process.env.APP_URL
}