"use strict";

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
};
