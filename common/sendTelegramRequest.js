const axios = require("axios");

const SERVER_URL = process.env.SERVER_URL || "https://1c6c4020de3a.ngrok.io";

const sendTelegramRequest = async (method, params) =>
  await axios.post(
    `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/${method}`,
    params
  );

module.exports = sendTelegramRequest;
