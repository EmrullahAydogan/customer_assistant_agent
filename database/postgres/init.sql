-- ============================================
-- PostgreSQL Initialization Script
-- Customer Assistant Agent - Chat Database
-- ============================================

-- Create chat_database (main database)
CREATE DATABASE chat_database;
\c chat_database;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CONVERSATIONS TABLE
-- ============================================
CREATE TABLE conversations (
    conversation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_contact VARCHAR(100),
    customer_email VARCHAR(255),

    -- Conversation metadata
    platform VARCHAR(50) DEFAULT 'web',
    category VARCHAR(100) DEFAULT 'genel',
    subcategory VARCHAR(100),

    -- Status tracking
    status VARCHAR(50) DEFAULT 'active',
    priority VARCHAR(50) DEFAULT 'medium',
    sentiment VARCHAR(50) DEFAULT 'neutral',
    satisfaction_score INTEGER CHECK (satisfaction_score BETWEEN 1 AND 5),

    -- Agent info
    assigned_agent VARCHAR(100) DEFAULT 'ai',

    -- Timing
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    first_response_time_seconds NUMERIC(10,2),
    avg_response_time_seconds NUMERIC(10,2),

    -- Message counts
    total_messages INTEGER DEFAULT 0,

    -- Tags and metadata
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    metadata JSONB DEFAULT '{}'::jsonb,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for conversations
CREATE INDEX idx_conversations_customer_id ON conversations(customer_id);
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_conversations_platform ON conversations(platform);
CREATE INDEX idx_conversations_category ON conversations(category);
CREATE INDEX idx_conversations_created_at ON conversations(created_at DESC);
CREATE INDEX idx_conversations_sentiment ON conversations(sentiment);

-- ============================================
-- MESSAGES TABLE
-- ============================================
CREATE TABLE messages (
    id BIGSERIAL PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES conversations(conversation_id) ON DELETE CASCADE,

    -- Message content
    role VARCHAR(50) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    content_type VARCHAR(50) DEFAULT 'text',

    -- AI metadata
    model_used VARCHAR(100),
    tokens_used INTEGER,
    response_time_ms INTEGER,

    -- RAG context
    rag_context JSONB DEFAULT '{}'::jsonb,
    sources_used TEXT[] DEFAULT ARRAY[]::TEXT[],

    -- Additional metadata
    metadata JSONB DEFAULT '{}'::jsonb,

    -- Timestamps
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for messages
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_role ON messages(role);
CREATE INDEX idx_messages_timestamp ON messages(timestamp DESC);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- ============================================
-- DAILY_STATS TABLE
-- ============================================
CREATE TABLE daily_stats (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    platform VARCHAR(50) NOT NULL,

    -- Conversation metrics
    total_conversations INTEGER DEFAULT 0,
    active_conversations INTEGER DEFAULT 0,
    completed_conversations INTEGER DEFAULT 0,

    -- Message metrics
    total_messages INTEGER DEFAULT 0,
    user_messages INTEGER DEFAULT 0,
    ai_messages INTEGER DEFAULT 0,

    -- AI metrics
    total_tokens_used INTEGER DEFAULT 0,
    avg_response_time_seconds NUMERIC(10,2),

    -- Sentiment metrics
    positive_sentiment_count INTEGER DEFAULT 0,
    neutral_sentiment_count INTEGER DEFAULT 0,
    negative_sentiment_count INTEGER DEFAULT 0,

    -- Satisfaction metrics
    avg_satisfaction_score NUMERIC(3,2),

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Unique constraint
    UNIQUE(date, platform)
);

-- Indexes for daily_stats
CREATE INDEX idx_daily_stats_date ON daily_stats(date DESC);
CREATE INDEX idx_daily_stats_platform ON daily_stats(platform);

-- ============================================
-- TRIGGER: Update total_messages on message insert
-- ============================================
CREATE OR REPLACE FUNCTION update_conversation_message_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations
    SET total_messages = total_messages + 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE conversation_id = NEW.conversation_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_message_count
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_message_count();

-- ============================================
-- TRIGGER: Update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_daily_stats_updated_at
    BEFORE UPDATE ON daily_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- N8N DATABASE (for n8n internal use)
-- ============================================
CREATE DATABASE n8n_database;
\c n8n_database;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE chat_database TO chat_user;
GRANT ALL PRIVILEGES ON DATABASE n8n_database TO chat_user;

-- ============================================
-- VIEWS FOR ANALYTICS
-- ============================================
\c chat_database;

-- View: Recent conversations with message counts
CREATE OR REPLACE VIEW v_recent_conversations AS
SELECT
    c.conversation_id,
    c.customer_name,
    c.customer_contact,
    c.platform,
    c.category,
    c.status,
    c.sentiment,
    c.satisfaction_score,
    c.total_messages,
    c.first_response_time_seconds,
    c.avg_response_time_seconds,
    c.start_time,
    c.end_time,
    EXTRACT(EPOCH FROM (c.end_time - c.start_time))/60 AS duration_minutes
FROM conversations c
ORDER BY c.created_at DESC;

-- View: Message history with conversation context
CREATE OR REPLACE VIEW v_message_history AS
SELECT
    m.id,
    m.conversation_id,
    c.customer_name,
    c.platform,
    m.role,
    m.content,
    m.model_used,
    m.tokens_used,
    m.response_time_ms,
    m.timestamp
FROM messages m
JOIN conversations c ON m.conversation_id = c.conversation_id
ORDER BY m.timestamp DESC;

-- View: Daily analytics summary
CREATE OR REPLACE VIEW v_daily_analytics AS
SELECT
    ds.date,
    ds.platform,
    ds.total_conversations,
    ds.total_messages,
    ds.total_tokens_used,
    ds.positive_sentiment_count,
    ds.neutral_sentiment_count,
    ds.negative_sentiment_count,
    ROUND(
        (ds.positive_sentiment_count::NUMERIC /
        NULLIF(ds.positive_sentiment_count + ds.neutral_sentiment_count + ds.negative_sentiment_count, 0)) * 100,
        2
    ) AS positive_sentiment_percentage,
    ds.avg_satisfaction_score
FROM daily_stats ds
ORDER BY ds.date DESC;

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Insert sample conversation
INSERT INTO conversations (
    customer_id,
    customer_name,
    customer_email,
    platform,
    category,
    status,
    sentiment
) VALUES (
    'CUST_SAMPLE_001',
    'Test Kullanıcı',
    'test@example.com',
    'web',
    'ürün_bilgi',
    'completed',
    'positive'
);

-- Get the sample conversation_id
DO $$
DECLARE
    sample_conv_id UUID;
BEGIN
    SELECT conversation_id INTO sample_conv_id
    FROM conversations
    WHERE customer_id = 'CUST_SAMPLE_001'
    LIMIT 1;

    -- Insert sample messages
    INSERT INTO messages (conversation_id, role, content, model_used, tokens_used, response_time_ms)
    VALUES
        (sample_conv_id, 'user', 'Merhaba, IVIGO panel konvektör hakkında bilgi alabilir miyim?', NULL, NULL, NULL),
        (sample_conv_id, 'assistant', 'Merhaba! Tabii ki, IVIGO panel konvektör modellerimiz hakkında size yardımcı olabilirim. Hangi özelliklerle ilgileniyorsunuz?', 'gemini-2.5-flash', 150, 1200);
END $$;

-- Insert sample daily stats
INSERT INTO daily_stats (date, platform, total_conversations, total_messages, total_tokens_used, positive_sentiment_count)
VALUES (CURRENT_DATE, 'web', 1, 2, 150, 1);

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO chat_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO chat_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO chat_user;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '✅ PostgreSQL initialization completed successfully!';
    RAISE NOTICE '📊 Created tables: conversations, messages, daily_stats';
    RAISE NOTICE '👁️  Created views: v_recent_conversations, v_message_history, v_daily_analytics';
    RAISE NOTICE '🔧 Created triggers for auto-updates';
    RAISE NOTICE '🗄️  Sample data inserted for testing';
END $$;
