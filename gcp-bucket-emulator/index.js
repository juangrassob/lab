const express = require("express");
const multer = require("multer");
const { Storage } = require("@google-cloud/storage");
const fs = require("fs");
const path = require("path");

const app = express();
const upload = multer({ dest: "uploads/" });
const PORT = 3000;

// Configuración para el emulador oficial
const storage = new Storage({
  projectId: "test-project",
  apiEndpoint: "http://localhost:4443", // Puerto del fake-gcs-server
  // No necesitas credentials cuando usas el emulador
});

const BUCKET_NAME = "testing";
const bucket = storage.bucket(BUCKET_NAME);

// Inicialización del bucket
async function initializeBucket() {
  try {
    const [exists] = await bucket.exists();
    if (!exists) {
      console.log("Creating bucket...");
      await bucket.create();
      console.log(`Bucket ${BUCKET_NAME} created.`);
    } else {
      console.log(`Bucket ${BUCKET_NAME} already exists.`);
    }

    // Listar archivos existentes
    const [files] = await bucket.getFiles();
    console.log(
      "Files in bucket:",
      files.map((f) => f.name),
    );
  } catch (error) {
    console.error("Error initializing bucket:", error);
  }
}

// Inicializar al arrancar
initializeBucket();

// 🧾 HTML Form
app.get("/", (req, res) => {
  res.send(`
    <h2>Subir archivo al Bucket (Emulador Oficial GCS)</h2>
    <form action="/upload" method="post" enctype="multipart/form-data">
      <input type="file" name="file" required />
      <button type="submit">Subir</button>
    </form>
    <br><br>
    <a href="/list">Ver archivos en el bucket</a>
  `);
});

// 📋 Listar archivos
app.get("/list", async (req, res) => {
  try {
    const [files] = await bucket.getFiles();
    const fileList = files
      .map(
        (file) =>
          `<li><a href="/download/${file.name}">${file.name}</a> (${file.metadata.size} bytes)</li>`,
      )
      .join("");

    res.send(`
      <h2>Archivos en el bucket</h2>
      <ul>${fileList}</ul>
      <br><a href="/">Volver</a>
    `);
  } catch (error) {
    res.status(500).send("Error listing files: " + error.message);
  }
});

// 📤 Subida de archivos
app.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).send("No file uploaded.");

  try {
    const blob = bucket.file(req.file.originalname);
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: req.file.mimetype,
      },
    });

    const readStream = fs.createReadStream(req.file.path);

    readStream.pipe(blobStream);

    blobStream.on("error", (err) => {
      console.error("Upload error:", err);
      fs.unlinkSync(req.file.path); // Limpiar archivo temporal
      res.status(500).send("Upload error: " + err.message);
    });

    blobStream.on("finish", async () => {
      fs.unlinkSync(req.file.path); // Eliminar archivo temporal

      // Obtener metadata del archivo subido
      const [metadata] = await blob.getMetadata();

      res.send(`
        <p>✅ Archivo subido exitosamente:</p>
        <ul>
          <li><strong>Nombre:</strong> ${req.file.originalname}</li>
          <li><strong>Tamaño:</strong> ${metadata.size} bytes</li>
          <li><strong>Tipo:</strong> ${metadata.contentType}</li>
        </ul>
        <a href="/">Subir otro archivo</a><br />
        <a href="/download/${req.file.originalname}">Descargar archivo</a><br />
        <a href="/list">Ver todos los archivos</a>
      `);
    });
  } catch (error) {
    fs.unlinkSync(req.file.path);
    res.status(500).send("Error: " + error.message);
  }
});

// 📥 Descarga de archivos
app.get("/download/:filename", async (req, res) => {
  try {
    const filename = req.params.filename;
    const file = bucket.file(filename);

    const [exists] = await file.exists();
    if (!exists) {
      return res.status(404).send("File not found");
    }

    const [metadata] = await file.getMetadata();

    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader(
      "Content-Type",
      metadata.contentType || "application/octet-stream",
    );
    res.setHeader("Content-Length", metadata.size);

    file.createReadStream().pipe(res);
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).send("Download error: " + error.message);
  }
});

// 🗑️ Eliminar archivo
app.delete("/delete/:filename", async (req, res) => {
  try {
    const filename = req.params.filename;
    const file = bucket.file(filename);

    await file.delete();
    res.json({ message: `File ${filename} deleted successfully` });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: error.message });
  }
});

// 🟢 Inicia servidor
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`GCS Emulator should be running at http://localhost:4443`);
});
