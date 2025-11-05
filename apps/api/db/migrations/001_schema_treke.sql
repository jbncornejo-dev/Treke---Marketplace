CREATE TABLE "rol" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "nombre" varchar NOT NULL,
  "descripcion" text NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "updated_at" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "direcciones" (
  "descripcion" varchar NOT NULL,
  "calle_y_num" varchar NOT NULL,
  "provincia" varchar NOT NULL,
  "ciudad" varchar NOT NULL,
  "es_principal" bool NOT NULL DEFAULT false,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "updated_at" timestamptz NOT NULL DEFAULT (now()),
  "id" SERIAL PRIMARY KEY NOT NULL,
  "usuario_id" int4 NOT NULL
);

CREATE TABLE "perfil_usuario" (
  "full_name" varchar NOT NULL,
  "acerca_de" varchar,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "updated_at" timestamptz NOT NULL DEFAULT (now()),
  "id" SERIAL PRIMARY KEY NOT NULL,
  "usuario_id" int4 UNIQUE NOT NULL,
  "foto" varchar(120) DEFAULT 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'
);

CREATE TABLE "usuario" (
  "email" varchar UNIQUE NOT NULL,
  "password" varchar NOT NULL,
  "rol_id" int4 NOT NULL,
  "estado" varchar(30) NOT NULL DEFAULT 'pendiente_verificacion',
  "fecha_verif_email" timestamptz,
  "ultimo_login" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "updated_at" timestamptz NOT NULL DEFAULT (now()),
  "deleted_at" timestamptz,
  "id" SERIAL PRIMARY KEY NOT NULL
);

CREATE TABLE "tipos_movimiento" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "codigo" varchar NOT NULL,
  "descripcion" text NOT NULL,
  "es_debito" bool NOT NULL DEFAULT false
);

CREATE TABLE "movimientos" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "monto" int8 NOT NULL,
  "saldo_anterior" int8 NOT NULL,
  "saldo_posterior" int8 NOT NULL,
  "fecha_movimiento" timestamptz NOT NULL DEFAULT (now()),
  "billetera_user_id" int4 NOT NULL,
  "tipo_mov_id" int4 NOT NULL
);

CREATE TABLE "retencion_creditos" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "monto_reservado" int8 NOT NULL,
  "estado" varchar NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "updated_at" timestamptz NOT NULL DEFAULT (now()),
  "billetera_demandante" int4 NOT NULL,
  "intercambio_id" int4 UNIQUE
);

CREATE TABLE "billetera" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "saldo_disponible" int8 NOT NULL DEFAULT '0',
  "saldo_retenido" int8 NOT NULL DEFAULT '0',
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "updated_at" timestamptz NOT NULL DEFAULT (now()),
  "usuario_id" int4 UNIQUE NOT NULL
);

CREATE TABLE "paquetes_creditos" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "nombre_paq" varchar NOT NULL,
  "descripcion" text NOT NULL,
  "cant_creditos" int8 NOT NULL,
  "precio" numeric(10,2) NOT NULL,
  "esta_activo" bool NOT NULL DEFAULT true,
  "created_at" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "compras_creditos" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "id_transaccion" varchar NOT NULL,
  "estado_pago" varchar NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "updated_at" timestamptz NOT NULL DEFAULT (now()),
  "usuario_id" int4 NOT NULL,
  "paquete_id" int4 NOT NULL
);

CREATE TABLE "categoria" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "nombre" varchar NOT NULL,
  "descripcion" text NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "updated_at" timestamptz NOT NULL DEFAULT (now()),
  "categoria_padre_id" int4
);

CREATE TABLE "estado_publicacion" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "nombre" varchar NOT NULL,
  "descripcion" text NOT NULL
);

CREATE TABLE "fotos" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "foto_url" varchar NOT NULL,
  "orden" int2 NOT NULL DEFAULT '0',
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "publicacion_id" int4 NOT NULL
);

CREATE TABLE "mensajes" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "contenido" text NOT NULL,
  "fecha_envio" timestamptz NOT NULL DEFAULT (now()),
  "propuesta_id" int4 NOT NULL,
  "remitente_id" int4 NOT NULL,
  "destinatario_id" int4 NOT NULL
);

CREATE TABLE "propuesta" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "estado" varchar NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "publicacion_id" int4 NOT NULL,
  "demandante_id" int4 NOT NULL
);

CREATE TABLE "publicaciones" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "titulo" varchar NOT NULL,
  "descripcion" text NOT NULL,
  "valor_creditos" int4 NOT NULL,
  "ubicacion_texto" varchar NOT NULL,
  "peso_aprox_kg" numeric(10,2) NOT NULL DEFAULT '0',
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "updated_at" timestamptz NOT NULL DEFAULT (now()),
  "deleted_at" timestamptz,
  "usuario_id" int4 NOT NULL,
  "categoria_id" int4 NOT NULL,
  "estado_id" int4 NOT NULL
);

