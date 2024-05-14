// routes/index.js
const express = require('express');
const router = express.Router();

// Rutas públicas
router.get('/', (req, res) => {
  var intentos = req.session.intentos;
  res.render('index', { title: req.user != null ? `Bienvenido, ${req.user.nombre}` : 'Pear - Cambiale el formato' , user: req.user != null ? `Bienvenido, ${req.user.nombre}` : '', conversionesRestantes: intentos});
});


module.exports = router;