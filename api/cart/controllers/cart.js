"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async addToCard(ctx) {
    const { dropshipper_setting_id, supplier_setting_id, product_id } =
      ctx.query;

    if (dropshipper_setting_id === undefined)
      return ctx.badRequest("dropshipper_setting_id is requred");
    if (supplier_setting_id === undefined)
      return ctx.badRequest("supplier_setting_id is requred");

    if (product_id === undefined)
      return ctx.badRequest("product_id is requred");

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

    const product = await strapi
      .query("product")
      .findOne({ id: product_id, supplier_setting: supplier_setting_id });

    if (!product) return ctx.notFound(`product not found. ID: ${product_id}`);

    if (product.count === 0)
      return ctx.badRequest("Supplier does not have this product now/");

    let cart = await strapi.query("cart").findOne({
      dropshipper_setting: dropshipper_setting_id,
      supplier_setting: supplier_setting_id,
    });

    const productOrder = cart.product_orders.find(
      (po) => po.product === product.id
    );

    if (productOrder) return productOrder;

    if (!cart) {
      cart = await strapi.query("cart").create({
        dropshipper_setting: dropshipper_setting_id,
        supplier_setting: supplier_setting_id,
      });
    }

    return await strapi.query("product-order").create({
      product: product.id,
      cart: cart.id,
      count: 1,
      price: product.price,
    });
  },
  async price(ctx) {
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

    const productOrderList = await strapi.query("product-order").find({
      cart: cart.id,
    });

    return productOrderList.reduce(
      (acc, curr) => acc + curr.product.price * curr.count,
      0
    );
  },

  async createOrder(ctx) {
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

    for (const productOrder of cart.product_orders) {
      const prod = await strapi
        .query("product")
        .findOne({ id: productOrder.product });
      await strapi
        .query("product")
        .update(
          { id: productOrder.product },
          { count: prod.count - productOrder.count }
        );
    }

    await strapi.query("cart").update({ id: cart.id }, { product_orders: [] });

    return await strapi.query("order").create({
      address: ctx.request.body.address,
      fullName: ctx.request.body.fullName,
      description: ctx.request.body.description,
      price: ctx.request.body.price,
      dropshipper_setting: dropshipper_setting_id,
      supplier_setting: supplier_setting_id,
      product_orders: cart.product_orders.map((po) => po.id),
    });
  },
};
