-- =========================
-- ROLES (Solo 3 roles como solicitado) - IDs de 5 dígitos
-- =========================
INSERT INTO rol (id, nombre, descripcion) VALUES
(10001, 'usuario', 'Usuario común que puede publicar e intercambiar productos'),
(10002, 'emprendedor', 'Emprendedor/ONG que puede monetizar bienes o servicios sostenibles'),
(10003, 'administrador', 'Administrador del sistema con permisos de validación y auditoría');

-- =========================
-- USUARIOS (Adaptados al contexto de Cochabamba) - IDs de 5 dígitos
-- =========================
INSERT INTO usuario (id, email, password, rol_id, estado, fecha_verif_email, ultimo_login) VALUES
(20001, 'maria.gonzalez@email.com', 'hashed_pass_1', 10001, 'activo', NOW(), NOW()),
(20002, 'carlos.rodriguez@email.com', 'hashed_pass_2', 10002, 'activo', NOW(), NOW()),
(20003, 'ana.martinez@email.com', 'hashed_pass_3', 10001, 'activo', NOW(), NOW()),
(20004, 'eco.emprendedores@email.com', 'hashed_pass_4', 10002, 'activo', NOW(), NOW()),
(20005, 'admin.treke@email.com', 'hashed_pass_5', 10003, 'activo', NOW(), NOW());

INSERT INTO perfil_usuario (id, usuario_id, full_name, acerca_de, foto) VALUES
(30001, 20001, 'Maria Gonzalez', 'Amante del medio ambiente y el reciclaje en Cochabamba', 'https://www.gravatar.com/avatar/maria.jpg'),
(30002, 20002, 'Carlos Rodriguez', 'Emprendedor local especializado en productos ecológicos', 'https://www.gravatar.com/avatar/carlos.jpg'),
(30003, 20003, 'Ana Martinez', 'Promotora de la economía circular en la comunidad', 'https://www.gravatar.com/avatar/ana.jpg'),
(30004, 20004, 'Eco Emprendedores CBBA', 'Colectivo de emprendedores sostenibles de Cochabamba', 'https://www.gravatar.com/avatar/ecoemprendedores.jpg'),
(30005, 20005, 'Administrador TREKE', 'Administrador de la plataforma de trueque digital', 'https://www.gravatar.com/avatar/admin.jpg');

INSERT INTO direcciones (id, descripcion, calle_y_num, provincia, ciudad, es_principal, usuario_id) VALUES
(40001, 'Casa Principal', 'Av. Blanco Galindo 123', 'Cochabamba', 'Cercado', true, 20001),
(40002, 'Taller de Producción', 'Calle Jordan 456', 'Cochabamba', 'Quillacollo', true, 20002),
(40003, 'Departamento', 'Av. América 789', 'Cochabamba', 'Cercado', true, 20003),
(40004, 'Oficina Central', 'Calle España 321', 'Cochabamba', 'Cercado', true, 20004),
(40005, 'Oficina Administrativa', 'Plaza 14 de Septiembre 654', 'Cochabamba', 'Cercado', true, 20005);

-- =========================
-- BILLETERA Y CRÉDITOS - IDs de 5 dígitos
-- =========================
INSERT INTO billetera (id, usuario_id, saldo_disponible, saldo_retenido) VALUES
(50001, 20001, 1500, 200),
(50002, 20002, 3000, 500),
(50003, 20003, 800, 0),
(50004, 20004, 5000, 1000),
(50005, 20005, 10000, 0);

INSERT INTO tipos_movimiento (id, codigo, descripcion, es_debito) VALUES
(60001, 'COMPRA_CREDITOS', 'Compra de créditos verdes', false),
(60002, 'INTERCAMBIO', 'Gasto en intercambio de productos', true),
(60003, 'BONO_PUBLICACION', 'Bono por publicar producto', false),
(60004, 'RETENCION', 'Retención por intercambio pendiente', true),
(60005, 'RECOMPENSA', 'Recompensa por actividad sostenible', false);

INSERT INTO paquetes_creditos (id, nombre_paq, descripcion, cant_creditos, precio, esta_activo) VALUES
(70001, 'Paquete Básico', '100 créditos para empezar en el trueque', 100, 20.00, true),
(70002, 'Paquete Popular', '500 créditos para usuarios activos', 500, 90.00, true),
(70003, 'Paquete Emprendedor', '1000 créditos para emprendedores', 1000, 170.00, true),
(70004, 'Paquete Premium', '5000 créditos para grandes intercambios', 5000, 800.00, true);

INSERT INTO compras_creditos (id, usuario_id, paquete_id, id_transaccion, estado_pago) VALUES
(80001, 20001, 70002, 'TXN-CBB-001', 'completado'),
(80002, 20002, 70003, 'TXN-CBB-002', 'completado'),
(80003, 20004, 70004, 'TXN-CBB-003', 'completado');

