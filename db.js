const mysql2 = require('mysql2');
const conect = require('./db_connection.js');

const connection = conect.createConnection();

// Función para insertar un nuevo usuario en la base de datos MySQL
async function registrarUsuario(nombre, email, password) {
    return new Promise((resolve, reject) => {
        connection.query(
            'INSERT INTO usuarios (nombre, email, password_hash) VALUES (?, ?, ?)',
            [nombre, email, password],
            (err, results) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                } else {
                    console.log('Usuario insertado correctamente');
                    resolve();
                }
            });
    });
}

// Funcion para insertar una nueva imagen en la base de datos MySQL
async function registrarImagen(imgOriginal, imgConvertida, formatoDestino) {
    return new Promise((resolve, reject) => {
        connection.query(
            'INSERT INTO imagenes (imgOriginal, imgConvertida, formato) VALUES (?, ?, ?)',
            [imgOriginal, imgConvertida, formatoDestino],
            (err, results) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                } else {
                    console.log('Imagen insertada correctamente');
                    resolve();
                }
            });
    });
}

// Función para obtener un usuario por su nombre de usuario
async function obtenerUsuarioPorNombre(nombre) {
    return new Promise((resolve, reject) => {
        connection.query(
            'SELECT * FROM usuarios WHERE nombre = ?',
            [nombre],
            (err, results) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                } else {
                    resolve(results[0]);
                }
            });
    });
}

// Función para obtener un usuario por su ID
async function getUserById(id) {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM usuarios WHERE id = ?', [id], (err, results) => {
            if (err) {
                console.error(err.message);
                reject(err);
            } else {
                resolve(results[0]);
            }
        });
    });
}

module.exports = {
    registrarUsuario,
    obtenerUsuarioPorNombre,
    getUserById,
    registrarImagen
};