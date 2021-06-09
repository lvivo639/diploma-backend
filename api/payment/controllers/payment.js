"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async paymentRequest(ctx) {
    const { dropshipper_setting_id, supplier_setting_id, amount } = ctx.query;

    if (dropshipper_setting_id === undefined)
      return ctx.badRequest("dropshipper_setting_id is requred");
    if (supplier_setting_id === undefined)
      return ctx.badRequest("supplier_setting_id is requred");
    if (amount === undefined) return ctx.badRequest("amount is requred");

    const dropshipper_setting = await strapi
      .query("dropshipper-settings")
      .findOne({ id: dropshipper_setting_id });

    if (!dropshipper_setting)
      return ctx.notFound(
        `dropshipper_setting not found. ID: ${dropshipper_setting_id}`
      );

    const supplier_setting = await strapi
      .query("supplier-settings")
      .findOne({ id: supplier_setting_id });

    if (!supplier_setting)
      return ctx.notFound(
        `supplier_setting not found. ID: ${supplier_setting_id}`
      );

    console.log(dropshipper_setting_id, supplier_setting_id, amount);

    const dropshipperBalance = await strapi.services[
      "dropshipper-settings"
    ].balance(dropshipper_setting_id, supplier_setting_id);
    console.log(dropshipperBalance);
    if (amount > dropshipperBalance)
      return ctx.badRequest("Balance is not enough");

    const payment = await strapi.query("payment").create({
      dropshipper_setting: dropshipper_setting_id,
      supplier_setting: supplier_setting_id,
      amount,
    });
    console.log(payment);
    return payment;
  },

  async myPayments(ctx) {
    const { dropshipper_setting_id, supplier_setting_id } = ctx.query;

    if (dropshipper_setting_id === undefined)
      return ctx.badRequest("dropshipper_setting_id is requred");
    if (supplier_setting_id === undefined)
      return ctx.badRequest("supplier_setting_id is requred");

    return await strapi.query("payment").find({
      dropshipper_setting: dropshipper_setting_id,
      supplier_setting: supplier_setting_id,
    });
  },
};
