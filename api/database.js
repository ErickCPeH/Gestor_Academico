require('dotenv').config();
const sql = require('mssql');

// 🎯 CONFIGURACIÓN BASE. Apunta a 'master' para el arranque (bootstrap),
//    porque master es una base del sistema que SIEMPRE existe y nos permite
//    crear GestionAcademicaUVM si Docker la borró con un "down -v".
const config = {
  user: 'sa',
  password: process.env.DB_PASSWORD || "TuPasswordSeguroUVM2026#",
  server: process.env.DB_HOST || 'sqlserver',
  database: 'master', // Conexión INICIAL al sistema, solo para poder crear la BD del proyecto
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

// Nombre de la base de datos real del proyecto
const DB_NAME = 'GestionAcademicaUVM';

// 🔁 Intenta conectarse varias veces antes de rendirse.
//    SQL Server tarda en estar listo al arrancar; sin esto, el backend se
//    moriría al primer fallo (race condition del docker compose up).
async function conectarConReintentos(cfg, intentos = 15, esperaMs = 4000) {
  for (let i = 1; i <= intentos; i++) {
    try {
      const pool = await new sql.ConnectionPool(cfg).connect();
      return pool;
    } catch (err) {
      console.log(
        `⏳ SQL Server aún no está listo (intento ${i}/${intentos}): ${err.message}. Reintentando en ${esperaMs / 1000}s...`
      );
      if (i === intentos) throw err;
      await new Promise((resolve) => setTimeout(resolve, esperaMs));
    }
  }
}

async function inicializarBaseDeDatos() {
  try {
    // 1. Conexión inicial a 'master' (con reintentos por si SQL aún no está listo)
    const pool = await conectarConReintentos(config);
    console.log('🔌 Conectado temporalmente a master para verificar el entorno...');

    // 2. Crear la base de datos del proyecto si no existe
    //    (cubre el caso del contenedor virgen tras un "docker compose down -v")
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = '${DB_NAME}')
      BEGIN
        CREATE DATABASE ${DB_NAME};
      END
    `);

    // 3. Cerrar la conexión temporal y reconectar ya a la base real del proyecto
    await pool.close();

    const configReal = { ...config, database: DB_NAME };
    const poolReal = await conectarConReintentos(configReal);
    console.log(`✅ ¡Conexión exitosa y estable con la base de datos: [${DB_NAME}]!`);

    // 4. Crear tablas esenciales si la base está vacía
    await poolReal.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Usuarios]') AND type in (N'U'))
      BEGIN
        CREATE TABLE Usuarios (
          Id INT IDENTITY(1,1) PRIMARY KEY,
          Usuario VARCHAR(50) NOT NULL UNIQUE,
          Password VARCHAR(255) NOT NULL,
          Rol VARCHAR(20) DEFAULT 'Docente'
        );
        -- Usuario administrador por defecto para poder loguearte de inmediato
        INSERT INTO Usuarios (Usuario, Password, Rol)
        VALUES ('admin', 'UvmAdmin2026!', 'Administrador');
      END

      IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[estudiantes]') AND type in (N'U'))
      BEGIN
        CREATE TABLE estudiantes (
          id INT IDENTITY(1,1) PRIMARY KEY,
          matricula VARCHAR(20) NOT NULL UNIQUE,
          nombre VARCHAR(100) NOT NULL,
          asignatura VARCHAR(100),
          ciclo VARCHAR(20),
          parcial INT DEFAULT 1,
          teoria_10 FLOAT DEFAULT 0,
          laboratorio_40 FLOAT DEFAULT 0,
          blackboard_50 FLOAT DEFAULT 0,
          faltas_totales INT DEFAULT 0,
          limite_permitido INT DEFAULT 8,
          promedio_parcial FLOAT DEFAULT 0,
          estatus VARCHAR(30) DEFAULT 'Regular'
        );
      END

      IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[materias]') AND type in (N'U'))
      BEGIN
        CREATE TABLE materias (
          id_materia INT IDENTITY(1,1) PRIMARY KEY,
          Nombre_Materia VARCHAR(100) NOT NULL UNIQUE
        );
      END
    `);

    // 5. MIGRACIÓN: si la tabla 'estudiantes' YA existía sin la columna 'parcial',
    //    la agregamos sin borrar los datos. Los alumnos actuales quedan en el Parcial 1.
    await poolReal.request().query(`
      IF NOT EXISTS (
        SELECT * FROM sys.columns
        WHERE Name = N'parcial' AND Object_ID = Object_ID(N'dbo.estudiantes')
      )
      BEGIN
        ALTER TABLE estudiantes ADD parcial INT DEFAULT 1;
      END
    `);

    // 5.1 Rellenamos 'parcial' en los alumnos que quedaron en NULL.
    //     (Al agregar una columna nullable con DEFAULT, SQL Server deja las filas
    //      existentes en NULL salvo que se use WITH VALUES; esto lo corrige.)
    await poolReal.request().query(`
      UPDATE estudiantes SET parcial = 1 WHERE parcial IS NULL;
    `);

    // 5.2 Sembramos en 'materias' los nombres de asignatura que ya usan los alumnos,
    //     para que el menú no aparezca vacío la primera vez. (Idempotente.)
    await poolReal.request().query(`
      INSERT INTO materias (Nombre_Materia)
      SELECT DISTINCT asignatura
      FROM estudiantes
      WHERE asignatura IS NOT NULL AND LTRIM(RTRIM(asignatura)) <> ''
        AND asignatura NOT IN (SELECT Nombre_Materia FROM materias);
    `);

    console.log('📚 Tablas verificadas/creadas correctamente en SQL Server.');
    return poolReal;

  } catch (err) {
    console.error('❌ Error crítico en el ciclo de la Base de Datos:', err.message);
    process.exit(1);
  }
}

// Inicializamos la promesa de exportación
const poolPromise = inicializarBaseDeDatos();

module.exports = {
  sql,
  poolPromise
};