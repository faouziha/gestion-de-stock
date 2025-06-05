-- Create client solde (balance) table
CREATE TABLE IF NOT EXISTS public.client_solde
(
    id serial NOT NULL,
    client_id integer NOT NULL,
    total_solde numeric(10, 2) NOT NULL DEFAULT 0,
    last_updated timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    userid integer NOT NULL,
    CONSTRAINT client_solde_pkey PRIMARY KEY (id),
    CONSTRAINT client_solde_client_id_key UNIQUE (client_id),
    CONSTRAINT client_solde_client_id_fkey FOREIGN KEY (client_id)
        REFERENCES public.clients (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);

-- Create client solde details (deposit history) table
CREATE TABLE IF NOT EXISTS public.client_solde_details
(
    id serial NOT NULL,
    client_id integer NOT NULL,
    amount numeric(10, 2) NOT NULL,
    operation_type varchar(20) NOT NULL, -- 'deposit', 'withdrawal', 'payment', 'refund'
    reference varchar(100),
    notes text,
    transaction_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    userid integer NOT NULL,
    CONSTRAINT client_solde_details_pkey PRIMARY KEY (id),
    CONSTRAINT client_solde_details_client_id_fkey FOREIGN KEY (client_id)
        REFERENCES public.clients (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_client_solde_client_id ON public.client_solde(client_id);
CREATE INDEX IF NOT EXISTS idx_client_solde_details_client_id ON public.client_solde_details(client_id);
CREATE INDEX IF NOT EXISTS idx_client_solde_details_transaction_date ON public.client_solde_details(transaction_date);
