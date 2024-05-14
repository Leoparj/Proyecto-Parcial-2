const express = require('express');
const pug = require('pug');
const app = express();
const session = require('express-session');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const router = require('./routes/routes');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const SQLiteStore = require('connect-sqlite3')(session);
const db = require('./db'); // Archivo donde configuras tu base de datos SQLite
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const authMiddleWare = require('./middlewares/authMiddleware');


// Importar el controlador de conversión
const conversionController = require('./controllers/conversionController');

// Configuración de la plantilla Pug
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Configurar Cookie Parser
app.use(cookieParser());

// Configurar DotEnv
dotenv.config();

// Configurar middleware para manejar sesiones
app.use(session({
  secret: process.env.ACCESS_TOKEN_SECRET, // Clave secreta para firmar la cookie de sesión
  resave: false,
  saveUninitialized: false,
  store: new SQLiteStore({ db: 'sessionsDB.sqlite', table: 'sessions' }) // Almacena las sesiones en una base de datos SQLite
}));

// Configurar connect-flash
app.use(flash());

// Configurar Passport.js
app.use(passport.initialize());
app.use(passport.session());

// Configurar estrategia de autenticación local
passport.use(new LocalStrategy(
  async (username, password, done) => {
    try {
      const user = await db.obtenerUsuarioPorNombre(username);
      if (!user) {
        return done(null, false, { message: 'Usuario incorrecto.' });
      }
      const passwordMatch = await authMiddleWare.comparePassword(password, user.password_hash);
      if (!passwordMatch) {
        return done(null, false, { message: 'Contraseña incorrecta.' });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  await db.getUserById(id).then((user) => {
    done(null, user);
  }).catch((error) => {
    done(error, null);
  });
});

// Middleware para procesar archivos estáticos en la carpeta 'public'
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para procesar la carga de archivos en memoria
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Ruta para manejar la solicitud POST del formulario de carga
app.post('/convertir', upload.single('image'), conversionController.convertirImagen);

// Middleware para manejar sesiones
app.use((req, res, next) => {
  if(!req.session.usuarioID && !req.session.intentos){
    req.session.intentos = 0;
  }

  res.locals.carrito = req.session.carrito || [];
  console.log(`Solicitud recibida: ${req.method} ${req.url}`);
  next();
});

// Middleware para manejar errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Algo salió mal');
});

// Configurar las rutas principales
app.use('/', router);

// Iniciar el servidor
const port = 3000;
app.listen(port, () => {
  console.log(`Servidor iniciado en http://localhost:${port}`);
});
