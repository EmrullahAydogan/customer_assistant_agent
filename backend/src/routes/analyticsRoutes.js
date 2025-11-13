// ============================================
// Analytics Routes
// Endpoints for chat analytics and statistics
// ============================================

const express = require('express');
const router = express.Router();
const { queryPostgres } = require('../config/database');
const logger = require('../config/logger');

// ============================================
// GET /api/analytics/daily
// Get daily statistics
// ============================================
router.get('/daily', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const platform = req.query.platform;

    let query = `
      SELECT * FROM v_daily_analytics
      WHERE date >= CURRENT_DATE - INTERVAL '${days} days'
    `;

    const params = [];
    if (platform) {
      query += ' AND platform = $1';
      params.push(platform);
    }

    query += ' ORDER BY date DESC';

    const result = await queryPostgres(query, params);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    logger.error('Error fetching daily analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch daily analytics',
      message: error.message
    });
  }
});

// ============================================
// GET /api/analytics/summary
// Get overall summary statistics
// ============================================
router.get('/summary', async (req, res) => {
  try {
    const queries = {
      // Total conversations
      totalConversations: `
        SELECT COUNT(*) as count FROM conversations
      `,

      // Active conversations
      activeConversations: `
        SELECT COUNT(*) as count FROM conversations WHERE status = 'active'
      `,

      // Total messages
      totalMessages: `
        SELECT COUNT(*) as count FROM messages
      `,

      // Average satisfaction
      avgSatisfaction: `
        SELECT AVG(satisfaction_score) as avg_score
        FROM conversations
        WHERE satisfaction_score IS NOT NULL
      `,

      // Sentiment distribution
      sentimentDistribution: `
        SELECT
          sentiment,
          COUNT(*) as count
        FROM conversations
        WHERE sentiment IS NOT NULL
        GROUP BY sentiment
      `,

      // Platform distribution
      platformDistribution: `
        SELECT
          platform,
          COUNT(*) as count
        FROM conversations
        GROUP BY platform
      `,

      // Category distribution
      categoryDistribution: `
        SELECT
          category,
          COUNT(*) as count
        FROM conversations
        GROUP BY category
        ORDER BY count DESC
        LIMIT 10
      `,

      // Average response time
      avgResponseTime: `
        SELECT
          AVG(first_response_time_seconds) as avg_first_response,
          AVG(avg_response_time_seconds) as avg_response_time
        FROM conversations
        WHERE first_response_time_seconds IS NOT NULL
      `,

      // Token usage today
      tokensToday: `
        SELECT
          COALESCE(SUM(total_tokens_used), 0) as tokens_used
        FROM daily_stats
        WHERE date = CURRENT_DATE
      `
    };

    // Execute all queries in parallel
    const results = await Promise.all(
      Object.entries(queries).map(async ([key, query]) => {
        const result = await queryPostgres(query);
        return [key, result.rows];
      })
    );

    // Build response object
    const summary = Object.fromEntries(results);

    res.json({
      success: true,
      data: {
        totalConversations: parseInt(summary.totalConversations[0].count),
        activeConversations: parseInt(summary.activeConversations[0].count),
        totalMessages: parseInt(summary.totalMessages[0].count),
        avgSatisfactionScore: parseFloat(summary.avgSatisfaction[0].avg_score || 0).toFixed(2),
        avgFirstResponseTime: parseFloat(summary.avgResponseTime[0].avg_first_response || 0).toFixed(2),
        avgResponseTime: parseFloat(summary.avgResponseTime[0].avg_response_time || 0).toFixed(2),
        tokensUsedToday: parseInt(summary.tokensToday[0].tokens_used),
        sentimentDistribution: summary.sentimentDistribution,
        platformDistribution: summary.platformDistribution,
        categoryDistribution: summary.categoryDistribution
      }
    });
  } catch (error) {
    logger.error('Error fetching summary analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch summary analytics',
      message: error.message
    });
  }
});

// ============================================
// GET /api/analytics/performance
// Get performance metrics
// ============================================
router.get('/performance', async (req, res) => {
  try {
    const query = `
      SELECT
        DATE(timestamp) as date,
        COUNT(*) as message_count,
        AVG(response_time_ms) as avg_response_time_ms,
        MIN(response_time_ms) as min_response_time_ms,
        MAX(response_time_ms) as max_response_time_ms,
        AVG(tokens_used) as avg_tokens_used,
        SUM(tokens_used) as total_tokens_used
      FROM messages
      WHERE role = 'assistant'
        AND response_time_ms IS NOT NULL
        AND timestamp >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE(timestamp)
      ORDER BY date DESC
    `;

    const result = await queryPostgres(query);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    logger.error('Error fetching performance metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch performance metrics',
      message: error.message
    });
  }
});

// ============================================
// GET /api/analytics/trends
// Get trend data for charts
// ============================================
router.get('/trends', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;

    const query = `
      SELECT
        date,
        total_conversations,
        total_messages,
        total_tokens_used,
        positive_sentiment_count,
        negative_sentiment_count,
        neutral_sentiment_count,
        avg_satisfaction_score
      FROM daily_stats
      WHERE date >= CURRENT_DATE - INTERVAL '${days} days'
      ORDER BY date ASC
    `;

    const result = await queryPostgres(query);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    logger.error('Error fetching trends:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trends',
      message: error.message
    });
  }
});

module.exports = router;
