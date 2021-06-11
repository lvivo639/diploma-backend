"use strict";

const { balance } = require("../services/dropshipper-settings");

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async acceptInvitation(ctx) {
    const { inviteCode } = ctx.params;
    const { id } = { id: 2 };
    // const {id} = ctx.state.user;

    const supplier = await strapi
      .query("supplier-settings")
      .findOne({ uniqueHash: inviteCode });

    if (!supplier) return ctx.notFound("Supplier not found");

    const dropshipper = await strapi
      .query("dropshipper-settings")
      .findOne({ users_permissions_user: id });
    console.log(dropshipper);

    if (!dropshipper) return ctx.notFound("Dropshipper not found");

    if (
      dropshipper.supplier_settings.findIndex((s) => s.id === supplier.id) ===
      -1
    ) {
      await strapi.query("dropshipper-settings").update(
        { users_permissions_user: id },
        {
          supplier_settings: [...dropshipper.supplier_settings, supplier.id],
        }
      );
    }

    return supplier.id;
  },

  async balance(ctx) {
    const { dropshipper_setting_id, supplier_setting_id } = ctx.query;

    if (dropshipper_setting_id === undefined)
      return ctx.badRequest("dropshipper_setting_id is requred");
    if (supplier_setting_id === undefined)
      return ctx.badRequest("supplier_setting_id is requred");

    return await strapi.services["dropshipper-settings"].balance(
      dropshipper_setting_id,
      supplier_setting_id
    );
  },

  async settings(ctx) {
    const { telegramUsername, phoneNumber, cardNumber } = ctx.request.body;

    if (!telegramUsername)
      return ctx.badRequest("telegramUsername is required");
    if (!phoneNumber) return ctx.badRequest("phoneNumber is required");
    if (!cardNumber) return ctx.badRequest("cardNumber is required");

    if (!ctx.state.user.dropshipper_setting)
      return ctx.notFound("dropshipper not found is required");

    return await strapi
      .query("dropshipper-settings")
      .update(
        { id: ctx.state.user.dropshipper_setting },
        { telegramUsername, phoneNumber, cardNumber }
      );
  },
};
