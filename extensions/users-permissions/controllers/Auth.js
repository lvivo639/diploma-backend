"use strict";

/**
 * Auth.js controller
 *
 * @description: A set of functions called "actions" for managing `Auth`.
 */

/* eslint-disable no-useless-escape */
const { sanitizeEntity } = require("strapi-utils");

const emailRegExp =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

module.exports = {
  async callback(ctx) {
    const params = ctx.request.body;

    if (!params.identifier) {
      return ctx.badRequest(null, "Please provide your e-mail.");
    }

    if (!params.password) {
      return ctx.badRequest(null, "Please provide your password.");
    }

    const user = await strapi
      .query("user", "users-permissions")
      .findOne({ email: params.identifier });

    if (!user) {
      return ctx.badRequest(null, "Invalid e-mail or password");
    }

    if (user.blocked === true) {
      return ctx.badRequest(
        null,
        "Your account has been blocked by an administrator"
      );
    }

    const validPassword = await strapi.plugins[
      "users-permissions"
    ].services.user.validatePassword(params.password, user.password);

    if (!validPassword) {
      return ctx.badRequest(null, "Invalid e-mail or password");
    }

    ctx.send({
      jwt: strapi.plugins["users-permissions"].services.jwt.issue({
        id: user.id,
      }),
      user: sanitizeEntity(user.toJSON ? user.toJSON() : user, {
        model: strapi.query("user", "users-permissions").model,
      }),
    });
  },

  async register(ctx) {
    const params = ctx.request.body;

    if (!params.email) {
      return ctx.badRequest(null, "Please provide your email.");
    }

    if (!params.username) {
      return ctx.badRequest(null, "Please provide your username.");
    }

    if (!params.password) {
      return ctx.badRequest(null, "Please provide your password");
    }

    if (
      strapi.plugins["users-permissions"].services.user.isHashed(
        params.password
      )
    ) {
      return ctx.badRequest(
        null,
        "Your password cannot contain more than three times the symbol `$`."
      );
    }

    const role = await strapi
      .query("role", "users-permissions")
      .findOne({ type: params.role.toLowerCase() });

    if (!role) {
      return ctx.badRequest(null, "Please provide valid role.");
    }

    // Check if the provided email is valid or not.
    if (!emailRegExp.test(params.email)) {
      return ctx.badRequest(null, "Please provide valid email address.");
    }

    const dbEmailUser = await strapi
      .query("user", "users-permissions")
      .findOne({
        email: params.email,
      });

    if (dbEmailUser) {
      return ctx.badRequest(null, "Email is already taken.");
    }

    const dbUsernameUser = await strapi
      .query("user", "users-permissions")
      .findOne({
        username: params.username,
      });

    if (dbUsernameUser) {
      return ctx.badRequest(null, "Username is already taken.");
    }

    const hashedPassword = await strapi.plugins[
      "users-permissions"
    ].services.user.hashPassword(params);

    const newUser = {
      firstName: params.firstName,
      lastName: params.lastName,
      username: params.username,
      email: params.email,
      role: role.id,
      password: hashedPassword,
    };

    const user = await strapi
      .query("user", "users-permissions")
      .create(newUser);

    const sanitizedUser = sanitizeEntity(user, {
      model: strapi.query("user", "users-permissions").model,
    });

    const jwt = strapi.plugins["users-permissions"].services.jwt.issue({
      id: user.id,
    });

    if (role === "supplier") {
      await strapi.query("supplier-settings").create({
        storageName: generageString(10),
        uniqueHash: generageString(18),
        users_permissions_user: sanitizedUser.id,
      });
    } else if (role === "dropshipper") {
      await strapi.query("dropshipper-settings").create({
        users_permissions_user: sanitizedUser.id,
      });
    } else
      return ctx.send({
        jwt,
        user: sanitizedUser,
      });
  },
};
