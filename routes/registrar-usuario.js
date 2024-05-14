const express = require('express');
const router = express.Router();
const db = require('../db'); // Reemplaza esto con la ruta correcta a tu archivo db.js
const authMiddleWare = require('../middlewares/authMiddleware');

// Ruta para manejar el registro de usuarios
router.post('/', async (req, res) => {
    const { nombre, email, password, confirmPassword } = req.body;

    // Verificar si la contraseña y su confirmación coinciden
    if (password !== confirmPassword) {
        req.flash('error', 'Las contraseñas no coinciden');
        res.redirect('/registro');
    }

    try {
        // Verificar si el usuario ya está registrado
        const usuarioExistente = await db.obtenerUsuarioPorNombre(nombre);
        if (usuarioExistente) {
            // El usuario ya está registrado, envía un mensaje al cliente
            return res.status(400).send('El usuario ya está registrado');            
        }
        
        // Si el usuario no está registrado, continúa con el proceso de registro
        
        // Hash de la contraseña
        const hashedPassword = await authMiddleWare.getHash(password);

        // Registrar el usuario en la base de datos
        await db.registrarUsuario(nombre, email, hashedPassword);

        // Usuario insertado correctamente
        res.redirect('/login');
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error interno del servidor');
    }
});

module.exports = router;
