# 🎓 Gestor Académico - UVM

Plataforma integral full-stack desarrollada para la gestión de estudiantes, asignaturas y evaluaciones continuas en la Universidad del Valle de México (UVM). 

El proyecto cuenta con una arquitectura moderna cliente-servidor, con un frontend responsivo y un backend robusto protegido por autenticación JWT, todo orquestado mediante contenedores Docker para facilitar su despliegue.

---

## 👥 Equipo de Desarrollo (Autores)
* **Erick Pérez**
* **Francisco Maldonado**
* **Jorge Vargas**
* **Paola González**

---

## 🚀 Tecnologías Utilizadas

**Frontend:**
* [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
* [Tailwind CSS](https://tailwindcss.com/) para estilos utilitarios
* TypeScript

**Backend:**
* [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/)
* Autenticación con JSON Web Tokens (JWT)
* Controlador `mssql` para conexión a base de datos

**Base de Datos e Infraestructura:**
* Microsoft SQL Server
* [Docker](https://www.docker.com/) & Docker Compose
* Nginx (Servidor web y Proxy Inverso)

---

## 📂 Estructura del Proyecto

El repositorio está dividido en dos módulos principales:

```text
Gestor_Academico/
├── api/                  # Backend (Node.js, Express, SQL Server)
│   ├── database.js       # Conexión y auto-migración de tablas SQL
│   ├── server.js         # Endpoints de la API REST y lógica de negocio
│   └── Dockerfile        # Imagen Docker del backend
├── frontend/             # Frontend (React, Vite, Tailwind)
│   ├── src/              # Código fuente de la interfaz gráfica
│   └── Dockerfile        # Imagen Docker para el build de React
├── nginx.conf            # Configuración del proxy inverso
└── docker-compose.yml    # Orquestación de todos los servicios
