'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::bid.bid', ({ strapi }) => ({
  async create(ctx) {
    // Get the user ID from the authenticated request
    const userId = ctx.state.user.id;

    // Get the item ID and bid amount from the request body
    const { item: itemId, amount } = ctx.request.body.data;

    // Fetch the item with its associated auction and bids
    const item = await strapi.entityService.findOne('api::item.item', itemId, {
      populate: ['auction', 'bids'],
    });

    if (!item) {
      return ctx.badRequest('Item not found');
    }

    // Check if the auction exists and is not over
    if (!item.auction || new Date(item.auction.endsAt) < new Date()) {
      return ctx.badRequest('The auction for this item has ended or does not exist');
    }

    // Check if the auction has started
    if (new Date(item.auction.startsAt) > new Date()) {
      return ctx.badRequest('The auction for this item has not started yet');
    }

    // Get the starting bid and minimum increment
    const startingBid = item.startingBid;
    const minIncrement = item.minIncrement;

    // Get the current highest bid
    const highestBid = item.bids.length > 0
      ? Math.max(...item.bids.map(bid => bid.amount))
      : 0;

    // Determine the minimum acceptable bid
    const minBid = Math.max(startingBid, highestBid + minIncrement);

    // Check if the new bid is higher than the minimum acceptable bid
    if (amount < minBid) {
      return ctx.badRequest(`Bid must be at least ${minBid}`);
    }

    // Add the user ID to the request body
    ctx.request.body.data = {
      ...ctx.request.body.data,
      users_permissions_user: userId,
    };

    // Call the default create action
    const response = await super.create(ctx);
    return response;
  },
}));
