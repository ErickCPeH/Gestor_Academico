require('dotenv').config();
const sql = require('mssql');

const config = {
  user: 'sa',
  password: process.env.DB_PASSWORD || "TuPasswordSeguroUVM2026#",
  server: process.env.DB_HOST || 'sqlserver',
  database: 'master', 
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

const DB_NAME = 'GestionAcademicaUVM';


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
    const pool = await conectarConReintentos(config);
    console.log('🔌 Conectado temporalmente a master para verificar el entorno...');


    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = '${DB_NAME}')
      BEGIN
        CREATE DATABASE ${DB_NAME};
      END
    `);

    await pool.close();

    const configReal = { ...config, database: DB_NAME };
    const poolReal = await conectarConReintentos(configReal);
    console.log(`✅ ¡Conexión exitosa y estable con la base de datos: [${DB_NAME}]!`);

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


    await poolReal.request().query(`
      IF NOT EXISTS (
        SELECT * FROM sys.columns
        WHERE Name = N'parcial' AND Object_ID = Object_ID(N'dbo.estudiantes')
      )
      BEGIN
        ALTER TABLE estudiantes ADD parcial INT DEFAULT 1;
      END
    `);

    await poolReal.request().query(`
      UPDATE estudiantes SET parcial = 1 WHERE parcial IS NULL;
    `);

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

const poolPromise = inicializarBaseDeDatos();

module.exports = {
  sql,
  poolPromise
};
