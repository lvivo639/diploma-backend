"use strict";

/**
 * Auth.js controller
 *
 * @description: A set of functions called "actions" for managing `Auth`.
 */

/* eslint-disable no-useless-escape */
const sendTelegramRequest = require("../../../common/sendTelegramRequest");

module.exports = {
  async changeTelegamWebhook(ctx) {
    const url = `${SERVER_URL}/telegramWebhook`;
    await sendTelegramRequest("setWebhook", {
      url,
    });
    return url;
  },

  async telegramWebhook(ctx) {
    const text = ctx.request.body.message.text;
    const telegramId = ctx.request.body.message.chat.id;

    if (text === "/start") {
      await sendTelegramRequest("sendMessage", {
        chat_id: telegramId,
        text: "Send your Telegram Code from dropshipper settings to receive newsletters.",
      });
    }

    const dropshipper = await strapi
      .query("dropshipper-settings")
      .findOne({ telegramCode: text }, ["users_permissions_user"]);

    if (!dropshipper) {
      await sendTelegramRequest("sendMessage", {
        chat_id: telegramId,
        text: "Your code is invalid. Please send your Telegram Code from dropshipper settings to receive newsletters.",
      });
    } else {
      await strapi
        .query("dropshipper-settings")
        .update({ telegramCode: text }, { telegramId });

      await sendTelegramRequest("sendMessage", {
        chat_id: telegramId,
        text: `Hello, ${dropshipper.users_permissions_user.firstName} ${dropshipper.users_permissions_user.lastName}! Your telegram is connected! Now you can receive newsletters from suppliers here`,
      });
    }

    return true;
  },
};
