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

// 🛡️ Validación: las 3 evaluaciones deben ir de 0 a 10 (el _40 y _50 son PESOS, no escalas)
function validateStudentInput(req, res, next) {
  const { nombre, matricula, teoria_10, laboratorio_40, blackboard_50 } = req.body;

  // En POST, nombre y matricula son obligatorios (en PUT permitimos edición parcial)
  if (req.method === 'POST' && (!nombre || !matricula)) {
    return res.status(400).json({ code: 400, message: "Campos obligatorios faltantes." });
  }

  // Cada valor presente debe estar entre 0 y 10
  const fueraDeRango = [teoria_10, laboratorio_40, blackboard_50].some(val => {
    if (val === undefined || val === null || val === '') return false;
    const num = Number(val);
    return num < 0 || num > 10;
  });

  if (fueraDeRango) {
    return res.status(400).json({
      code: 400,
      message: "Error de Validación: Los valores de las evaluaciones deben estar entre 0 y 10"
    });
  }

  next();
}

// 🧮 Lógica compartida: calcula promedio y estatus a partir del cuerpo de la petición.
//    La usamos tanto en POST como en PUT para no duplicar reglas.
function procesarEvaluacion(body) {
  const nTeoria = Number(body.teoria_10) || 0;
  const nLab = Number(body.laboratorio_40) || 0;
  const nBb = Number(body.blackboard_50) || 0;
  const nFaltas = Number(body.faltas_totales) || 0;
  const nLimite = Number(body.limite_permitido) || 8;
  const nParcial = Number(body.parcial) || 1;

  const wTeoria = parseFloat(process.env.PESO_TEORIA || 0.10);
  const wLab = parseFloat(process.env.PESO_LABORATORIO || 0.40);
  const wBb = parseFloat(process.env.PESO_BLACKBOARD || 0.50);

  const promedioCrudo = (nTeoria * wTeoria) + (nLab * wLab) + (nBb * wBb);

  let estatus = "Regular";
  if (nFaltas > nLimite) {
    estatus = "Reprobado por Faltas";
  } else if (promedioCrudo < 6.0) {
    estatus = "Irregular";
  }

  return {
    nTeoria, nLab, nBb, nFaltas, nLimite, nParcial,
    promedio_parcial: parseFloat(promedioCrudo.toFixed(2)),
    estatus
  };
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
// 1. GET: Obtener todos los estudiantes
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
      parcial: row.parcial,            // 👈 AHORA SÍ devolvemos el parcial
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
// 2. POST: Añadir un nuevo estudiante
// ==========================================
app.post('/estudiantes', authenticateJWT, validateStudentInput, async (req, res) => {
  const { matricula, nombre, asignatura, ciclo } = req.body;
  const proc = procesarEvaluacion(req.body);

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('matricula', sql.VarChar, matricula)
      .input('nombre', sql.VarChar, nombre)
      .input('asignatura', sql.VarChar, asignatura)
      .input('ciclo', sql.VarChar, ciclo)
      .input('parcial', sql.Int, proc.nParcial)
      .input('teoria_10', sql.Float, proc.nTeoria)
      .input('laboratorio_40', sql.Float, proc.nLab)
      .input('blackboard_50', sql.Float, proc.nBb)
      .input('faltas_totales', sql.Int, proc.nFaltas)
      .input('limite_permitido', sql.Int, proc.nLimite)
      .input('promedio_parcial', sql.Float, proc.promedio_parcial)
      .input('estatus', sql.VarChar, proc.estatus)
      .query(`
        INSERT INTO estudiantes (
          matricula, nombre, asignatura, ciclo, parcial,
          teoria_10, laboratorio_40, blackboard_50,
          faltas_totales, limite_permitido, promedio_parcial, estatus
        )
        OUTPUT INSERTED.*
        VALUES (
          @matricula, @nombre, @asignatura, @ciclo, @parcial,
          @teoria_10, @laboratorio_40, @blackboard_50,
          @faltas_totales, @limite_permitido, @promedio_parcial, @estatus
        )
      `);

    // Devolvemos el estudiante completo (con su id) para que el frontend lo pinte bien
    res.status(201).json(result.recordset[0]);
  } catch (err) {
    console.error("Error al insertar estudiante:", err.message);
    res.status(500).json({ message: "No se pudo guardar al estudiante", error: err.message });
  }
});

