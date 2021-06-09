"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async my(ctx) {
    const { dropshipper_setting_id, supplier_setting_id } = ctx.query;

    if (dropshipper_setting_id === undefined)
      return ctx.badRequest("dropshipper_setting_id is requred");
    if (supplier_setting_id === undefined)
      return ctx.badRequest("supplier_setting_id is requred");

    const orderList = await strapi.query("order").find(
      {
        dropshipper_setting: dropshipper_setting_id,
        supplier_setting: supplier_setting_id,
        _sort: "created_at:desc",
      },
      ["product_orders", "product_orders.product"]
    );

    return orderList;
  },
};
