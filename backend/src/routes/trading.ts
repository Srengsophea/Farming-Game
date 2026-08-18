import express, { Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import TradeService from '../services/TradeService';

const router = express.Router();

router.post('/marketplace/list', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { itemId, quantity, pricePerUnit } = req.body;

    if (!itemId || !quantity || !pricePerUnit) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (quantity <= 0 || pricePerUnit <= 0) {
      return res.status(400).json({ error: 'Invalid quantity or price' });
    }

    const listingId = await TradeService.initiateMarketplaceListing(
      req.playerId!,
      itemId,
      quantity,
      pricePerUnit
    );

    res.json({ listingId });
  } catch (error: any) {
    console.error('Error creating listing:', error);
    res.status(400).json({ error: error.message || 'Failed to create listing' });
  }
});

router.get('/marketplace/listings', async (req: Request, res: Response) => {
  try {
    const itemId = req.query.itemId as string | undefined;
    const minPrice = req.query.minPrice ? parseInt(req.query.minPrice as string) : undefined;
    const maxPrice = req.query.maxPrice ? parseInt(req.query.maxPrice as string) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;

    const listings = await TradeService.getMarketplaceListings({
      itemId,
      minPrice,
      maxPrice,
      limit,
      offset
    });

    res.json({ listings });
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/marketplace/purchase', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { listingId, quantity } = req.body;

    if (!listingId || !quantity) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (quantity <= 0) {
      return res.status(400).json({ error: 'Invalid quantity' });
    }

    const result = await TradeService.purchaseMarketplaceListing(
      listingId,
      req.playerId!,
      quantity
    );

    res.json(result);
  } catch (error: any) {
    console.error('Error purchasing listing:', error);
    res.status(400).json({ error: error.message || 'Failed to purchase listing' });
  }
});

router.post('/marketplace/cancel', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { listingId } = req.body;

    if (!listingId) {
      return res.status(400).json({ error: 'Missing listing ID' });
    }

    await TradeService.cancelMarketplaceListing(listingId, req.playerId!);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error cancelling listing:', error);
    res.status(400).json({ error: error.message || 'Failed to cancel listing' });
  }
});

router.post('/trades/initiate', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { targetPlayerId, initiatorItems, recipientItems } = req.body;

    if (!targetPlayerId || !initiatorItems || !recipientItems) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const tradeId = await TradeService.initiateDirectTrade(
      req.playerId!,
      targetPlayerId,
      initiatorItems,
      recipientItems
    );

    res.json({ tradeId });
  } catch (error: any) {
    console.error('Error initiating trade:', error);
    res.status(400).json({ error: error.message || 'Failed to initiate trade' });
  }
});

router.post('/trades/:tradeId/accept', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { tradeId } = req.params;
    await TradeService.acceptTrade(tradeId, req.playerId!);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error accepting trade:', error);
    res.status(400).json({ error: error.message || 'Failed to accept trade' });
  }
});

router.post('/trades/:tradeId/decline', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { tradeId } = req.params;
    await TradeService.declineTrade(tradeId, req.playerId!);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error declining trade:', error);
    res.status(400).json({ error: error.message || 'Failed to decline trade' });
  }
});

export default router;