CREATE TABLE "intercambios" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "monto_credito" int4 NOT NULL,
  "confirm_comprador" bool NOT NULL DEFAULT false,
  "confirm_vendedor" bool NOT NULL DEFAULT false,
  "fecha_de_aceptacion" timestamptz NOT NULL DEFAULT (now()),
  "fecha_de_expiracion" timestamptz NOT NULL,
  "estado" varchar NOT NULL,
  "propuesta_aceptada_id" int4 UNIQUE NOT NULL,
  "comprador_id" int4 NOT NULL,
  "vendedor_id" int4 NOT NULL
);

CREATE TABLE "factores_ecologicos" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "nombre_factor" varchar NOT NULL,
  "unidad_medida" varchar NOT NULL,
  "desc_calc" text NOT NULL
);

CREATE TABLE "equivalencias_categoria" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "valor_por_kg" numeric(10,4) NOT NULL,
  "categoria_id" int4 NOT NULL,
  "factor_id" int4 NOT NULL
);

CREATE TABLE "impacto_usuario" (
  "usuario_id" int4 PRIMARY KEY NOT NULL,
  "total_co2_evitado" numeric(12,4) NOT NULL DEFAULT '0',
  "total_energia_ahorrada" numeric(12,4) NOT NULL DEFAULT '0',
  "total_agua_preservada" numeric(12,4) NOT NULL DEFAULT '0',
  "total_residuos_evitados" numeric(12,4) NOT NULL DEFAULT '0',
  "total_creditos_ganados" int8 NOT NULL DEFAULT '0',
  "updated_at" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "lista_favoritos" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "usuario_id" int4 NOT NULL,
  "publicacion_id" int4 NOT NULL
);

CREATE TABLE "reputacion_user" (
  "usuario_id" int4 PRIMARY KEY NOT NULL,
  "calificacion_prom" numeric(3,2) NOT NULL DEFAULT '0',
  "total_resenias" int4 NOT NULL DEFAULT 0,
  "updated_at" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "resenia" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "calificacion" int2 NOT NULL,
  "comentario" text,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "updated_at" timestamptz NOT NULL DEFAULT (now()),
  "deleted_at" timestamptz,
  "autor_id" int4 NOT NULL,
  "destinatario_id" int4 NOT NULL
);

CREATE TABLE "niveles_acelerador" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "nombre_nivel" varchar NOT NULL,
  "puntos_requeridos" int4 NOT NULL,
  "multiplicador_bono" numeric(4,2) NOT NULL,
  "descripcion" text NOT NULL
);

CREATE TABLE "progreso_usuario" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "usuario_id" int4 NOT NULL,
  "puntos_acumulados" int4 NOT NULL DEFAULT 0,
  "updated_at" timestamptz NOT NULL DEFAULT (now()),
  "nivel_id" int4 NOT NULL
);

CREATE TABLE "acciones_aceleradores" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "codigo_accion" varchar UNIQUE NOT NULL,
  "nombre_accion" varchar NOT NULL,
  "puntos_otorgados" int4 NOT NULL,
  "descripcion" text NOT NULL,
  "esta_activa" bool NOT NULL DEFAULT true
);

CREATE TABLE "historial_puntos" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "puntos_ganados" int4 NOT NULL,
  "fecha_evento" timestamptz NOT NULL DEFAULT (now()),
  "usuario_id" int4 NOT NULL,
  "accion_id" int4 NOT NULL
);

CREATE TABLE "campanias" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "nombre" varchar NOT NULL,
  "descripcion" text NOT NULL,
  "tipo" varchar NOT NULL,
  "fecha_ini" timestamptz NOT NULL,
  "fecha_fin" timestamptz NOT NULL,
  "esta_activa" bool NOT NULL DEFAULT true,
  "usuario_id" int4 NOT NULL
);

CREATE TABLE "referido" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "referido" varchar NOT NULL,
  "estado" varchar NOT NULL,
  "fecha_registro" timestamptz NOT NULL DEFAULT (now()),
  "fecha_completado" timestamptz,
  "url_referido" text NOT NULL,
  "referente_id" int4 NOT NULL
);

CREATE TABLE "planes" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "nombre" varchar NOT NULL,
  "descripcion" text NOT NULL,
  "precio" numeric(10,2) NOT NULL,
  "duracion_dias" int4 NOT NULL,
  "creditos_incluidos" int4 NOT NULL,
  "esta_activo" bool NOT NULL DEFAULT true
);

