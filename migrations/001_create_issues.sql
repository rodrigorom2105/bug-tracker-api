CREATE TYPE issue_status   AS ENUM ('open', 'in_progress', 'resolved', 'closed');
CREATE TYPE issue_priority AS ENUM ('low', 'medium', 'high');

CREATE TABLE issues (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title TEXT NOT NULL CHECK (
        char_length(title) BETWEEN 1 AND 200
    ),
    description TEXT,
    status issue_status NOT NULL DEFAULT 'open',
    priority issue_priority NOT NULL DEFAULT 'medium',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);