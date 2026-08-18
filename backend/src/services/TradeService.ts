import pool from '../db/index';
import { v4 as uuidv4 } from 'uuid';

export class TradeService {
  async initiateMarketplaceListing(playerId: string, itemId: string, quantity: number, pricePerUnit: number) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const inventory = await client.query(
        'SELECT quantity FROM inventory WHERE player_id = $1 AND item_id = $2 FOR UPDATE',
        [playerId, itemId]
      );

      if (!inventory.rows[0] || inventory.rows[0].quantity < quantity) {
        throw new Error('Not enough items');
      }

      await client.query(
        'UPDATE inventory SET quantity = quantity - $1 WHERE player_id = $2 AND item_id = $3',
        [quantity, playerId, itemId]
      );

      const listingId = uuidv4();
      await client.query(
        `INSERT INTO marketplace_listings (id, seller_id, item_id, quantity, price_per_unit, status, expires_at)
         VALUES ($1, $2, $3, $4, $5, 'active', CURRENT_TIMESTAMP + INTERVAL '7 days')`,
        [listingId, playerId, itemId, quantity, pricePerUnit]
      );

      await client.query('COMMIT');
      return listingId;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async purchaseMarketplaceListing(listingId: string, buyerId: string, quantity: number) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const listing = await client.query(
        `SELECT id, seller_id, item_id, quantity, price_per_unit FROM marketplace_listings 
         WHERE id = $1 AND status = 'active' FOR UPDATE`,
        [listingId]
      );

      if (!listing.rows[0]) {
        throw new Error('Listing not found');
      }

      const listingData = listing.rows[0];
      if (listingData.quantity < quantity) {
        throw new Error('Not enough items in listing');
      }

      const totalCost = listingData.price_per_unit * quantity;
      const buyer = await client.query(
        'SELECT coins FROM players WHERE id = $1 FOR UPDATE',
        [buyerId]
      );

      if (!buyer.rows[0] || buyer.rows[0].coins < totalCost) {
        throw new Error('Not enough coins');
      }

      await client.query(
        'UPDATE players SET coins = coins - $1 WHERE id = $2',
        [totalCost, buyerId]
      );

      await client.query(
        'UPDATE players SET coins = coins + $1 WHERE id = $2',
        [totalCost, listingData.seller_id]
      );

      const existing = await client.query(
        'SELECT quantity FROM inventory WHERE player_id = $1 AND item_id = $2',
        [buyerId, listingData.item_id]
      );

      const newQuantity = (existing.rows[0]?.quantity || 0) + quantity;
      await client.query(
        `INSERT INTO inventory (player_id, item_id, quantity, rarity) VALUES ($1, $2, $3, 'common')
         ON CONFLICT (player_id, item_id) DO UPDATE SET quantity = $3`,
        [buyerId, listingData.item_id, newQuantity]
      );

      if (listingData.quantity === quantity) {
        await client.query(
          'UPDATE marketplace_listings SET status = $1, sold_at = CURRENT_TIMESTAMP WHERE id = $2',
          ['sold', listingId]
        );
      } else {
        await client.query(
          'UPDATE marketplace_listings SET quantity = quantity - $1 WHERE id = $2',
          [quantity, listingId]
        );
      }

      await client.query('COMMIT');
      return { totalCost };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async cancelMarketplaceListing(listingId: string, playerId: string) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const listing = await client.query(
        `SELECT id, seller_id, item_id, quantity FROM marketplace_listings 
         WHERE id = $1 AND seller_id = $2 AND status = 'active' FOR UPDATE`,
        [listingId, playerId]
      );

      if (!listing.rows[0]) {
        throw new Error('Listing not found or not yours');
      }

      const listingData = listing.rows[0];

      const existing = await client.query(
        'SELECT quantity FROM inventory WHERE player_id = $1 AND item_id = $2',
        [playerId, listingData.item_id]
      );

      const newQuantity = (existing.rows[0]?.quantity || 0) + listingData.quantity;
      await client.query(
        `INSERT INTO inventory (player_id, item_id, quantity, rarity) VALUES ($1, $2, $3, 'common')
         ON CONFLICT (player_id, item_id) DO UPDATE SET quantity = $3`,
        [playerId, listingData.item_id, newQuantity]
      );

