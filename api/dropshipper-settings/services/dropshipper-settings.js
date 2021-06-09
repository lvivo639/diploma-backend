"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-services)
 * to customize this service
 */

module.exports = {
  async balance(dropshipper_setting_id, supplier_setting_id) {
    const orderList = await strapi.query("order").find(
      {
        dropshipper_setting: dropshipper_setting_id,
        supplier_setting: supplier_setting_id,
      },
      ["product_orders"]
    );

    const profit = orderList.reduce((sum, order) => {
      if (order.status !== "received") return sum;

      const supplierPrice = order.product_orders.reduce(
        (acc, cur) => acc + cur.price * cur.count,
        0
      );

      return sum + (order.price - supplierPrice);
    }, 0);

    const paymentList = await strapi.query("payment").find({
      dropshipper_setting: dropshipper_setting_id,
      supplier_setting: supplier_setting_id,
    });

    const payments = paymentList.reduce((acc, cur) => acc + cur.amount, 0);

    return profit - payments;
  },
};