CREATE TABLE "suscripcion_user" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "fecha_ini" timestamptz NOT NULL,
  "fecha_fin" timestamptz NOT NULL,
  "estado" varchar NOT NULL,
  "usuario_id" int4 NOT NULL,
  "plan_id" int4 NOT NULL
);

CREATE TABLE "anuncios" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "titulo" varchar NOT NULL,
  "contenido" text NOT NULL,
  "imagen_url" varchar NOT NULL,
  "enlace_destino" varchar NOT NULL,
  "ubicacion" varchar NOT NULL,
  "fecha_ini" date NOT NULL,
  "fecha_fin" date NOT NULL,
  "esta_activo" bool NOT NULL DEFAULT true,
  "anunciante_id" int4 NOT NULL
);

CREATE INDEX "UQ_af9885fef30ec5063d00b2ff973" ON "lista_favoritos" USING BTREE ("usuario_id", "publicacion_id");

ALTER TABLE "anuncios" ADD CONSTRAINT "FK_e676f1409415a4f682e94a348df" FOREIGN KEY ("anunciante_id") REFERENCES "usuario" ("id");

ALTER TABLE "billetera" ADD CONSTRAINT "FK_2a148af067e28b31a4af8d52ca3" FOREIGN KEY ("usuario_id") REFERENCES "usuario" ("id");

ALTER TABLE "campanias" ADD CONSTRAINT "FK_1da5280daf10de5cff1542e3132" FOREIGN KEY ("usuario_id") REFERENCES "usuario" ("id");

ALTER TABLE "categoria" ADD CONSTRAINT "FK_a740e8690e990b3798f6632c2c4" FOREIGN KEY ("categoria_padre_id") REFERENCES "categoria" ("id");

ALTER TABLE "compras_creditos" ADD CONSTRAINT "FK_bc239a9fd98736da038448f57e4" FOREIGN KEY ("usuario_id") REFERENCES "usuario" ("id");

ALTER TABLE "compras_creditos" ADD CONSTRAINT "FK_c75225de6013b74e75f7c7e0422" FOREIGN KEY ("paquete_id") REFERENCES "paquetes_creditos" ("id");

ALTER TABLE "direcciones" ADD CONSTRAINT "FK_1a0f2a34355a3ac2879a9756746" FOREIGN KEY ("usuario_id") REFERENCES "usuario" ("id");

ALTER TABLE "equivalencias_categoria" ADD CONSTRAINT "FK_27441a78651c0a384ba78003235" FOREIGN KEY ("factor_id") REFERENCES "factores_ecologicos" ("id");

ALTER TABLE "equivalencias_categoria" ADD CONSTRAINT "FK_cd73b23ed90cc6fae8f703d3d68" FOREIGN KEY ("categoria_id") REFERENCES "categoria" ("id");

ALTER TABLE "fotos" ADD CONSTRAINT "FK_85bab211a26c7d0dcf14442e441" FOREIGN KEY ("publicacion_id") REFERENCES "publicaciones" ("id");

ALTER TABLE "historial_puntos" ADD CONSTRAINT "FK_68d84d6c33e8eda7378cdfe9b74" FOREIGN KEY ("usuario_id") REFERENCES "usuario" ("id");

ALTER TABLE "historial_puntos" ADD CONSTRAINT "FK_9b8e12b17bb55b9f27120b8dbae" FOREIGN KEY ("accion_id") REFERENCES "acciones_aceleradores" ("id");

ALTER TABLE "impacto_usuario" ADD CONSTRAINT "FK_1d15b8c0945b756b267254e8157" FOREIGN KEY ("usuario_id") REFERENCES "usuario" ("id");

ALTER TABLE "intercambios" ADD CONSTRAINT "FK_36d2dcf377a61f5df51ca61f6d2" FOREIGN KEY ("vendedor_id") REFERENCES "usuario" ("id");

ALTER TABLE "intercambios" ADD CONSTRAINT "FK_61dd1b61fd55d225401b2ac473f" FOREIGN KEY ("propuesta_aceptada_id") REFERENCES "propuesta" ("id");

ALTER TABLE "intercambios" ADD CONSTRAINT "FK_ed46009e1b5ce37fe6d3f81c10e" FOREIGN KEY ("comprador_id") REFERENCES "usuario" ("id");

ALTER TABLE "lista_favoritos" ADD CONSTRAINT "FK_8b7df355ff37d08835cb49c689c" FOREIGN KEY ("usuario_id") REFERENCES "usuario" ("id");

ALTER TABLE "lista_favoritos" ADD CONSTRAINT "FK_b736c62d2ff25f19869a05ab305" FOREIGN KEY ("publicacion_id") REFERENCES "publicaciones" ("id");

