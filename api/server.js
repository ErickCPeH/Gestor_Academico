require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const { poolPromise, sql } = require('./database');

const app = express();
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'ClaveSecretaSuperSeguraUVM2026';

// Middleware para proteger las rutas con JWT
function authenticateJWT(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ code: 401, message: "No autorizado" });
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ code: 403, message: "Prohibido" });
    req.user = user;
    next();
  });
}

// 🛡️ Middleware corregido (Llaves alineadas y next() dentro)
function validateStudentInput(req, res, next) {
  const { nombre, matricula, teoria_10, laboratorio_40, blackboard_50 } = req.body;

  if (req.method === 'POST' && (!nombre || !matricula)) {
    return res.status(400).json({ code: 400, message: "Campos obligatorios faltantes." });
  }

  // Convertimos explícitamente a número cada valor antes de validar el rango
  if ([teoria_10, laboratorio_40, blackboard_50].some(val => {
    if (val === undefined || val === null || val === '') return false;
    const num = Number(val);
    return num < 0 || num > 10;
  })) {
    return res.status(400).json({
      code: 400,
      message: "Error de Validación: Los valores de las evaluaciones deben estar estrictamente entre 0 y 10"
    });
  }

  next(); // <-- Ahora sí está protegido dentro de la función
}

function calcularEstatusAcademico(evaluacion, asistencias) {
  const { teoria_10, laboratorio_40, blackboard_50 } = evaluacion;
  const { faltas_totales, limite_permitido } = asistencias;

  if (faltas_totales > limite_permitido) {
    return { promedio: 0.0, estatus: "Reprobado por Faltas" };
  }

  const wTeoria = parseFloat(process.env.PESO_TEORIA || 0.10);
  const wLab = parseFloat(process.env.PESO_LABORATORIO || 0.40);
  const wBb = parseFloat(process.env.PESO_BLACKBOARD || 0.50);

  const promedio = (teoria_10 * wTeoria) + (laboratorio_40 * wLab) + (blackboard_50 * wBb);
  let estatus = promedio < 6.0 ? "Reprobado" : "Regular";

  return { promedio: parseFloat(promedio.toFixed(2)), estatus };
}

// 🔐 ENDPOINT: Autenticación de Usuarios para el Login
app.post('/login', async (req, res) => {
  const { usuario, password } = req.body;

  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .input('usuario', sql.VarChar, usuario)
      .query('SELECT * FROM Usuarios WHERE Usuario = @usuario');

    if (result.recordset.length === 0) {
      return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
    }

    const user = result.recordset[0];

    if (user.Password !== password) {
      return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
    }

    const userId = user.Id || user.id;
    const userUsuario = user.Usuario || user.usuario;
    const userRol = user.Rol || user.rol;

    const token = jwt.sign(
      { id: userId, usuario: userUsuario, rol: userRol },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    return res.status(200).json({ token });

  } catch (err) {
    console.error("🔥 Error real en login:", err.message);
    return res.status(500).json({ message: "Error interno al validar credenciales", error: err.message });
  }
});

// ==========================================
// 1. RUTA PARA OBTENER CALIFICACIONES Y ESTUDIANTES
// ==========================================
app.get('/estudiantes', authenticateJWT, async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM estudiantes');

    const respuesta = result.recordset.map(row => ({
      id: row.id,
      matricula: row.matricula,
      nombre: row.nombre,
      asignatura: row.asignatura,
      ciclo: row.ciclo,
      teoria_10: row.teoria_10,
      laboratorio_40: row.laboratorio_40,
      blackboard_50: row.blackboard_50,
      faltas_totales: row.faltas_totales,
      limite_permitido: row.limite_permitido,
      promedio_parcial: row.promedio_parcial,
      estatus: row.estatus
    }));

    res.status(200).json(respuesta);
  } catch (err) {
    console.error("🔥 Error al obtener estudiantes:", err.message);
    res.status(500).json({ message: "Error al leer los datos escolares", error: err.message });
  }
});

// ==========================================
// 2. RUTA PARA AÑADIR UN NUEVO ESTUDIANTE (Con validación numérica estricta)
// ==========================================
app.post('/estudiantes', authenticateJWT, validateStudentInput, async (req, res) => {
  const {
    matricula, nombre, asignatura, ciclo,
    teoria_10, laboratorio_40, blackboard_50,
    faltas_totales, limite_permitido
  } = req.body;

  try {
    // Forzamos conversión a número para evitar problemas matemáticos de strings
    const nTeoria = Number(teoria_10);
    const nLab = Number(laboratorio_40);
    const nBb = Number(blackboard_50);
    const nFaltas = Number(faltas_totales);
    const nLimite = Number(limite_permitido);

    const promedio_parcial = (nTeoria * 0.10) + (nLab * 0.40) + (nBb * 0.50);

    let estatus = "Regular";
    if (nFaltas > nLimite) {
      estatus = "Reprobado por Faltas";
    } else if (promedio_parcial < 6.0) {
      estatus = "Irregular";
    }

    const pool = await poolPromise;
    await pool.request()
      .input('matricula', sql.VarChar, matricula)
      .input('nombre', sql.VarChar, nombre)
      .input('asignatura', sql.VarChar, asignatura)
      .input('ciclo', sql.VarChar, ciclo)
      .input('teoria_10', sql.Float, nTeoria)
      .input('laboratorio_40', sql.Float, nLab)
      .input('blackboard_50', sql.Float, nBb)
      .input('faltas_totales', sql.Int, nFaltas)
      .input('limite_permitido', sql.Int, nLimite)
      .input('promedio_parcial', sql.Float, parseFloat(promedio_parcial.toFixed(2)))
      .input('estatus', sql.VarChar, estatus)
      .query(`
        INSERT INTO estudiantes (
          matricula, nombre, asignatura, ciclo, 
          teoria_10, laboratorio_40, blackboard_50, 
          faltas_totales, limite_permitido, promedio_parcial, estatus
        ) VALUES (
          @matricula, @nombre, @asignatura, @ciclo, 
          @teoria_10, @laboratorio_40, @blackboard_50, 
          @faltas_totales, @limite_permitido, @promedio_parcial, @estatus
        )
      `);

    res.status(201).json({ message: "¡Estudiante añadido con éxito!" });
  } catch (err) {
    console.error("Error al insertar estudiante:", err.message);
    res.status(500).json({ message: "No se pudo guardar al estudiante", error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 API corriendo en el puerto ${PORT}`));

