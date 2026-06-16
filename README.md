# API de Gestión Académica - UVM

API robusta desarrollada en Node.js y Express para la administración, evaluación continua y control de asistencia de estudiantes en la Universidad del Valle de México[cite: 78, 149]. El proyecto implementa un diseño profesional basado en contratos de API (OpenAPI/Swagger), seguridad basada en tokens JWT y almacenamiento en SQL Server con soporte para bajas lógicas (soft deletes).

---

## 👥 Autores del Proyecto
Este proyecto fue diseñado y desarrollado por:
* **Erick Pérez** 
* **Francisco Maldonado** 
* **Jorge Vargas** 
* **Paola González** 

---

## 🚀 Arquitectura y Tecnologías
* **Backend:** Node.js con el framework Express.
* **Base de Datos:** Microsoft SQL Server (migrado desde SQLite en memoria para entornos de producción).
* **Autenticación:** JSON Web Tokens (JWT) con estrategia Bearer Auth[cite: 149].
* **Gestión de Entorno:** Dotenv para la carga dinámica de configuraciones y ponderaciones institucionales.
* **Documentación:** Contrato de API estandarizado bajo la especificación OpenAPI 3.0.0[cite: 79].

---

## 📂 Estructura del Repositorio Recomendada

Para mantener una separación clara de responsabilidades y asegurar que el repositorio sea escalable, se utiliza la siguiente estructura organizada:

```text
gestion-academica-uvm/
├── docs/                             # Documentación y contratos de la API
│   └── GestionAcademica.yaml         # Contrato OpenAPI 3.0.0 original
├── src/                              # Código fuente de la aplicación
│   ├── config/
│   │   └── database.js               # Conexión y Pool de SQL Server
│   ├── middlewares/
│   │   ├── auth.js                   # Middleware de autenticación JWT
│   │   └── validation.js             # Validación estricta de calificaciones y datos
│   ├── utils/
│   │   └── businessRules.js          # Lógica de cálculo académica en cascada
│   ├── scripts/
│   │   └── generate-token.js         # Script utilitario para generar tokens de prueba
│   └── server.js                     # Punto de entrada principal de la aplicación Express
├── .env.example                      # Plantilla de variables de entorno (sin datos sensibles)
├── .gitignore                        # Archivos excluidos de Git (node_modules, .env, logs)
├── package.json                      # Dependencias y scripts de ejecución
└── README.md                         # Guía de usuario y documentación técnica (este archivo)