-- =========================
-- CATEGORÍAS Y FACTORES ECOLÓGICOS - IDs de 5 dígitos
-- =========================
INSERT INTO categoria (id, nombre, descripcion, categoria_padre_id) VALUES
(90001, 'Electrónicos', 'Dispositivos electrónicos y eléctricos en desuso', NULL),
(90002, 'Ropa y Accesorios', 'Prendas de vestir y complementos', NULL),
(90003, 'Hogar y Jardín', 'Muebles, decoración y artículos para el hogar', NULL),
(90004, 'Libros y Educación', 'Material educativo y libros de todo tipo', NULL),
(90005, 'Deportes y Recreación', 'Artículos deportivos y de entretenimiento', NULL),
(90006, 'Artesanías Locales', 'Productos artesanales de Cochabamba', NULL),
(90007, 'Servicios Sostenibles', 'Servicios ecológicos y comunitarios', NULL);

INSERT INTO estado_publicacion (id, nombre, descripcion) VALUES
(100001, 'disponible', 'Publicación disponible para intercambios'),
(100002, 'reservado', 'Publicación reservada para un intercambio'),
(100003, 'intercambiado', 'Publicación ya fue intercambiada'),
(100004, 'inactivo', 'Publicación inactiva temporalmente');

INSERT INTO factores_ecologicos (id, nombre_factor, unidad_medida, desc_calc) VALUES
(110001, 'CO2 evitado', 'kg', 'Calcula el CO2 evitado al reutilizar productos en lugar de producir nuevos'),
(110002, 'Energía ahorrada', 'kWh', 'Energía conservada al extender la vida útil de productos'),
(110003, 'Agua preservada', 'litros', 'Agua preservada al evitar producción de nuevos items'),
(110004, 'Residuos evitados', 'kg', 'Residuos sólidos evitados al reutilizar productos');

INSERT INTO equivalencias_categoria (id, categoria_id, factor_id, valor_por_kg) VALUES
(120001, 90001, 110001, 2.5), (120002, 90001, 110002, 15.0), 
(120003, 90001, 110003, 500.0), (120004, 90001, 110004, 1.8),
(120005, 90002, 110001, 1.2), (120006, 90002, 110002, 8.5), 
(120007, 90002, 110003, 2500.0), (120008, 90002, 110004, 0.9);

-- =========================
-- PUBLICACIONES - IDs de 5 dígitos
-- =========================
INSERT INTO publicaciones (id, titulo, descripcion, valor_creditos, ubicacion_texto, peso_aprox_kg, usuario_id, categoria_id, estado_id) VALUES
(130001, 'iPhone X en buen estado', 'iPhone X 64GB funcionando perfectamente, incluye cargador original. Intercambio por créditos verdes.', 500, 'Cercado, Cochabamba', 0.2, 20001, 90001, 100001),
(130002, 'Libros de programación usados', 'Colección de libros de Java, Python y desarrollo web. Ideal para estudiantes.', 150, 'Quillacollo, Cochabamba', 3.5, 20002, 90004, 100001),
(130003, 'Bicicleta mountain bike usada', 'Bicicleta montañera marca Trek, usada pero en buen estado. Perfecta para movilidad sostenible.', 800, 'Cercado, Cochabamba', 12.0, 20003, 90005, 100001),
(130004, 'Artesanías en cuero natural', 'Productos artesanales en cuero natural: billeteras, monederos y más. Hecho por emprendedores locales.', 300, 'Cercado, Cochabamba', 2.0, 20004, 90006, 100001),
(130005, 'Servicio de jardinería ecológica', 'Servicio de jardinería usando técnicas sostenibles y compostaje. 4 horas de servicio.', 200, 'Cochabamba', 0, 20002, 90007, 100001);

INSERT INTO fotos (id, publicacion_id, foto_url, orden) VALUES
(140001, 130001, 'https://ejemplo.com/fotos/iphone-x-1.jpg', 1),
(140002, 130001, 'https://ejemplo.com/fotos/iphone-x-2.jpg', 2),
(140003, 130002, 'https://ejemplo.com/fotos/libros-programacion.jpg', 1),
(140004, 130003, 'https://ejemplo.com/fotos/bicicleta-trek.jpg', 1),
(140005, 130004, 'https://ejemplo.com/fotos/artesanias-cuero-1.jpg', 1);

