const express = require('express');
const router = express.Router();
const passport = require('passport');
const authMiddleware = require('../middlewares/authMiddleware'); // Middleware para proteger rutas

// Ruta para mostrar el formulario de login
router.get('/', (req, res) => {
  res.render('login', { title: 'Iniciar sesión' });
});

router.post('/', passport.authenticate('local', {
  failureRedirect: '/registro',
  failureFlash: true
}), (req, res) => {
  // Si se autentica correctamente, crea un token JWT
  const token = authMiddleware.generateToken(req.user.id);
  req.session.usuarioID = req.user.id;

  res.cookie('token', token, { httpOnly: true, secure: false });

  //redirecciona a la pagina inicial
  res.redirect('/');
});




module.exports = router;
