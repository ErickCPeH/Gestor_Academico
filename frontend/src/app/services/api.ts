// src/services/api.ts

const API_URL = '/api/login'; // Asegúrate de que tu backend corra en este puerto

// Para pruebas, pega aquí un token generado con tu script generate-token.js
// Más adelante, esto se tomará del Login.
const TEMP_TOKEN = "PEGA_TU_TOKEN_JWT_AQUI"; 

export const apiService = {
  getAllStudents: async () => {
    const response = await fetch(`${API_URL}/estudiantes`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEMP_TOKEN}`
      }
    });
    if (!response.ok) throw new Error('Error al obtener estudiantes');
    return response.json();
  },

  createStudent: async (studentData: any) => {
    const response = await fetch(`${API_URL}/estudiantes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEMP_TOKEN}`
      },
      body: JSON.stringify(studentData)
    });
    if (!response.ok) throw new Error('Error al crear estudiante');
    return response.json();
  }
};