-- =========================
-- SISTEMA DE PUNTOS Y ACELERADORES - IDs de 5 dígitos
-- =========================
INSERT INTO acciones_aceleradores (id, codigo_accion, nombre_accion, puntos_otorgados, descripcion) VALUES
(150001, 'REGISTRO', 'Registro en la plataforma', 100, 'Puntos por registrarse en TREKE'),
(150002, 'PUBLICACION', 'Publicar producto/servicio', 50, 'Puntos por cada publicación activa'),
(150003, 'INTERCAMBIO_EXITOSO', 'Intercambio completado', 200, 'Puntos por intercambio exitoso'),
(150004, 'REFERIDO_ACTIVO', 'Referir usuario activo', 300, 'Puntos por referir usuario que completa registro'),
(150005, 'LOGIN_CONSECUTIVO', 'Login consecutivo', 10, 'Puntos por días consecutivos en la plataforma');

INSERT INTO niveles_acelerador (id, nombre_nivel, puntos_requeridos, multiplicador_bono, descripcion) VALUES
(160001, 'Semilla', 0, 1.0, 'Nivel inicial - comienza tu journey sostenible'),
(160002, 'Brote', 1000, 1.1, 'Nivel brote - 10% de bono en créditos'),
(160003, 'Árbol Joven', 5000, 1.2, 'Nivel árbol joven - 20% de bono en créditos'),
(160004, 'Bosque', 15000, 1.3, 'Nivel bosque - 30% de bono en créditos'),
(160005, 'Guardabosques', 30000, 1.5, 'Nivel guardabosques - 50% de bono en créditos');

INSERT INTO progreso_usuario (id, usuario_id, nivel_id, puntos_acumulados) VALUES
(170001, 20001, 160002, 1250),
(170002, 20002, 160003, 5200),
(170003, 20003, 160001, 350),
(170004, 20004, 160002, 2100),
(170005, 20005, 160004, 16000);

INSERT INTO historial_puntos (id, usuario_id, accion_id, puntos_ganados) VALUES
(180001, 20001, 150001, 100), (180002, 20001, 150002, 50), (180003, 20001, 150003, 200),
(180004, 20002, 150001, 100), (180005, 20002, 150002, 100), (180006, 20002, 150003, 400),
(180007, 20003, 150001, 100), (180008, 20003, 150002, 50);

-- =========================
-- INTERCAMBIOS Y PROPUESTAS - IDs de 5 dígitos
-- =========================
INSERT INTO propuesta (id, publicacion_id, demandante_id, estado) VALUES
(190001, 130002, 20001, 'aceptada'),    -- Maria quiere los libros de Carlos
(190002, 130003, 20002, 'pendiente'),   -- Carlos quiere la bicicleta de Ana
(190003, 130004, 20003, 'pendiente'),   -- Ana quiere las artesanías
(190004, 130001, 20004, 'aceptada');    -- Eco Emprendedores quiere el iPhone

INSERT INTO intercambios (id, monto_credito, confirm_comprador, confirm_vendedor, fecha_de_expiracion, estado, propuesta_aceptada_id, comprador_id, vendedor_id) VALUES
(200001, 150, true, true, NOW() + INTERVAL '7 days', 'completado', 190001, 20001, 20002),
(200002, 500, true, false, NOW() + INTERVAL '7 days', 'en_proceso', 190004, 20004, 20001);

INSERT INTO mensajes (id, propuesta_id, remitente_id, destinatario_id, contenido) VALUES
(210001, 190001, 20001, 20002, 'Hola Carlos, me interesan tus libros de programación. ¿Están completos?'),
(210002, 190001, 20002, 20001, '¡Hola María! Sí, están completos y en buen estado. ¿Te interesa el intercambio?'),
(210003, 190002, 20002, 20003, 'Hola Ana, la bicicleta incluye algún accesorio adicional?'),
(210004, 190003, 20003, 20004, 'Buen día, me encantan sus artesanías. ¿Hacen productos por encargo?');

-- =========================
-- RETENCIONES Y MOVIMIENTOS - IDs de 5 dígitos
-- =========================
INSERT INTO retencion_creditos (id, monto_reservado, estado, billetera_demandante, intercambio_id) VALUES
(220001, 150, 'liberado', 50001, 200001),
(220002, 500, 'retenido', 50004, 200002);

INSERT INTO movimientos (id, monto, saldo_anterior, saldo_posterior, billetera_user_id, tipo_mov_id) VALUES
(230001, 500, 1000, 1500, 50001, 60001),    -- Maria compra créditos
(230002, 150, 1500, 1350, 50001, 60002),    -- Maria gasta en intercambio
(230003, 1000, 2000, 3000, 50002, 60001),   -- Carlos compra créditos
(230004, 200, 4300, 4500, 50004, 60005);    -- Eco Emprendedores recibe bono

