const fs = require('fs');
const express = require('express');
const path = require('path');
const Redis = require('ioredis');

const app = express();
const port = 3000;

const client = new Redis();
const redisClient = new Redis({
    host: 'localhost', // Host local
    port: 6379,        // Puerto expuesto en el docker-compose
});

redisClient.on('connect', () => {
    console.log('Conectado a Redis');
});

redisClient.on('error', (err) => {
    console.error('Error al conectar a Redis:', err);
});

const readImagesAndStoreInRedisSync = (directory) => {
    try {
        const files = fs.readdirSync(directory); // Leer los nombres de los archivos de manera sincrónica

        for (const file of files) {
            const filePath = path.join(directory, file);
            const imageBuffer = fs.readFileSync(filePath); // Leer el archivo en binario

            // Guardar directamente el buffer en el set
            client.sadd('images', imageBuffer, (err) => {
                if (err) {
                    console.error(`Error guardando la imagen ${file} en Redis:`, err);
                } else {
                    console.log(`Imagen ${file} guardada en el set "images" de Redis`);
                }
            });
        }
        console.log('Todas las imágenes han sido guardadas en el set "images" de Redis');
    } catch (err) {
        console.error('Error leyendo o almacenando imágenes:', err);
    }
};


readImagesAndStoreInRedisSync('./images/');
app.get('/random-image', async (req, res) => {
    try {
        // Obtener una imagen aleatoria del set 'images' en Redis
        const randomImageBuffer = await client.srandmemberBuffer('images');

        if (!randomImageBuffer) {
            return res.status(404).send('No se encontraron imágenes.');
        }

        // Asegurarse de que estamos obteniendo un buffer binario
        if (!Buffer.isBuffer(randomImageBuffer)) {
            return res.status(500).send('Error: El dato recuperado no es un buffer binario.');
        }

        // Guardar la imagen en el sistema de archivos
        const imagePath = path.join(__dirname, 'downloaded_images', 'random_image.jpg');

        // Crear la carpeta si no existe
        if (!fs.existsSync(path.dirname(imagePath))) {
            fs.mkdirSync(path.dirname(imagePath), { recursive: true });
        }

        // Escribir el buffer de la imagen en un archivo en el sistema de archivos
        fs.writeFileSync(imagePath, randomImageBuffer);
        console.log(`Imagen guardada en el sistema de archivos en: ${imagePath}`);

        // Establecer el tipo de contenido como 'image/jpeg' para las imágenes JPG
        res.set('Content-Type', 'image/jpeg');

        // Enviar la imagen como respuesta
        res.send(randomImageBuffer);
    } catch (err) {
        console.error('Error al obtener imagen:', err);
        res.status(500).send('Error al obtener imagen.');
    }
});

// Iniciar el servidor Express
app.listen(port, () => {
    console.log(`Servidor Express corriendo en http://localhost:${port}`);
});
