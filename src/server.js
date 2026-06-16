require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('./database'); // Archivo que exporta { sql, poolPromise }

const app = express();
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET;

// --- MIDDLEWARES ---

// 1. Middleware de Autenticación JWT (Bearer Auth)
function authenticateJWT(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      code: 401,
      message: "No autorizado",
      details: "Falta el token de autenticación Bearer o ha expirado."
    });
  }

  const token = authHeader.split(' ')[1];
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        code: 403,
        message: "Prohibido",
        details: "No tienes los permisos necesarios o el token es inválido."
      });
    }
    req.user = user;
    next();
  });
}

// 2. Middleware de Validación Estricta de Entradas
function validateStudentInput(req, res, next) {
  const { nombre, matricula, evaluacion_continua, asistencias } = req.body;

  if (req.method === 'POST' && (!nombre || !matricula)) {
    return res.status(400).json({
      code: 400,
      message: "Solicitud incorrecta",
      details: "El campo 'nombre' y 'matricula' son obligatorios."
    });
  }

  if (evaluacion_continua) {
    const { teoria_10, laboratorio_40, blackboard_50 } = evaluacion_continua;
    
    if (
      (teoria_10 !== undefined && (teoria_10 < 0 || teoria_10 > 10)) ||
      (laboratorio_40 !== undefined && (laboratorio_40 < 0 || laboratorio_40 > 10)) ||
      (blackboard_50 !== undefined && (blackboard_50 < 0 || blackboard_50 > 10))
    ) {
      return res.status(400).json({
        code: 400,
        message: "Solicitud incorrecta",
        details: "Los valores de las evaluaciones deben estar estrictamente entre 0 y 10."
      });
    }
  }

  next();
}

// --- LÓGICA DE NEGOCIO EN CASCADA ---
function calcularEstatusAcademico(evaluacion, asistencias) {
  const { teoria_10, laboratorio_40, blackboard_50 } = evaluacion;
  const { faltas_totales, limite_permitido } = asistencias;

  if (faltas_totales > limite_permitido) {
    return {
      promedio: 0.0, 
      estatus: "Reprobado por Faltas"
    };
  }

  const wTeoria = parseFloat(process.env.PESO_TEORIA);
  const wLab = parseFloat(process.env.PESO_LABORATORIO);
  const wBb = parseFloat(process.env.PESO_BLACKBOARD);

  const promedio = (teoria_10 * wTeoria) + (laboratorio_40 * wLab) + (blackboard_50 * wBb);
  
  let estatus = "Regular";
  if (promedio < 6.0) {
    estatus = "Reprobado o Presenta Examen Final";
  }

  return {
    promedio: parseFloat(promedio.toFixed(2)),
    estatus: estatus
  };
}

// --- ENDPOINTS ---

// GET /estudiantes - Obtener lista de estudiantes
app.get('/estudiantes', authenticateJWT, async (req, res) => {
  try {
    const pool = await db.poolPromise;
    const result = await pool.request().query(`SELECT * FROM estudiantes`);
    const rows = result.recordset;
    
    const respuesta = rows.map(row => ({
      id: row.id,
      matricula: row.matricula,
      nombre: row.nombre,
      asignatura: row.asignatura,
      ciclo: row.ciclo,
      evaluacion_continua: { teoria_10: row.teoria_10, laboratorio_40: row.laboratorio_40, blackboard_50: row.blackboard_50 },
      asistencias: { faltas_totales: row.faltas_totales, limite_permitido: row.limite_permitido },
      promedio_parcial: row.promedio_parcial,
      estatus: row.estatus
    }));

    res.status(200).json(respuesta);
  } catch (err) {
    res.status(500).json({ code: 500, message: "Error interno del servidor", details: err.message });
  }
});

// GET /estudiantes/{id} - Obtener estudiante por ID
app.get('/estudiantes/:id', authenticateJWT, async (req, res) => {
  try {
    const pool = await db.poolPromise;
    const result = await pool.request()
      .input('id', db.sql.Int, req.params.id)
      .query(`SELECT * FROM estudiantes WHERE id = @id`);
    
    const row = result.recordset[0];
    if (!row) {
      return res.status(404).json({ 
        code: 404, 
        message: "Estudiante no encontrado", 
        details: "No existe un estudiante registrado con el ID proporcionado." 
      });
    }

    res.status(200).json({
      id: row.id,
      matricula: row.matricula,
      nombre: row.nombre,
      asignatura: row.asignatura,
      ciclo: row.ciclo,
      evaluacion_continua: { teoria_10: row.teoria_10, laboratorio_40: row.laboratorio_40, blackboard_50: row.blackboard_50 },
      asistencias: { faltas_totales: row.faltas_totales, limite_permitido: row.limite_permitido },
      promedio_parcial: row.promedio_parcial,
      estatus: row.estatus
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: "Error interno del servidor", details: err.message });
  }
});