ALTER TABLE "mensajes" ADD CONSTRAINT "FK_223a3bbd0e9c0b21b0dad3f2464" FOREIGN KEY ("remitente_id") REFERENCES "usuario" ("id");

ALTER TABLE "mensajes" ADD CONSTRAINT "FK_455f8e40cfca0941f87aeccd4df" FOREIGN KEY ("propuesta_id") REFERENCES "propuesta" ("id");

ALTER TABLE "mensajes" ADD CONSTRAINT "FK_f4b9adeeef3a27064d68fc5b018" FOREIGN KEY ("destinatario_id") REFERENCES "usuario" ("id");

ALTER TABLE "movimientos" ADD CONSTRAINT "FK_96eedadf62269ae62c6931b2e69" FOREIGN KEY ("tipo_mov_id") REFERENCES "tipos_movimiento" ("id");

ALTER TABLE "movimientos" ADD CONSTRAINT "FK_b31a7925b30b43fde423d8d65c6" FOREIGN KEY ("billetera_user_id") REFERENCES "billetera" ("id");

ALTER TABLE "perfil_usuario" ADD CONSTRAINT "FK_09ea324fbab6271ccf3e7c12c71" FOREIGN KEY ("usuario_id") REFERENCES "usuario" ("id") ON DELETE CASCADE;

ALTER TABLE "progreso_usuario" ADD CONSTRAINT "FK_5b9101c34879a608f703a242330" FOREIGN KEY ("usuario_id") REFERENCES "usuario" ("id");

ALTER TABLE "progreso_usuario" ADD CONSTRAINT "FK_bf49a13f508c5cb0429d1b27aee" FOREIGN KEY ("nivel_id") REFERENCES "niveles_acelerador" ("id");

ALTER TABLE "propuesta" ADD CONSTRAINT "FK_2261c2cb61b98c36923c7eb9bf5" FOREIGN KEY ("demandante_id") REFERENCES "usuario" ("id");

ALTER TABLE "propuesta" ADD CONSTRAINT "FK_be951fd6f3842a20930740941ee" FOREIGN KEY ("publicacion_id") REFERENCES "publicaciones" ("id");

ALTER TABLE "publicaciones" ADD CONSTRAINT "FK_22aadba55615be82ff345a5a0ce" FOREIGN KEY ("categoria_id") REFERENCES "categoria" ("id");

ALTER TABLE "publicaciones" ADD CONSTRAINT "FK_60a66c3705b0ce25eff364a7482" FOREIGN KEY ("estado_id") REFERENCES "estado_publicacion" ("id");

ALTER TABLE "publicaciones" ADD CONSTRAINT "FK_e4c2fe6f7f3b403b784b5ba9fc5" FOREIGN KEY ("usuario_id") REFERENCES "usuario" ("id");

ALTER TABLE "referido" ADD CONSTRAINT "FK_786b99931cb0d625521f0e03a1f" FOREIGN KEY ("referente_id") REFERENCES "usuario" ("id");

ALTER TABLE "reputacion_user" ADD CONSTRAINT "FK_037abec8042a860f4f30fbe1ae7" FOREIGN KEY ("usuario_id") REFERENCES "usuario" ("id");

ALTER TABLE "resenia" ADD CONSTRAINT "FK_87bfa8e25f628e0b795faf20ff0" FOREIGN KEY ("destinatario_id") REFERENCES "usuario" ("id");

ALTER TABLE "resenia" ADD CONSTRAINT "FK_ef156f5f5e334d88298c77609dc" FOREIGN KEY ("autor_id") REFERENCES "usuario" ("id");

ALTER TABLE "retencion_creditos" ADD CONSTRAINT "FK_76dbbf7d82f2aeb07135261b9b6" FOREIGN KEY ("billetera_demandante") REFERENCES "billetera" ("id");

ALTER TABLE "retencion_creditos" ADD CONSTRAINT "FK_ca2a888f78a509805bcd1ab6157" FOREIGN KEY ("intercambio_id") REFERENCES "intercambios" ("id");

ALTER TABLE "suscripcion_user" ADD CONSTRAINT "FK_8868bb70f9b0c594a2ce589ae21" FOREIGN KEY ("usuario_id") REFERENCES "usuario" ("id");

ALTER TABLE "suscripcion_user" ADD CONSTRAINT "FK_8c9b9ac272836b39255b1d9fef8" FOREIGN KEY ("plan_id") REFERENCES "planes" ("id");

ALTER TABLE "usuario" ADD CONSTRAINT "FK_6c336b0a51b5c4d22614cb02533" FOREIGN KEY ("rol_id") REFERENCES "rol" ("id");
