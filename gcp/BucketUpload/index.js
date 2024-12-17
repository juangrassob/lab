const { Storage } = require('@google-cloud/storage');

// Ruta al archivo JSON de la clave
const keyFilename = './key.json';

// Inicializar cliente de Google Cloud Storage
const storage = new Storage({ keyFilename });

// Uso del cliente
const bucketName = 'bucket-name';
const filePath = './CoinClatter.mp3';
const destination = 'archivo-en-bucket.mp3';

async function uploadFile() {
    await storage.bucket(bucketName).upload(filePath, {
        destination,
    });
    console.log(`${filePath} subido a ${bucketName}`);
}

uploadFile().catch(console.error);

