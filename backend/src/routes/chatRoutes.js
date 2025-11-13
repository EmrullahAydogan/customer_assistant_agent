// ============================================
// Chat Routes
// Endpoints for chat history and conversations
// ============================================

const express = require('express');
const router = express.Router();
const { queryPostgres } = require('../config/database');
const logger = require('../config/logger');

// ============================================
// GET /api/chat/conversations
// Get all conversations with pagination
// ============================================
router.get('/conversations', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const status = req.query.status; // Filter by status
    const platform = req.query.platform; // Filter by platform

    let query = `
      SELECT
        conversation_id::text,
        customer_name,
        customer_contact,
        customer_email,
        platform,
        category,
        subcategory,
        status,
        priority,
        sentiment,
        satisfaction_score,
        total_messages,
        first_response_time_seconds,
        avg_response_time_seconds,
        start_time,
        end_time,
        created_at
      FROM conversations
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    if (status) {
      query += ` AND status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (platform) {
      query += ` AND platform = $${paramCount}`;
      params.push(platform);
      paramCount++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await queryPostgres(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM conversations WHERE 1=1';
    const countParams = [];
    if (status) {
      countQuery += ' AND status = $1';
      countParams.push(status);
    }
    if (platform) {
      countQuery += ` AND platform = $${countParams.length + 1}`;
      countParams.push(platform);
    }

    const countResult = await queryPostgres(countQuery, countParams);
    const totalCount = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch conversations',
      message: error.message
    });
  }
});

// ============================================
// GET /api/chat/conversations/:id
// Get specific conversation with messages
// ============================================
router.get('/conversations/:id', async (req, res) => {
  try {
    const conversationId = req.params.id;

    // Get conversation details
    const convQuery = `
      SELECT * FROM conversations
      WHERE conversation_id = $1::uuid
    `;
    const convResult = await queryPostgres(convQuery, [conversationId]);

    if (convResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }

    // Get messages
    const messagesQuery = `
      SELECT
        id,
        role,
        content,
        content_type,
        model_used,
        tokens_used,
        response_time_ms,
        rag_context,
        sources_used,
        metadata,
        timestamp
      FROM messages
      WHERE conversation_id = $1::uuid
      ORDER BY timestamp ASC
    `;
    const messagesResult = await queryPostgres(messagesQuery, [conversationId]);

    res.json({
      success: true,
      data: {
        conversation: convResult.rows[0],
        messages: messagesResult.rows
      }
    });
  } catch (error) {
    logger.error('Error fetching conversation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch conversation',
      message: error.message
    });
  }
});

// ============================================
// GET /api/chat/messages
// Get recent messages across all conversations
// ============================================
router.get('/messages', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;

    const query = `
      SELECT * FROM v_message_history
      LIMIT $1
    `;
    const result = await queryPostgres(query, [limit]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    logger.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch messages',
      message: error.message
    });
  }
});

// ============================================
// GET /api/chat/search
// Search conversations and messages
// ============================================
router.get('/search', async (req, res) => {
  try {
    const searchTerm = req.query.q;
    if (!searchTerm) {
      return res.status(400).json({
        success: false,
        error: 'Search term is required (q parameter)'
      });
    }

    // Search in conversations
    const convQuery = `
      SELECT
        conversation_id::text,
        customer_name,
        customer_contact,
        platform,
        category,
        status,
        start_time
      FROM conversations
      WHERE
        customer_name ILIKE $1 OR
        customer_contact ILIKE $1 OR
        customer_email ILIKE $1 OR
        category ILIKE $1
      ORDER BY created_at DESC
      LIMIT 20
    `;

    // Search in messages
    const messagesQuery = `
      SELECT
        m.id,
        m.conversation_id::text,
        c.customer_name,
        m.role,
        m.content,
        m.timestamp
      FROM messages m
      JOIN conversations c ON m.conversation_id = c.conversation_id
      WHERE m.content ILIKE $1
      ORDER BY m.timestamp DESC
      LIMIT 50
    `;

    const searchPattern = `%${searchTerm}%`;
    const [convResult, messagesResult] = await Promise.all([
      queryPostgres(convQuery, [searchPattern]),
      queryPostgres(messagesQuery, [searchPattern])
    ]);

    res.json({
      success: true,
      data: {
        conversations: convResult.rows,
        messages: messagesResult.rows
      }
    });
  } catch (error) {
    logger.error('Error searching:', error);
    res.status(500).json({
      success: false,
      error: 'Search failed',
      message: error.message
    });
  }
});

module.exports = router;