      await client.query(
        'UPDATE marketplace_listings SET status = $1 WHERE id = $2',
        ['cancelled', listingId]
      );

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getMarketplaceListings(filter: { itemId?: string; minPrice?: number; maxPrice?: number; limit?: number; offset?: number } = {}) {
    let query = `
      SELECT ml.id, ml.seller_id, ml.item_id, ml.quantity, ml.price_per_unit, ml.created_at, p.username
      FROM marketplace_listings ml
      JOIN players p ON ml.seller_id = p.id
      WHERE ml.status = 'active'
    `;
    const values: unknown[] = [];
    let paramIndex = 1;

    if (filter.itemId) {
      query += ` AND ml.item_id = $${paramIndex++}`;
      values.push(filter.itemId);
    }

    if (filter.minPrice !== undefined) {
      query += ` AND ml.price_per_unit >= $${paramIndex++}`;
      values.push(filter.minPrice);
    }

    if (filter.maxPrice !== undefined) {
      query += ` AND ml.price_per_unit <= $${paramIndex++}`;
      values.push(filter.maxPrice);
    }

    query += ` ORDER BY ml.created_at DESC`;

    const limit = filter.limit || 50;
    const offset = filter.offset || 0;
    query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);
    return result.rows;
  }

  async initiateDirectTrade(initiatorId: string, recipientId: string, initiatorItems: string[], recipientItems: string[]) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const tradeId = uuidv4();
      await client.query(
        `INSERT INTO trades (id, initiator_id, recipient_id, initiator_items, recipient_items, status)
         VALUES ($1, $2, $3, $4, $5, 'pending')`,
        [tradeId, initiatorId, recipientId, JSON.stringify(initiatorItems), JSON.stringify(recipientItems)]
      );

      await client.query('COMMIT');
      return tradeId;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async acceptTrade(tradeId: string, playerId: string) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const trade = await client.query(
        `SELECT id, initiator_id, recipient_id, initiator_items, recipient_items, status FROM trades 
         WHERE id = $1 FOR UPDATE`,
        [tradeId]
      );

      if (!trade.rows[0]) {
        throw new Error('Trade not found');
      }

      const tradeData = trade.rows[0];
      if (tradeData.status !== 'pending') {
        throw new Error('Trade not pending');
      }

      if (tradeData.recipient_id !== playerId) {
        throw new Error('Not authorized to accept this trade');
      }

      const initiatorItems = JSON.parse(tradeData.initiator_items);
      const recipientItems = JSON.parse(tradeData.recipient_items);

      for (const itemId of initiatorItems) {
        const existing = await client.query(
          'SELECT quantity FROM inventory WHERE player_id = $1 AND item_id = $2',
          [tradeData.initiator_id, itemId]
        );

        if (!existing.rows[0]) {
          throw new Error('Initiator no longer has required items');
        }
      }

      for (const itemId of recipientItems) {
        const existing = await client.query(
          'SELECT quantity FROM inventory WHERE player_id = $1 AND item_id = $2',
          [tradeData.recipient_id, itemId]
        );

        if (!existing.rows[0]) {
          throw new Error('Recipient no longer has required items');
        }
      }

      for (const itemId of initiatorItems) {
        await client.query(
          'UPDATE inventory SET quantity = quantity - 1 WHERE player_id = $1 AND item_id = $2',
          [tradeData.initiator_id, itemId]
        );

        const existing = await client.query(
          'SELECT quantity FROM inventory WHERE player_id = $1 AND item_id = $2',
          [tradeData.recipient_id, itemId]
        );

        const newQuantity = (existing.rows[0]?.quantity || 0) + 1;
        await client.query(
          `INSERT INTO inventory (player_id, item_id, quantity, rarity) VALUES ($1, $2, $3, 'common')
           ON CONFLICT (player_id, item_id) DO UPDATE SET quantity = $3`,
          [tradeData.recipient_id, itemId, newQuantity]
        );
      }

      for (const itemId of recipientItems) {
        await client.query(
          'UPDATE inventory SET quantity = quantity - 1 WHERE player_id = $1 AND item_id = $2',
          [tradeData.recipient_id, itemId]
        );

        const existing = await client.query(
          'SELECT quantity FROM inventory WHERE player_id = $1 AND item_id = $2',
          [tradeData.initiator_id, itemId]
        );

        const newQuantity = (existing.rows[0]?.quantity || 0) + 1;
        await client.query(
          `INSERT INTO inventory (player_id, item_id, quantity, rarity) VALUES ($1, $2, $3, 'common')
           ON CONFLICT (player_id, item_id) DO UPDATE SET quantity = $3`,
          [tradeData.initiator_id, itemId, newQuantity]
        );
      }

      await client.query(
        'UPDATE trades SET status = $1 WHERE id = $2',
        ['completed', tradeId]
      );

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async declineTrade(tradeId: string, playerId: string) {
    const result = await pool.query(
      `UPDATE trades SET status = 'declined' 
       WHERE id = $1 AND (initiator_id = $2 OR recipient_id = $2) AND status = 'pending'
       RETURNING id`,
      [tradeId, playerId]
    );

    if (!result.rows[0]) {
      throw new Error('Trade not found or not authorized');
    }
  }
}

export default new TradeService();
