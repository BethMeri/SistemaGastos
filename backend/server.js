const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta de prueba temporal (Simulando la API sin base de datos)
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'success', 
        message: 'Servidor de SistemaGastos funcionando correctamente en modo local/sin BD',
        timestamp: new Date()
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
}); 