// POST /estudiantes - Crear estudiante
app.post('/estudiantes', authenticateJWT, validateStudentInput, async (req, res) => {
  const { matricula, nombre, asignatura, ciclo, evaluacion_continua, asistencias } = req.body;
  const { promedio, estatus } = calcularEstatusAcademico(evaluacion_continua, asistencias);

  try {
    const pool = await db.poolPromise;
    const result = await pool.request()
      .input('matricula', db.sql.VarChar, matricula)
      .input('nombre', db.sql.VarChar, nombre)
      .input('asignatura', db.sql.VarChar, asignatura)
      .input('ciclo', db.sql.VarChar, ciclo)
      .input('teoria_10', db.sql.Decimal(4,2), evaluacion_continua.teoria_10)
      .input('laboratorio_40', db.sql.Decimal(4,2), evaluacion_continua.laboratorio_40)
      .input('blackboard_50', db.sql.Decimal(4,2), evaluacion_continua.blackboard_50)
      .input('faltas_totales', db.sql.Int, asistencias.faltas_totales)
      .input('limite_permitido', db.sql.Int, asistencias.limite_permitido)
      .input('promedio_parcial', db.sql.Decimal(4,2), promedio)
      .input('estatus', db.sql.VarChar, estatus)
      .query(`
        INSERT INTO estudiantes (matricula, nombre, asignatura, ciclo, teoria_10, laboratorio_40, blackboard_50, faltas_totales, limite_permitido, promedio_parcial, estatus)
        OUTPUT INSERTED.id
        VALUES (@matricula, @nombre, @asignatura, @ciclo, @teoria_10, @laboratorio_40, @blackboard_50, @faltas_totales, @limite_permitido, @promedio_parcial, @estatus)
      `);
    
    res.status(201).json({ id: result.recordset[0].id, ...req.body, promedio_parcial: promedio, estatus: estatus });
  } catch (err) {
    if (err.message.includes('UNIQUE') || err.message.includes('Violation of UNIQUE KEY constraint')) {
      return res.status(400).json({ code: 400, message: "Solicitud incorrecta", details: "La matrícula ya se encuentra registrada." });
    }
    res.status(500).json({ code: 500, message: "Error interno del servidor", details: err.message });
  }
});

// PUT /estudiantes/{id} - Actualizar estudiante
app.put('/estudiantes/:id', authenticateJWT, validateStudentInput, async (req, res) => {
  const { matricula, nombre, asignatura, ciclo, evaluacion_continua, asistencias } = req.body;
  const { id } = req.params;

  try {
    const pool = await db.poolPromise;
    
    // Obtener datos actuales para realizar el merge si los campos vienen parciales
    const selectResult = await pool.request()
      .input('id', db.sql.Int, id)
      .query(`SELECT * FROM estudiantes WHERE id = @id`);
    
    const row = selectResult.recordset[0];
    if (!row) {
      return res.status(404).json({ 
        code: 404, 
        message: "Estudiante no encontrado", 
        details: "El estudiante que intentas actualizar no existe." 
      });
    }

    const rEvaluacion = { ...{ teoria_10: row.teoria_10, laboratorio_40: row.laboratorio_40, blackboard_50: row.blackboard_50 }, ...evaluacion_continua };
    const rAsistencias = { ...{ faltas_totales: row.faltas_totales, limite_permitido: row.limite_permitido }, ...asistencias };
    
    const { promedio, estatus } = calcularEstatusAcademico(rEvaluacion, rAsistencias);

    await pool.request()
      .input('id', db.sql.Int, id)
      .input('matricula', db.sql.VarChar, matricula || row.matricula)
      .input('nombre', db.sql.VarChar, nombre || row.nombre)
      .input('asignatura', db.sql.VarChar, asignatura || row.asignatura)
      .input('ciclo', db.sql.VarChar, ciclo || row.ciclo)
      .input('teoria_10', db.sql.Decimal(4,2), rEvaluacion.teoria_10)
      .input('laboratorio_40', db.sql.Decimal(4,2), rEvaluacion.laboratorio_40)
      .input('blackboard_50', db.sql.Decimal(4,2), rEvaluacion.blackboard_50)
      .input('faltas_totales', db.sql.Int, rAsistencias.faltas_totales)
      .input('limite_permitido', db.sql.Int, rAsistencias.limite_permitido)
      .input('promedio_parcial', db.sql.Decimal(4,2), promedio)
      .input('estatus', db.sql.VarChar, estatus)
      .query(`
        UPDATE estudiantes SET 
          matricula = @matricula, nombre = @nombre, asignatura = @asignatura, ciclo = @ciclo, 
          teoria_10 = @teoria_10, laboratorio_40 = @laboratorio_40, blackboard_50 = @blackboard_50, 
          faltas_totales = @faltas_totales, limite_permitido = @limite_permitido, promedio_parcial = @promedio_parcial, estatus = @estatus
        WHERE id = @id
      `);

    res.status(200).json({ id: parseInt(id), message: "Estudiante actualizado exitosamente", promedio_parcial: promedio, estatus: estatus });
  } catch (err) {
    res.status(500).json({ code: 500, message: "Error al actualizar", details: err.message });
  }
});

// PATCH /estudiantes/{id}/inactivar - Baja lógica de estudiante (Reemplaza al antiguo DELETE)
app.patch('/estudiantes/:id/inactivar', authenticateJWT, async (req, res) => {
  try {
    const pool = await db.poolPromise;
    const result = await pool.request()
      .input('id', db.sql.Int, req.params.id)
      .query(`UPDATE estudiantes SET estatus = 'Inactivo' WHERE id = @id`);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ 
        code: 404, 
        message: "Estudiante no encontrado", 
        details: "El estudiante que intentas dar de baja no existe." 
      });
    }

    res.status(200).json({ message: "Estudiante inactivado exitosamente (baja lógica del sistema)." });
  } catch (err) {
    res.status(500).json({ code: 500, message: "Error al intentar procesar la baja", details: err.message });
  }
});

// Inicialización del servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
