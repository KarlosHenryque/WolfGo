--
-- PostgreSQL database dump
--

\restrict 1e853St5DenIWVDP7HYZm3n3RJRbTEypweUKvcBmhKWdSzNYslvQ3wbzpFsXfWI

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

-- Started on 2025-10-02 21:12:44

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
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
-- TOC entry 236 (class 1259 OID 16659)
-- Name: calendario_evento; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.calendario_evento (
    id integer NOT NULL,
    id_usuario integer NOT NULL,
    titulo character varying(255) NOT NULL,
    descricao text,
    horario time without time zone NOT NULL,
    data_criacao timestamp without time zone DEFAULT now() NOT NULL,
    data_evento timestamp without time zone,
    status boolean DEFAULT true
);


ALTER TABLE public.calendario_evento OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 16658)
-- Name: calendario_evento_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.calendario_evento_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.calendario_evento_id_seq OWNER TO postgres;

--
-- TOC entry 4998 (class 0 OID 0)
-- Dependencies: 235
-- Name: calendario_evento_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.calendario_evento_id_seq OWNED BY public.calendario_evento.id;


--
-- TOC entry 234 (class 1259 OID 16560)
-- Name: dieta_alimento; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dieta_alimento (
    id integer NOT NULL,
    id_refeicao integer NOT NULL,
    alimentos text NOT NULL,
    quantidade text
);


ALTER TABLE public.dieta_alimento OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 16527)
-- Name: dieta_dia; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dieta_dia (
    id integer NOT NULL,
    dia character varying(20) NOT NULL,
    id_formulario_dieta integer NOT NULL
);


ALTER TABLE public.dieta_dia OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16526)
-- Name: dieta_dia_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.dieta_dia_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.dieta_dia_id_seq OWNER TO postgres;

--
-- TOC entry 4999 (class 0 OID 0)
-- Dependencies: 229
-- Name: dieta_dia_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.dieta_dia_id_seq OWNED BY public.dieta_dia.id;


--
-- TOC entry 233 (class 1259 OID 16559)
-- Name: dieta_item_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.dieta_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.dieta_item_id_seq OWNER TO postgres;

--
-- TOC entry 5000 (class 0 OID 0)
-- Dependencies: 233
-- Name: dieta_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.dieta_item_id_seq OWNED BY public.dieta_alimento.id;


--
-- TOC entry 232 (class 1259 OID 16548)
-- Name: dieta_refeicao; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dieta_refeicao (
    id integer NOT NULL,
    id_dia integer NOT NULL,
    refeicao character varying(50) NOT NULL
);


ALTER TABLE public.dieta_refeicao OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 16547)
-- Name: dieta_refeicao_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.dieta_refeicao_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.dieta_refeicao_id_seq OWNER TO postgres;

--
-- TOC entry 5001 (class 0 OID 0)
-- Dependencies: 231
-- Name: dieta_refeicao_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.dieta_refeicao_id_seq OWNED BY public.dieta_refeicao.id;


--
-- TOC entry 224 (class 1259 OID 16438)
-- Name: exercicio; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.exercicio (
    id integer NOT NULL,
    id_treino integer NOT NULL,
    nome character varying(100) NOT NULL,
    series integer NOT NULL,
    repeticoes character varying(50) NOT NULL
);


ALTER TABLE public.exercicio OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16437)
-- Name: exercicio_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.exercicio_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.exercicio_id_seq OWNER TO postgres;

--
-- TOC entry 5002 (class 0 OID 0)
-- Dependencies: 223
-- Name: exercicio_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.exercicio_id_seq OWNED BY public.exercicio.id;


