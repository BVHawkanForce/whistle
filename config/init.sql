-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the reports table
CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    reporter_code TEXT NOT NULL UNIQUE,
    handler_code TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'new',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create a trigger to automatically update the updated_at field for reports
CREATE TRIGGER set_timestamp_reports
BEFORE UPDATE ON reports
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Create the messages table
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    report_id INTEGER NOT NULL REFERENCES reports(id),
    sender VARCHAR(20) NOT NULL, -- 'reporter' or 'handler'
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create an index on report_id for faster message retrieval
CREATE INDEX idx_messages_report_id ON messages(report_id);
