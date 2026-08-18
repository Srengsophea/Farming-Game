import pool from '../db/index';
import { v4 as uuidv4 } from 'uuid';

export class SocialService {
  async sendFriendRequest(playerId: string, targetPlayerId: string) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      if (playerId === targetPlayerId) {
        throw new Error('Cannot add yourself');
      }

      const existing = await client.query(
        `SELECT id FROM friends 
         WHERE (player_id = $1 AND friend_id = $2) OR (player_id = $2 AND friend_id = $1)`,
        [playerId, targetPlayerId]
      );

      if (existing.rows[0]) {
        throw new Error('Friend request already exists');
      }

      const friendshipId = uuidv4();
      await client.query(
        `INSERT INTO friends (id, player_id, friend_id, status) 
         VALUES ($1, $2, $3, 'pending')`,
        [friendshipId, playerId, targetPlayerId]
      );

      await client.query('COMMIT');
      return friendshipId;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async acceptFriendRequest(friendshipId: string, playerId: string) {
    const result = await pool.query(
      `UPDATE friends SET status = 'accepted', accepted_at = CURRENT_TIMESTAMP 
       WHERE id = $1 AND friend_id = $2 AND status = 'pending'
       RETURNING id`,
      [friendshipId, playerId]
    );

    if (!result.rows[0]) {
      throw new Error('Friend request not found or not authorized');
    }
  }

  async declineFriendRequest(friendshipId: string, playerId: string) {
    const result = await pool.query(
      `DELETE FROM friends 
       WHERE id = $1 AND friend_id = $2 AND status = 'pending'
       RETURNING id`,
      [friendshipId, playerId]
    );

    if (!result.rows[0]) {
      throw new Error('Friend request not found or not authorized');
    }
  }

  async removeFriend(playerId: string, friendId: string) {
    const result = await pool.query(
      `DELETE FROM friends 
       WHERE status = 'accepted' AND 
       ((player_id = $1 AND friend_id = $2) OR (player_id = $2 AND friend_id = $1))
       RETURNING id`,
      [playerId, friendId]
    );

    if (!result.rows[0]) {
      throw new Error('Friendship not found');
    }
  }

  async getFriends(playerId: string) {
    const result = await pool.query(
      `SELECT 
        CASE 
          WHEN player_id = $1 THEN friend_id 
          ELSE player_id 
        END as friend_id,
        status,
        accepted_at
       FROM friends 
       WHERE (player_id = $1 OR friend_id = $1) AND status = 'accepted'`,
      [playerId]
    );

    const friendIds = result.rows.map(r => r.friend_id);

    if (friendIds.length === 0) {
      return [];
    }

    const friends = await pool.query(
      `SELECT id, username, level, farm_level FROM players WHERE id = ANY($1::uuid[])`,
      [friendIds]
    );

    return friends.rows;
  }

  async getPendingRequests(playerId: string) {
    const result = await pool.query(
      `SELECT f.id, f.player_id, p.username, p.level, f.requested_at
       FROM friends f
       JOIN players p ON f.player_id = p.id
       WHERE f.friend_id = $1 AND f.status = 'pending'`,
      [playerId]
    );

    return result.rows;
  }

  async createNotification(playerId: string, type: string, title: string, message: string, data?: Record<string, unknown>) {
    const notificationId = uuidv4();
    await pool.query(
      `INSERT INTO notifications (id, player_id, type, title, message, data) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [notificationId, playerId, type, title, message, JSON.stringify(data || {})]
    );
    return notificationId;
  }

  async getNotifications(playerId: string, unreadOnly: boolean = false) {
    let query = `SELECT id, type, title, message, data, read, created_at 
                 FROM notifications WHERE player_id = $1`;
    const values: unknown[] = [playerId];

    if (unreadOnly) {
      query += ` AND read = false`;
    }

    query += ` ORDER BY created_at DESC LIMIT 50`;

    const result = await pool.query(query, values);
    return result.rows;
  }

  async markNotificationRead(notificationId: string, playerId: string) {
    const result = await pool.query(
      `UPDATE notifications SET read = true 
       WHERE id = $1 AND player_id = $2
       RETURNING id`,
      [notificationId, playerId]
    );

    if (!result.rows[0]) {
      throw new Error('Notification not found');
    }
  }

  async markAllNotificationsRead(playerId: string) {
    await pool.query(
      `UPDATE notifications SET read = true WHERE player_id = $1 AND read = false`,
      [playerId]
    );
  }
}

export default new SocialService();