--
-- TOC entry 228 (class 1259 OID 16493)
-- Name: formulario_dieta; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.formulario_dieta (
    id integer NOT NULL,
    id_formulario_treino integer NOT NULL,
    nivel_atividade character varying(50) NOT NULL,
    preferencias_alimentares character varying(50) NOT NULL,
    alergia text,
    utiliza_suplemento character varying(10) NOT NULL,
    uso_medicacao character varying(10) NOT NULL,
    objetivo character varying(50) NOT NULL,
    frequencia_atividade character varying(20),
    qualidade_sono character varying(10) NOT NULL,
    data_criacao timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    id_usuario integer,
    nome_dieta character varying(255),
    status boolean DEFAULT true
);


ALTER TABLE public.formulario_dieta OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 16398)
-- Name: formulario_treino; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.formulario_treino (
    id integer NOT NULL,
    nome_treino character varying(255) NOT NULL,
    data_nascimento date NOT NULL,
    objetivo character varying(255) NOT NULL,
    experiencia character varying(255) NOT NULL,
    dias_treino integer NOT NULL,
    duracao integer NOT NULL,
    alguma_lesao text,
    altura numeric(5,2),
    peso numeric(5,2),
    id_usuario integer,
    data_criacao timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    sexo character varying(10),
    status boolean DEFAULT true NOT NULL
);


ALTER TABLE public.formulario_treino OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16397)
-- Name: formulario_usuario_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.formulario_usuario_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.formulario_usuario_id_seq OWNER TO postgres;

--
-- TOC entry 5003 (class 0 OID 0)
-- Dependencies: 219
-- Name: formulario_usuario_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.formulario_usuario_id_seq OWNED BY public.formulario_treino.id;


--
-- TOC entry 227 (class 1259 OID 16492)
-- Name: nutricao_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.nutricao_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.nutricao_id_seq OWNER TO postgres;

--
-- TOC entry 5004 (class 0 OID 0)
-- Dependencies: 227
-- Name: nutricao_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.nutricao_id_seq OWNED BY public.formulario_dieta.id;


--
-- TOC entry 226 (class 1259 OID 16469)
-- Name: percurso; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.percurso (
    id integer NOT NULL,
    data_criacao timestamp without time zone DEFAULT now() NOT NULL,
    rota jsonb NOT NULL,
    distancia_km numeric(8,2) NOT NULL,
    id_usuario integer NOT NULL,
    status boolean DEFAULT true
);


ALTER TABLE public.percurso OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16468)
-- Name: rotas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.rotas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.rotas_id_seq OWNER TO postgres;

--
-- TOC entry 5005 (class 0 OID 0)
-- Dependencies: 225
-- Name: rotas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.rotas_id_seq OWNED BY public.percurso.id;


--
-- TOC entry 238 (class 1259 OID 16683)
-- Name: tokens_recuperacao; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tokens_recuperacao (
    id integer NOT NULL,
    usuario_id integer,
    token character varying(255) NOT NULL,
    expira_em timestamp without time zone NOT NULL
);


ALTER TABLE public.tokens_recuperacao OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 16682)
-- Name: tokens_recuperacao_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tokens_recuperacao_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tokens_recuperacao_id_seq OWNER TO postgres;

--
-- TOC entry 5006 (class 0 OID 0)
-- Dependencies: 237
-- Name: tokens_recuperacao_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tokens_recuperacao_id_seq OWNED BY public.tokens_recuperacao.id;


--
-- TOC entry 222 (class 1259 OID 16426)
-- Name: treino; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.treino (
    id integer NOT NULL,
    id_formulario integer NOT NULL,
    dia character varying(50) NOT NULL,
    grupo_muscular character varying(100) NOT NULL
);


ALTER TABLE public.treino OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16425)
-- Name: treino_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.treino_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.treino_id_seq OWNER TO postgres;

--
-- TOC entry 5007 (class 0 OID 0)
-- Dependencies: 221
-- Name: treino_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.treino_id_seq OWNED BY public.treino.id;


--
-- TOC entry 218 (class 1259 OID 16389)
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    nome character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    senha character varying(200) NOT NULL,
    foto bytea
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 16388)
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuarios_id_seq OWNER TO postgres;

