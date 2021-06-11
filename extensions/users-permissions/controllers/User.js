"use strict";

/**
 * Auth.js controller
 *
 * @description: A set of functions called "actions" for managing `Auth`.
 */

/* eslint-disable no-useless-escape */
module.exports = {
  async settings(ctx) {
    const { firstName, lastName, email } = ctx.request.body;

    if (!firstName) return ctx.badRequest("firstName is required");
    if (!lastName) return ctx.badRequest("lastName is required");
    if (!email) return ctx.badRequest("email is required");

    return await strapi
      .query("user", "users-permissions")
      .update({ id: ctx.state.user.id }, { firstName, lastName, email });
  },

  async changePassword(ctx) {
    const { password, newPassword } = ctx.request.body;

    if (!password) return ctx.badRequest("password is required");
    if (!newPassword) return ctx.badRequest("newPassword is required");

    const valid = await strapi.plugins[
      "users-permissions"
    ].services.user.validatePassword(password, ctx.state.user.password);

    if (!valid) return ctx.badRequest("password is not valid");

    const updatedPassword = await strapi.plugins[
      "users-permissions"
    ].services.user.hashPassword({
      password: newPassword,
    });

    return await strapi
      .query("user", "users-permissions")
      .update({ id: ctx.state.user.id }, { updatedPassword });
  },

  async fetchAuthenticatedUser(ctx) {
    return strapi
      .query("user", "users-permissions")
      .findOne({ id: ctx.state.user.id }, [
        "supplier_setting",
        "dropshipper_setting",
        "role",
      ]);
  },
};
