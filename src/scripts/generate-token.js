require('dotenv').config();
const jwt = require('jsonwebtoken');

const payload = {
  user: "ErickPerez",
  role: "admin"
};

const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2h' });

console.log("\nTOKEN GENERADO CON ÉXITO\n");
console.log("Copia y usa este token completo en el Header de tus peticiones (Authorization: Bearer <TOKEN>):\n");
console.log(token);
console.log("\n--------------------------------------------------------------------------------\n");