--
-- TOC entry 5008 (class 0 OID 0)
-- Dependencies: 217
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- TOC entry 4807 (class 2604 OID 16662)
-- Name: calendario_evento id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calendario_evento ALTER COLUMN id SET DEFAULT nextval('public.calendario_evento_id_seq'::regclass);


--
-- TOC entry 4806 (class 2604 OID 16563)
-- Name: dieta_alimento id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dieta_alimento ALTER COLUMN id SET DEFAULT nextval('public.dieta_item_id_seq'::regclass);


--
-- TOC entry 4804 (class 2604 OID 16530)
-- Name: dieta_dia id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dieta_dia ALTER COLUMN id SET DEFAULT nextval('public.dieta_dia_id_seq'::regclass);


--
-- TOC entry 4805 (class 2604 OID 16551)
-- Name: dieta_refeicao id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dieta_refeicao ALTER COLUMN id SET DEFAULT nextval('public.dieta_refeicao_id_seq'::regclass);


--
-- TOC entry 4797 (class 2604 OID 16441)
-- Name: exercicio id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercicio ALTER COLUMN id SET DEFAULT nextval('public.exercicio_id_seq'::regclass);


--
-- TOC entry 4801 (class 2604 OID 16496)
-- Name: formulario_dieta id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.formulario_dieta ALTER COLUMN id SET DEFAULT nextval('public.nutricao_id_seq'::regclass);


--
-- TOC entry 4793 (class 2604 OID 16401)
-- Name: formulario_treino id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.formulario_treino ALTER COLUMN id SET DEFAULT nextval('public.formulario_usuario_id_seq'::regclass);


--
-- TOC entry 4798 (class 2604 OID 16472)
-- Name: percurso id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.percurso ALTER COLUMN id SET DEFAULT nextval('public.rotas_id_seq'::regclass);


--
-- TOC entry 4810 (class 2604 OID 16686)
-- Name: tokens_recuperacao id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tokens_recuperacao ALTER COLUMN id SET DEFAULT nextval('public.tokens_recuperacao_id_seq'::regclass);


--
-- TOC entry 4796 (class 2604 OID 16429)
-- Name: treino id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.treino ALTER COLUMN id SET DEFAULT nextval('public.treino_id_seq'::regclass);


--
-- TOC entry 4792 (class 2604 OID 16392)
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- TOC entry 4834 (class 2606 OID 16667)
-- Name: calendario_evento calendario_evento_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calendario_evento
    ADD CONSTRAINT calendario_evento_pkey PRIMARY KEY (id);


--
-- TOC entry 4828 (class 2606 OID 16532)
-- Name: dieta_dia dieta_dia_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dieta_dia
    ADD CONSTRAINT dieta_dia_pkey PRIMARY KEY (id);


--
-- TOC entry 4832 (class 2606 OID 16567)
-- Name: dieta_alimento dieta_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dieta_alimento
    ADD CONSTRAINT dieta_item_pkey PRIMARY KEY (id);


--
-- TOC entry 4830 (class 2606 OID 16553)
-- Name: dieta_refeicao dieta_refeicao_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dieta_refeicao
    ADD CONSTRAINT dieta_refeicao_pkey PRIMARY KEY (id);


--
-- TOC entry 4812 (class 2606 OID 16467)
-- Name: usuarios email_unico; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT email_unico UNIQUE (email);


--
-- TOC entry 4822 (class 2606 OID 16443)
-- Name: exercicio exercicio_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercicio
    ADD CONSTRAINT exercicio_pkey PRIMARY KEY (id);


--
-- TOC entry 4818 (class 2606 OID 16405)
-- Name: formulario_treino formulario_usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.formulario_treino
    ADD CONSTRAINT formulario_usuario_pkey PRIMARY KEY (id);


--
-- TOC entry 4826 (class 2606 OID 16501)
-- Name: formulario_dieta nutricao_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.formulario_dieta
    ADD CONSTRAINT nutricao_pkey PRIMARY KEY (id);


