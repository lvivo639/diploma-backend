"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async findProductOrders(ctx) {
    const { dropshipper_setting_id, supplier_setting_id } = ctx.query;

    if (dropshipper_setting_id === undefined)
      return ctx.badRequest("dropshipper_setting_id is requred");
    if (supplier_setting_id === undefined)
      return ctx.badRequest("supplier_setting_id is requred");

    const cart = await strapi.query("cart").findOne({
      dropshipper_setting: dropshipper_setting_id,
      supplier_setting: supplier_setting_id,
    });

    if (!cart) return ctx.notFound("Cart not found");

    return await strapi.query("product-order").find({
      cart: cart.id,
    });
  },

  async changeCount(ctx) {
    const { newValue } = ctx.query;
    const { id } = ctx.params;

    if (newValue === undefined) return ctx.badRequest("newValue is requred");
    if (id === undefined) return ctx.badRequest("id is requred");

    const productOrder = await strapi.query("product-order").findOne({
      id,
    });

    if (!productOrder) return ctx.notFound("productOrder not found");

    if (newValue > productOrder.product.count)
      return ctx.badRequest("newValue is greater than count");

    if (newValue < 1) return ctx.badRequest("newValue is less than zero");

    await strapi.query("product-order").update(
      {
        id,
      },
      { count: newValue }
    );
    return newValue;
  },
};
