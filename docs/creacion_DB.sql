-- 1. Creación de la Base de Datos
CREATE DATABASE GestionAcademicaUVM;
GO

-- Cambiar al contexto de la nueva base de datos
USE GestionAcademicaUVM;
GO

-- 2. Creación de la Tabla de Estudiantes
CREATE TABLE estudiantes (
    id INT IDENTITY(1,1) PRIMARY KEY,
    matricula VARCHAR(30) NOT NULL UNIQUE,
    nombre VARCHAR(150) NOT NULL,
    asignatura VARCHAR(100) NOT NULL,
    ciclo VARCHAR(20) NOT NULL,
    
    -- Calificaciones con precisión de 2 decimales y restricción de rango (0.00 a 10.00)
    teoria_10 DECIMAL(4,2) NOT NULL CONSTRAINT CK_teoria_rango CHECK (teoria_10 BETWEEN 0.00 AND 10.00),
    laboratorio_40 DECIMAL(4,2) NOT NULL CONSTRAINT CK_laboratorio_rango CHECK (laboratorio_40 BETWEEN 0.00 AND 10.00),
    blackboard_50 DECIMAL(4,2) NOT NULL CONSTRAINT CK_blackboard_rango CHECK (blackboard_50 BETWEEN 0.00 AND 10.00),
    
    -- Asistencias e inasistencias
    faltas_totales INT NOT NULL DEFAULT 0 CONSTRAINT CK_faltas_positivo CHECK (faltas_totales >= 0),
    limite_permitido INT NOT NULL DEFAULT 7 CONSTRAINT CK_limite_positivo CHECK (limite_permitido >= 0),
    
    -- Campos calculados por la lógica de negocio
    promedio_parcial DECIMAL(4,2) NULL CONSTRAINT CK_promedio_rango CHECK (promedio_parcial BETWEEN 0.00 AND 10.00),
    estatus VARCHAR(50) NOT NULL DEFAULT 'Regular'
);
GO

-- 3. Creación de un Índice para optimizar búsquedas por matrícula o estatus (Opcional, recomendado para rendimiento)
CREATE INDEX IX_estudiantes_matricula ON estudiantes(matricula);
CREATE INDEX IX_estudiantes_estatus ON estudiantes(estatus);
GO

-- 4. Inserción del registro inicial de ejemplo
INSERT INTO estudiantes (
    matricula, 
    nombre, 
    asignatura, 
    ciclo, 
    teoria_10, 
    laboratorio_40, 
    blackboard_50, 
    faltas_totales, 
    limite_permitido, 
    promedio_parcial, 
    estatus
)
VALUES (
    '10214559', 
    'AGUILAR HERNANDEZ IAN', 
    'Sistemas Operativos', 
    'C1-2026', 
    8.86, 
    8.33, 
    7.85, 
    0, 
    7, 
    8.30, 
    'Regular'
);
GO

-- 5. Verificación de los datos insertados
SELECT * FROM estudiantes;
GO