--
-- TOC entry 4824 (class 2606 OID 16477)
-- Name: percurso rotas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.percurso
    ADD CONSTRAINT rotas_pkey PRIMARY KEY (id);


--
-- TOC entry 4836 (class 2606 OID 16688)
-- Name: tokens_recuperacao tokens_recuperacao_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tokens_recuperacao
    ADD CONSTRAINT tokens_recuperacao_pkey PRIMARY KEY (id);


--
-- TOC entry 4820 (class 2606 OID 16431)
-- Name: treino treino_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.treino
    ADD CONSTRAINT treino_pkey PRIMARY KEY (id);


--
-- TOC entry 4814 (class 2606 OID 16396)
-- Name: usuarios usuarios_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_email_key UNIQUE (email);


--
-- TOC entry 4816 (class 2606 OID 16394)
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- TOC entry 4846 (class 2606 OID 16568)
-- Name: dieta_alimento dieta_item_id_refeicao_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dieta_alimento
    ADD CONSTRAINT dieta_item_id_refeicao_fkey FOREIGN KEY (id_refeicao) REFERENCES public.dieta_refeicao(id) ON DELETE CASCADE;


--
-- TOC entry 4845 (class 2606 OID 16554)
-- Name: dieta_refeicao dieta_refeicao_id_dia_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dieta_refeicao
    ADD CONSTRAINT dieta_refeicao_id_dia_fkey FOREIGN KEY (id_dia) REFERENCES public.dieta_dia(id) ON DELETE CASCADE;


--
-- TOC entry 4844 (class 2606 OID 16621)
-- Name: dieta_dia fk_fomulario_dieta; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dieta_dia
    ADD CONSTRAINT fk_fomulario_dieta FOREIGN KEY (id_formulario_dieta) REFERENCES public.formulario_dieta(id) ON DELETE CASCADE;


--
-- TOC entry 4838 (class 2606 OID 16432)
-- Name: treino fk_formulario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.treino
    ADD CONSTRAINT fk_formulario FOREIGN KEY (id_formulario) REFERENCES public.formulario_treino(id) ON DELETE CASCADE;


--
-- TOC entry 4841 (class 2606 OID 16612)
-- Name: formulario_dieta fk_formulario_dieta_usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.formulario_dieta
    ADD CONSTRAINT fk_formulario_dieta_usuario FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id);


--
-- TOC entry 4842 (class 2606 OID 16502)
-- Name: formulario_dieta fk_nutricao_formulario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.formulario_dieta
    ADD CONSTRAINT fk_nutricao_formulario FOREIGN KEY (id_formulario_treino) REFERENCES public.formulario_treino(id) ON DELETE CASCADE;


--
-- TOC entry 4839 (class 2606 OID 16444)
-- Name: exercicio fk_treino; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercicio
    ADD CONSTRAINT fk_treino FOREIGN KEY (id_treino) REFERENCES public.treino(id) ON DELETE CASCADE;


--
-- TOC entry 4843 (class 2606 OID 16606)
-- Name: formulario_dieta fk_usuarios; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.formulario_dieta
    ADD CONSTRAINT fk_usuarios FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id);


--
-- TOC entry 4837 (class 2606 OID 16406)
-- Name: formulario_treino formulario_usuario_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.formulario_treino
    ADD CONSTRAINT formulario_usuario_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- TOC entry 4840 (class 2606 OID 16478)
-- Name: percurso rotas_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.percurso
    ADD CONSTRAINT rotas_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- TOC entry 4847 (class 2606 OID 16689)
-- Name: tokens_recuperacao tokens_recuperacao_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tokens_recuperacao
    ADD CONSTRAINT tokens_recuperacao_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id);


-- Completed on 2025-10-02 21:12:44

--
-- PostgreSQL database dump complete
--

\unrestrict 1e853St5DenIWVDP7HYZm3n3RJRbTEypweUKvcBmhKWdSzNYslvQ3wbzpFsXfWI

