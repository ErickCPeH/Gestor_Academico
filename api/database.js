require('dotenv').config();
const sql = require('mssql');

// 🎯 CONFIGURACIÓN: Apuntamos directamente a tu base de datos académica de la UVM
const config = {
  user: 'sa',
  password: process.env.DB_PASSWORD || "TuPasswordSeguroUVM2026#",
  server: process.env.DB_HOST || 'sqlserver',
  database: 'GestionAcademicaUVM', // Nos conectamos primero a master para asegurar la existencia de tu BD
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

// Nombre de la base de datos del proyecto
const DB_NAME = 'GestionAcademicaUVM';

async function inicializarBaseDeDatos() {
  try {
    // 1. Conexión inicial a 'master'
    const pool = await new sql.ConnectionPool(config).connect();
    console.log('🔌 Conectado temporalmente a master para verificar entorno...');

    // 2. Crear la base de datos si no existe (por si el docker compose down -v la borró)
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = '${DB_NAME}')
      BEGIN
        CREATE DATABASE ${DB_NAME};
      END
    `);

    // 3. Cerrar conexión temporal y reconectar a la base de datos real del proyecto
    await pool.close();

    const configReal = { ...config, database: DB_NAME };
    const poolReal = await new sql.ConnectionPool(configReal).connect();
    console.log(`✅ ¡Conexión exitosa y estable con la base de datos: [${DB_NAME}]!`);

    // 4. Crear tablas esenciales si el contenedor está completamente virgen
    await poolReal.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Usuarios]') AND type in (N'U'))
      BEGIN
        CREATE TABLE Usuarios (
          Id INT IDENTITY(1,1) PRIMARY KEY,
          Usuario VARCHAR(50) NOT NULL UNIQUE,
          Password VARCHAR(255) NOT NULL,
          Rol VARCHAR(20) DEFAULT 'Docente'
        );
        -- Insertamos tu usuario administrador por defecto para que puedas loguearte de inmediato
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
          teoria_10 FLOAT DEFAULT 0,
          laboratorio_40 FLOAT DEFAULT 0,
          blackboard_50 FLOAT DEFAULT 0,
          faltas_totales INT DEFAULT 0,
          limite_permitido INT DEFAULT 8,
          promedio_parcial FLOAT DEFAULT 0,
          estatus VARCHAR(30) DEFAULT 'Regular'
        );
      END
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
