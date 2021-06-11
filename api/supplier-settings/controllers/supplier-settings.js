"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

const generateString = require("../../../common/generateString");
module.exports = {
  async users(ctx) {
    const { supplier_setting_id } = ctx.params;

    if (supplier_setting_id === undefined)
      return ctx.badRequest("supplier_setting_id is requred");

    if (
      !ctx.state.user ||
      ctx.state.user.supplier_setting !== Number(supplier_setting_id)
    ) {
      return ctx.forbidden("user is not include supplier_setting_id");
    }

    const userList = await strapi.query("dropshipper-settings").find({
      supplier_settings_contains: supplier_setting_id,
    });

    return userList;
  },

  async removeUser(ctx) {
    if (!ctx.state.user || ctx.state.user.supplier_setting === undefined) {
      return ctx.badRequest("user is not supplier");
    }

    const { dropshipper_setting_id } = ctx.params;

    if (dropshipper_setting_id === undefined) {
      return ctx.badRequest("supplier_setting_id is requred");
    }

    const { supplier_setting } = ctx.state.user;

    const supplier = await strapi
      .query("supplier-settings")
      .findOne({ id: supplier_setting });

    if (!supplier) {
      return ctx.badRequest("supplier does not exist");
    }

    const dropshipper_setting_id_number = Number(dropshipper_setting_id);

    const filtered_array = supplier.dropshipper_settings.filter(
      (ds) => ds.id !== dropshipper_setting_id_number
    );

    await strapi.query("supplier-settings").update(
      { id: supplier_setting },
      {
        dropshipper_settings: filtered_array.map((ds) => ds.id),
      }
    );

    return true;
  },

  async orders(ctx) {
    if (!ctx.state.user || ctx.state.user.supplier_setting === undefined) {
      return ctx.badRequest("user is not supplier");
    }

    const orderList = await strapi
      .query("order")
      .find({ supplier_setting: ctx.state.user.supplier_setting }, [
        "product_orders.product",
      ]);

    return orderList;
  },

  async changeOrderStatus(ctx) {
    if (!ctx.state.user || ctx.state.user.supplier_setting === undefined) {
      return ctx.badRequest("user is not supplier");
    }
    const { order_id } = ctx.params;

    if (order_id === undefined) {
      return ctx.badRequest("order_id is requred");
    }

    const { status } = ctx.query;

    if (status === undefined) {
      return ctx.badRequest("status is requred");
    }

    return await strapi
      .query("order")
      .update(
        { id: order_id, supplier_setting: ctx.state.user.supplier_setting },
        { status: status }
      );
  },

  async payments(ctx) {
    if (!ctx.state.user || ctx.state.user.supplier_setting === undefined) {
      return ctx.badRequest("user is not supplier");
    }

    const paymentList = await strapi
      .query("payment")
      .find({ supplier_setting: ctx.state.user.supplier_setting });

    return paymentList;
  },

  async changePaymentStatus(ctx) {
    if (!ctx.state.user || ctx.state.user.supplier_setting === undefined) {
      return ctx.badRequest("user is not supplier");
    }
    const { payment_id } = ctx.params;

    if (payment_id === undefined) {
      return ctx.badRequest("payment_id is requred");
    }

    const payment = await strapi.query("payment").findOne({
      id: payment_id,
      supplier_setting: ctx.state.user.supplier_setting,
    });

    if (payment === undefined) {
      return ctx.notFound("payment not found");
    }
    const updated = await strapi.query("payment").update(
      { id: payment_id },
      {
        paymentDateTime: payment.paymentDateTime ? null : new Date().getTime(),
      }
    );

    return updated.paymentDateTime || "";
  },

  async settings(ctx) {
    const { storageName, description } = ctx.request.body;

    if (!storageName) return ctx.badRequest("storageName is required");
    if (!description) return ctx.badRequest("description is required");

    return await strapi
      .query("supplier-settings")
      .update(
        { id: ctx.state.user.supplier_setting },
        { storageName, description }
      );
  },

  async changeUniqueHash(ctx) {
    return await strapi.query("supplier-settings").update(
      { id: ctx.state.user.supplier_setting },
      {
        uniqueHash: generateString(18),
      }
    );
  },
};