-- =========================
-- REPUTACIÓN Y RESEÑAS - IDs de 5 dígitos
-- =========================
INSERT INTO reputacion_user (usuario_id, calificacion_prom, total_resenias) VALUES
(20001, 4.8, 3),
(20002, 4.9, 5),
(20003, 4.5, 2),
(20004, 5.0, 8);

INSERT INTO resenia (id, calificacion, comentario, autor_id, destinatario_id) VALUES
(240001, 5, 'Excelente intercambio, los libros llegaron en perfecto estado. ¡Muy recomendable!', 20001, 20002),
(240002, 5, 'Maria es una usuaria muy confiable, el intercambio fue rápido y seguro.', 20002, 20001),
(240003, 4, 'Buen producto, aunque el envío tardó un poco más de lo esperado.', 20003, 20004),
(240004, 5, 'Servicio excepcional, productos de alta calidad y muy amables.', 20002, 20004);

-- =========================
-- IMPACTO AMBIENTAL - IDs de 5 dígitos
-- =========================
INSERT INTO impacto_usuario (usuario_id, total_co2_evitado, total_energia_ahorrada, total_agua_preservada, total_residuos_evitados, total_creditos_ganados) VALUES
(20001, 25.5, 150.0, 5000.0, 18.3, 2500),
(20002, 48.2, 289.0, 12000.0, 34.7, 5200),
(20003, 12.8, 85.5, 3500.0, 9.6, 1200),
(20004, 85.7, 514.2, 25000.0, 61.7, 8500);

-- =========================
-- FAVORITOS - IDs de 5 dígitos
-- =========================
INSERT INTO lista_favoritos (id, usuario_id, publicacion_id) VALUES
(250001, 20001, 130003), (250002, 20001, 130004),    -- Maria guarda bicicleta y artesanías
(250003, 20002, 130001), (250004, 20002, 130005),    -- Carlos guarda iPhone y servicio jardinería
(250005, 20003, 130004);            -- Ana guarda artesanías

-- =========================
-- REFERIDOS - IDs de 5 dígitos
-- =========================
INSERT INTO referido (id, referente_id, referido, estado, url_referido) VALUES
(260001, 20001, 'amigo.maria@email.com', 'completado', 'https://treke.com/ref/user20001'),
(260002, 20002, 'cliente.carlos@email.com', 'pendiente', 'https://treke.com/ref/user20002'),
(260003, 20004, 'colaborador.eco@email.com', 'completado', 'https://treke.com/ref/user20004');

-- =========================
-- PLANES Y SUSCRIPCIONES - IDs de 5 dígitos
-- =========================
INSERT INTO planes (id, nombre, descripcion, precio, duracion_dias, creditos_incluidos) VALUES
(270001, 'Plan Básico', 'Plan gratuito para nuevos usuarios', 0.00, 30, 100),
(270002, 'Plan Emprendedor', 'Plan para emprendedores con beneficios especiales', 29.99, 30, 1000),
(270003, 'Plan Premium', 'Plan con todos los beneficios y créditos incluidos', 49.99, 30, 2000);

INSERT INTO suscripcion_user (id, usuario_id, plan_id, fecha_ini, fecha_fin, estado) VALUES
(280001, 20002, 270002, NOW(), NOW() + INTERVAL '30 days', 'activa'),
(280002, 20004, 270002, NOW(), NOW() + INTERVAL '30 days', 'activa'),
(280003, 20001, 270001, NOW(), NOW() + INTERVAL '30 days', 'activa');

-- =========================
-- CAMPAÑAS Y ANUNCIOS - IDs de 5 dígitos
-- =========================
INSERT INTO campanias (id, nombre, descripcion, tipo, fecha_ini, fecha_fin, esta_activa, usuario_id) VALUES
(290001, 'Trueque Sostenible CBBA', 'Campaña de promoción del trueque en Cochabamba', 'local', NOW(), NOW() + INTERVAL '90 days', true, 20005),
(290002, 'Emprendedores Verdes', 'Apoyo a emprendedores sostenibles locales', 'emprendedores', NOW(), NOW() + INTERVAL '60 days', true, 20005);

INSERT INTO anuncios (id, titulo, contenido, imagen_url, enlace_destino, ubicacion, fecha_ini, fecha_fin, esta_activo, anunciante_id) VALUES
(300001, '¡Bienvenidos a TREKE!', 'Descubre el trueque sostenible en Cochabamba', 'https://ejemplo.com/banner-bienvenida.jpg', '/registro', 'header', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', true, 20005),
(300002, 'Oferta Especial Emprendedores', '50% de descuento en el plan emprendedor este mes', 'https://ejemplo.com/banner-emprendedores.jpg', '/planes', 'sidebar', CURRENT_DATE, CURRENT_DATE + INTERVAL '15 days', true, 20005);