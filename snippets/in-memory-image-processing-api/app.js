const redis = require('redis');
const express = require('express');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const app = express();
const PORT = 3000;

// Configuración del cliente Redis
const client = redis.createClient({
    host: 'localhost',
    port: 6379,
});

// Manejo de errores
client.on('error', (err) => {
    console.error('Error conectando a Redis', err);
});

const isValidImage = (buffer) => {
    try {
        sharp(buffer).metadata(); // Intentar obtener metadatos
        return true;
    } catch (err) {
        return false;
    }
};

// Función sincrónica para leer imágenes y almacenarlas en Redis
const readImagesAndStoreInRedisSync = (directory) => {
    try {
        const files = fs.readdirSync(directory); // Leer los nombres de los archivos de manera sincrónica

        for (const file of files) {
            const filePath = path.join(directory, file);
            const imageBuffer = fs.readFileSync(filePath); // Leer el archivo de manera sincrónica

            const fileName = path.basename(file);
            const imageBase64 = imageBuffer.toString('base64'); // Convertir a base64

            client.set(fileName, imageBase64, (err) => {
                if (err) {
                    console.error(`Error guardando la imagen ${fileName} en Redis:`, err);
                } else {
                    console.log(`Imagen ${fileName} guardada en Redis`);
                }
            });
        }
        console.log('Todas las imágenes han sido guardadas en Redis');
    } catch (err) {
        console.error('Error leyendo o almacenando imágenes:', err);
    }
};

