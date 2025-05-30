-- Add order_details table
CREATE TABLE IF NOT EXISTS public.order_details
(
    id serial NOT NULL,
    order_id integer NOT NULL,
    produit_id integer NOT NULL,
    nom_produit character varying(100) COLLATE pg_catalog."default" NOT NULL,
    quantity integer NOT NULL,
    unit_price numeric(10, 2) NOT NULL,
    total_price numeric(10, 2) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT order_details_pkey PRIMARY KEY (id),
    CONSTRAINT order_details_order_id_fkey FOREIGN KEY (order_id)
        REFERENCES public.commande (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT order_details_produit_id_fkey FOREIGN KEY (produit_id)
        REFERENCES public.produit (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_order_details_order_id
    ON public.order_details(order_id);
