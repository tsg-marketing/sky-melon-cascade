CREATE TABLE IF NOT EXISTS t_p69811181_sky_melon_cascade.icemakers_cache (
    id INTEGER PRIMARY KEY DEFAULT 1,
    data JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT single_row CHECK (id = 1)
);