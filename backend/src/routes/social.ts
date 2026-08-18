import express, { Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import PlayerService from '../services/PlayerService';
import SocialService from '../services/SocialService';

const router = express.Router();

router.post('/friends/request', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { targetPlayerId } = req.body;

    if (!targetPlayerId) {
      return res.status(400).json({ error: 'Missing target player ID' });
    }

    const friendshipId = await SocialService.sendFriendRequest(req.playerId!, targetPlayerId);
    res.json({ friendshipId });
  } catch (error: any) {
    console.error('Error sending friend request:', error);
    res.status(400).json({ error: error.message || 'Failed to send friend request' });
  }
});

router.post('/friends/:friendshipId/accept', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { friendshipId } = req.params;
    await SocialService.acceptFriendRequest(friendshipId, req.playerId!);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error accepting friend request:', error);
    res.status(400).json({ error: error.message || 'Failed to accept friend request' });
  }
});

router.post('/friends/:friendshipId/decline', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { friendshipId } = req.params;
    await SocialService.declineFriendRequest(friendshipId, req.playerId!);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error declining friend request:', error);
    res.status(400).json({ error: error.message || 'Failed to decline friend request' });
  }
});

router.get('/friends', authMiddleware, async (req: Request, res: Response) => {
  try {
    const friends = await SocialService.getFriends(req.playerId!);
    res.json({ friends });
  } catch (error) {
    console.error('Error fetching friends:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/friends/requests', authMiddleware, async (req: Request, res: Response) => {
  try {
    const requests = await SocialService.getPendingRequests(req.playerId!);
    res.json({ requests });
  } catch (error) {
    console.error('Error fetching friend requests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/friends/:friendId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { friendId } = req.params;
    await SocialService.removeFriend(req.playerId!, friendId);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error removing friend:', error);
    res.status(400).json({ error: error.message || 'Failed to remove friend' });
  }
});

router.get('/players/search', async (req: Request, res: Response) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Missing search query' });
    }

    const players = await PlayerService.searchPlayers(q, 20);
    res.json({ players });
  } catch (error) {
    console.error('Error searching players:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/players/:playerId', async (req: Request, res: Response) => {
  try {
    const { playerId } = req.params;
    const player = await PlayerService.getPlayer(playerId);

    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    const farm = await PlayerService.getFarm(playerId);
    res.json({ player, farm });
  } catch (error) {
    console.error('Error fetching player:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/notifications', authMiddleware, async (req: Request, res: Response) => {
  try {
    const unreadOnly = req.query.unreadOnly === 'true';
    const notifications = await SocialService.getNotifications(req.playerId!, unreadOnly);
    res.json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/notifications/:notificationId/read', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { notificationId } = req.params;
    await SocialService.markNotificationRead(notificationId, req.playerId!);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error marking notification as read:', error);
    res.status(400).json({ error: error.message || 'Failed to mark notification as read' });
  }
});

router.post('/notifications/read-all', authMiddleware, async (req: Request, res: Response) => {
  try {
    await SocialService.markAllNotificationsRead(req.playerId!);
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
