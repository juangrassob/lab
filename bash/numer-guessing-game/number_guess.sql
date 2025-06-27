--
-- PostgreSQL database dump
--

-- Dumped from database version 12.17 (Ubuntu 12.17-1.pgdg22.04+1)
-- Dumped by pg_dump version 12.17 (Ubuntu 12.17-1.pgdg22.04+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP DATABASE number_guess;
--
-- Name: number_guess; Type: DATABASE; Schema: -; Owner: freecodecamp
--

CREATE DATABASE number_guess WITH TEMPLATE = template0 ENCODING = 'UTF8' LC_COLLATE = 'C.UTF-8' LC_CTYPE = 'C.UTF-8';


ALTER DATABASE number_guess OWNER TO freecodecamp;

\connect number_guess

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: users; Type: TABLE; Schema: public; Owner: freecodecamp
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    username character varying(22),
    number_of_games integer DEFAULT 0,
    best_game integer DEFAULT 1000
);


ALTER TABLE public.users OWNER TO freecodecamp;

--
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: freecodecamp
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_user_id_seq OWNER TO freecodecamp;

--
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: freecodecamp
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: freecodecamp
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: freecodecamp
--

INSERT INTO public.users VALUES (72, 'user_1751055295171', 2, 16);
INSERT INTO public.users VALUES (71, 'user_1751055295172', 5, 99);
INSERT INTO public.users VALUES (74, 'user_1751055399395', 2, 582);
INSERT INTO public.users VALUES (73, 'user_1751055399396', 5, 35);
INSERT INTO public.users VALUES (76, 'user_1751055691712', 2, 290);
INSERT INTO public.users VALUES (75, 'user_1751055691713', 5, 35);
INSERT INTO public.users VALUES (78, 'user_1751055695553', 2, 645);
INSERT INTO public.users VALUES (77, 'user_1751055695554', 5, 98);
INSERT INTO public.users VALUES (80, 'user_1751055752569', 2, 12);
INSERT INTO public.users VALUES (79, 'user_1751055752570', 5, 26);
INSERT INTO public.users VALUES (82, 'user_1751055772279', 2, 213);
INSERT INTO public.users VALUES (81, 'user_1751055772280', 5, 337);
INSERT INTO public.users VALUES (84, 'user_1751055823480', 2, 615);
INSERT INTO public.users VALUES (83, 'user_1751055823481', 4, 5);
INSERT INTO public.users VALUES (86, 'user_1751055839083', 2, 418);
INSERT INTO public.users VALUES (85, 'user_1751055839084', 5, 372);
INSERT INTO public.users VALUES (88, 'user_1751055843281', 2, 77);
INSERT INTO public.users VALUES (87, 'user_1751055843282', 5, 77);
INSERT INTO public.users VALUES (90, 'user_1751055916763', 2, 289);
INSERT INTO public.users VALUES (89, 'user_1751055916764', 5, 186);
INSERT INTO public.users VALUES (92, 'user_1751056058112', 2, 110);
INSERT INTO public.users VALUES (91, 'user_1751056058113', 5, 280);
INSERT INTO public.users VALUES (70, 'Juan', 3, 7);
INSERT INTO public.users VALUES (94, 'user_1751056145256', 2, 365);
INSERT INTO public.users VALUES (93, 'user_1751056145257', 5, 237);
INSERT INTO public.users VALUES (96, 'user_1751056219231', 2, 489);
INSERT INTO public.users VALUES (95, 'user_1751056219232', 5, 76);


--
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: freecodecamp
--

SELECT pg_catalog.setval('public.users_user_id_seq', 96, true);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: freecodecamp
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- PostgreSQL database dump complete
--