// Iniciar la aplicación después de que las imágenes estén en Redis
const startApp = () => {
    // Ruta para servir una imagen al azar
    app.get('/random-image', async (req, res) => {
        try {
            const keys = await client.keys('*'); // Obtener todas las claves de Redis
            if (keys.length === 0) {
                return res.status(404).send('No hay imágenes almacenadas en Redis');
            }

            const randomKey = keys[Math.floor(Math.random() * keys.length)];
            const imageBase64 = await client.get(randomKey);

            if (!imageBase64) {
                return res.status(404).send('Imagen no encontrada en Redis');
            }

            const imageBuffer = Buffer.from(imageBase64, 'base64');
            res.set('Content-Type', 'image/jpeg');
            res.send(imageBuffer);
        } catch (err) {
            console.error('Error obteniendo la imagen:', err);
            res.status(500).send('Error al obtener la imagen');
        }
    });

    app.get('/image', async (req, res) => {
        try {
            // Crear una imagen de 300x300 con fondo rojo
            const grid = sharp({
                create: {
                    width: 300, // Ancho de la imagen
                    height: 300, // Altura de la imagen
                    channels: 3, // Canales RGB (rojo, verde, azul)
                    background: { r: 255, g: 0, b: 0 }, // Color de fondo (rojo en este caso)
                },
            });

            // Convertir la imagen a un buffer
            const buffer = await grid.png().toBuffer();

            res.set('Content-Type', 'image/png');

            res.send(buffer);
        } catch (err) {
            console.error('Error generando la imagen:', err);
            res.status(500).send('Error al generar la imagen');
        }
    });

    app.get('/image/:id', async (req, res) => {
        try {
            const { id } = req.params; // Obtener el ID de la imagen desde la URL
            const imagePath = path.join(__dirname, 'images', `${id}.jpg`); // Construir la ruta completa de la imagen

            // Verificar si la imagen existe en el sistema de archivos
            if (!fs.existsSync(imagePath)) {
                return res.status(404).send('Imagen no encontrada');
            }

            // Leer la imagen, procesarla con sharp (ejemplo redimensionado) y enviarla al cliente
            const imageBuffer = await sharp(imagePath)
                .resize(300, 300) // Redimensionar a 300x300
                .jpeg() // Convertir a JPEG (puedes cambiar esto a otro formato si prefieres)
                .toBuffer(); // Obtener el buffer de la imagen procesada

            // Configurar el tipo de contenido para la imagen y enviarla al cliente
            res.set('Content-Type', 'image/jpeg');
            res.send(imageBuffer);
        } catch (err) {
            console.error('Error procesando la imagen:', err);
            res.status(500).send('Error al procesar la imagen');
        }
    });

    app.get('/image-grid', async (req, res) => {
        try {
            const keys = await client.keys('*');
            if (keys.length < 9) {
                return res.status(404).send('No hay suficientes imágenes en Redis');
            }

            // Función para mezclar array usando Fisher-Yates shuffle
            const shuffle = (array) => {
                for (let i = array.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [array[i], array[j]] = [array[j], array[i]];
                }
                return array;
            };

            // Mezclar las claves antes de obtener las imágenes
            const shuffledKeys = shuffle([...keys]).slice(0, 9);

            const images = [];
            for (let i = 0; i < 9; i++) {
                const imageBase64 = await client.get(shuffledKeys[i]);
                const imageBuffer = Buffer.from(imageBase64, 'base64');

                try {
                    const processedImage = await sharp(imageBuffer)
                        .resize(100, 100, { fit: 'cover' })
                        .jpeg()
                        .toBuffer();

                    images.push(processedImage);
                } catch (err) {
                    console.error(`Error procesando imagen ${i}:`, err);
                    const blankImage = await sharp({
                        create: {
                            width: 100,
                            height: 100,
                            channels: 3,
                            background: { r: 255, g: 255, b: 255 },
                        },
                    })
                        .jpeg()
                        .toBuffer();
                    images.push(blankImage);
                }
            }

            const grid = sharp({
                create: {
                    width: 300,
                    height: 300,
                    channels: 3,
                    background: { r: 255, g: 255, b: 255 },
                },
            });

            console.log('Creando grilla con imágenes aleatorias');

            const finalImageBuffer = await grid
                .composite([
                    { input: images[0], top: 0, left: 0 },
                    { input: images[1], top: 0, left: 100 },
                    { input: images[2], top: 0, left: 200 },
                    { input: images[3], top: 100, left: 0 },
                    { input: images[4], top: 100, left: 100 },
                    { input: images[5], top: 100, left: 200 },
                    { input: images[6], top: 200, left: 0 },
                    { input: images[7], top: 200, left: 100 },
                    { input: images[8], top: 200, left: 200 },
                ])
                .jpeg()
                .toBuffer();

            res.set('Content-Type', 'image/jpeg');
            res.send(finalImageBuffer);
        } catch (err) {
            console.error('Error generando la grilla de imágenes:', err);
            res.status(500).send('Error al generar la grilla');
        }
    });

    app.get('/image-fs-grid', async (req, res) => {
        try {
            // Directorio donde se encuentran las imágenes
            const imagesDirectory = path.join(__dirname, 'images');

            // Leer los archivos del directorio
            const files = fs.readdirSync(imagesDirectory);

            // Asegurarse de que hay al menos 9 imágenes en el directorio
            if (files.length < 9) {
                return res
                    .status(404)
                    .send('No hay suficientes imágenes en el directorio');
            }

            const images = [];
            // Leer las primeras 9 imágenes
            for (let i = 0; i < 9; i++) {
                const filePath = path.join(imagesDirectory, files[i]);
                const imageBuffer = fs.readFileSync(filePath); // Leer la imagen como buffer

                // Verificar si el buffer es una imagen válida
                if (isValidImage(imageBuffer)) {
                    images.push(imageBuffer);
                } else {
                    console.error(`Imagen ${i} no es válida.`);
                }
            }

            // Crear la imagen de fondo de la grilla (blanca)
            const grid = sharp({
                create: {
                    width: 300, // Ancho de la imagen
                    height: 300, // Altura de la imagen
                    channels: 3, // Canales RGB (rojo, verde, azul)
                    background: { r: 255, g: 255, b: 255 }, // Blanco
                },
            });

            console.log('Creando grilla');

            // Crear la grilla con las imágenes
            const finalImageBuffer = await grid
                .composite([
                    { input: images[0], top: 0, left: 0 },
                    { input: images[1], top: 0, left: 100 },
                    { input: images[2], top: 0, left: 200 },
                    { input: images[3], top: 100, left: 0 },
                    { input: images[4], top: 100, left: 100 },
                    { input: images[5], top: 100, left: 200 },
                    { input: images[6], top: 200, left: 0 },
                    { input: images[7], top: 200, left: 100 },
                    { input: images[8], top: 200, left: 200 },
                ])
                .jpeg() // Convertir la imagen final a formato JPEG
                .toBuffer(); // Generar la grilla como buffer

            // Enviar la imagen final como respuesta
            res.set('Content-Type', 'image/jpeg');
            res.send(finalImageBuffer);
        } catch (err) {
            console.error('Error generando la grilla de imágenes:', err);
            res.status(500).send('Error al generar la grilla');
        }
    });

    app.listen(PORT, () => {
        console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
};

// Conexión a Redis y carga de imágenes
client.connect().then(async () => {
    console.log('Conectado a Redis');

    try {
        // Limpiar todas las claves en Redis
        await client.flushAll();
        console.log('Base de datos Redis limpiada');

        const imagesDirectory = path.join(__dirname, 'images');

        // Leer y guardar imágenes de manera sincrónica
        readImagesAndStoreInRedisSync(imagesDirectory);

        // Iniciar la app de Express después de que las imágenes se carguen en Redis
        startApp();
    } catch (err) {
        console.error('Error al limpiar Redis:', err);
        process.exit(1); // Salir si hay un error crítico
    }
});
