// conversionController.js
const sharp = require('sharp');
const potrace = require('potrace');
const authMiddleware = require('../middlewares/authMiddleware'); // Importa el middleware de autenticación
const { registrarImagen } = require('../db.js'); // Importa la función registrarImagen

exports.convertirImagen = async (req, res) => {
    try {
        // Verificar si el usuario ha realizado menos de tres conversiones o ya está autenticado
        if (req.session.intentos < 3 || req.cookies.token) {
            // Verificar si se ha proporcionado un archivo y si es una imagen
            if (!req.file) {
                return res.status(400).send('No se ha proporcionado ningún archivo');
            }

            let formatoDestino = 'png'; // Predeterminado a PNG

            if (req.body.opciones) {
                const opciones = req.body.opciones.toUpperCase();
                if (opciones === 'JPEG') {
                    formatoDestino = 'jpeg';
                } else if (opciones === 'JPG') {
                    formatoDestino = 'jpg';
                } else if (opciones === 'SVG' || opciones === 'PNG' || opciones === 'WEBP') {
                    formatoDestino = opciones.toLowerCase();
                }
            }

            // Convertir la imagen a formato destino
            let buffer;
            if (formatoDestino === 'svg') {
                buffer = await sharp(req.file.buffer).toBuffer();
                buffer = await new Promise((resolve, reject) => {
                    potrace.trace(buffer, { threshold: 128 }, (err, svg) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(svg);
                        }
                    });
                });
            } else {
                buffer = await sharp(req.file.buffer).toFormat(formatoDestino).toBuffer();
            }

            // Insertar la imagen en la base de datos antes de enviarla al cliente
            await registrarImagen(req.file.buffer, buffer, formatoDestino);

            // Configurar el encabezado Content-Disposition para que el navegador descargue la imagen
            res.set({
                'Content-Type': `image/${formatoDestino}`, // Tipo de contenido de salida: PNG, JPEG, SVG, WEBP
                'Content-Disposition': `attachment; filename="Imagen.${formatoDestino}"` // Nombre del archivo a descargar
            });

            // Enviar la imagen convertida al cliente
            res.send(buffer);

            // Incrementar el contador de conversiones realizadas por el usuario
            req.session.intentos++;

            // Devolver el número de conversiones realizadas y el formato de destino
            return { conversionesRealizadas: req.session.intentos, formatoDestino };
        } else {
            // Si el usuario ha realizado tres conversiones y no está autenticado, redirigir al usuario al inicio de sesión
            return res.redirect('/login');
        }
    } catch (error) {
        console.error('Error al convertir la imagen:', error);
        res.status(500).send('Error interno del servidor');
    }
};