// ==========================================
// 3. PUT: Editar un estudiante existente
// ==========================================
app.put('/estudiantes/:id', authenticateJWT, validateStudentInput, async (req, res) => {
  const { id } = req.params;
  const { matricula, nombre, asignatura, ciclo } = req.body;
  const proc = procesarEvaluacion(req.body);

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('matricula', sql.VarChar, matricula)
      .input('nombre', sql.VarChar, nombre)
      .input('asignatura', sql.VarChar, asignatura)
      .input('ciclo', sql.VarChar, ciclo)
      .input('parcial', sql.Int, proc.nParcial)
      .input('teoria_10', sql.Float, proc.nTeoria)
      .input('laboratorio_40', sql.Float, proc.nLab)
      .input('blackboard_50', sql.Float, proc.nBb)
      .input('faltas_totales', sql.Int, proc.nFaltas)
      .input('limite_permitido', sql.Int, proc.nLimite)
      .input('promedio_parcial', sql.Float, proc.promedio_parcial)
      .input('estatus', sql.VarChar, proc.estatus)
      .query(`
        UPDATE estudiantes SET
          matricula = @matricula,
          nombre = @nombre,
          asignatura = @asignatura,
          ciclo = @ciclo,
          parcial = @parcial,
          teoria_10 = @teoria_10,
          laboratorio_40 = @laboratorio_40,
          blackboard_50 = @blackboard_50,
          faltas_totales = @faltas_totales,
          limite_permitido = @limite_permitido,
          promedio_parcial = @promedio_parcial,
          estatus = @estatus
        OUTPUT INSERTED.*
        WHERE id = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Estudiante no encontrado" });
    }

    res.status(200).json(result.recordset[0]);
  } catch (err) {
    console.error("Error al actualizar estudiante:", err.message);
    res.status(500).json({ message: "No se pudo actualizar al estudiante", error: err.message });
  }
});

// ==========================================
// 4. DELETE: Eliminar un estudiante
// ==========================================
app.delete('/estudiantes/:id', authenticateJWT, async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM estudiantes OUTPUT DELETED.id WHERE id = @id');

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Estudiante no encontrado" });
    }

    res.status(200).json({ message: "Estudiante eliminado", id: Number(id) });
  } catch (err) {
    console.error("Error al eliminar estudiante:", err.message);
    res.status(500).json({ message: "No se pudo eliminar al estudiante", error: err.message });
  }
});

// ==========================================
// 5. GET: Listar todas las materias
// ==========================================
app.get('/materias', authenticateJWT, async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .query('SELECT id_materia, Nombre_Materia FROM materias ORDER BY Nombre_Materia');
    res.status(200).json(result.recordset);
  } catch (err) {
    console.error("🔥 Error al obtener materias:", err.message);
    res.status(500).json({ message: "Error al leer las materias", error: err.message });
  }
});

// ==========================================
// 6. POST: Crear una nueva materia (solo el nombre)
// ==========================================
app.post('/materias', authenticateJWT, async (req, res) => {
  const nombreMateria = (req.body.Nombre_Materia || req.body.nombre || '').trim();

  if (!nombreMateria) {
    return res.status(400).json({ message: "El nombre de la materia es obligatorio." });
  }

  try {
    const pool = await poolPromise;

    // Evitamos duplicados antes de insertar
    const existe = await pool.request()
      .input('nombre', sql.VarChar, nombreMateria)
      .query('SELECT 1 FROM materias WHERE Nombre_Materia = @nombre');

    if (existe.recordset.length > 0) {
      return res.status(409).json({ message: "Esa materia ya existe." });
    }

    const result = await pool.request()
      .input('nombre', sql.VarChar, nombreMateria)
      .query('INSERT INTO materias (Nombre_Materia) OUTPUT INSERTED.* VALUES (@nombre)');

    res.status(201).json(result.recordset[0]);
  } catch (err) {
    console.error("Error al crear materia:", err.message);
    res.status(500).json({ message: "No se pudo crear la materia", error: err.message });
  }
});

// ==========================================
// 7. DELETE: Eliminar una materia
// ==========================================
app.delete('/materias/:id', authenticateJWT, async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM materias OUTPUT DELETED.id_materia WHERE id_materia = @id');

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Materia no encontrada" });
    }

    res.status(200).json({ message: "Materia eliminada", id_materia: Number(id) });
  } catch (err) {
    console.error("Error al eliminar materia:", err.message);
    res.status(500).json({ message: "No se pudo eliminar la materia", error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('🚀 API en vivo Port 3000'));