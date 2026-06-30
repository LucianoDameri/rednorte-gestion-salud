-- ============================================================
-- SaludRedNorte — 3 bases de datos, una por microservicio
-- ============================================================

CREATE DATABASE IF NOT EXISTS db_paciente
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS db_solicitudes
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS db_lista_espera
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

GRANT ALL PRIVILEGES ON db_paciente.*     TO 'root'@'%';
GRANT ALL PRIVILEGES ON db_solicitudes.*  TO 'root'@'%';
GRANT ALL PRIVILEGES ON db_lista_espera.* TO 'root'@'%';
FLUSH PRIVILEGES;
