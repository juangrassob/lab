const express = require('express');
const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();
const app = express();

// Variables de configuración para Sonos (Reemplaza estos valores con tus credenciales)
const clientId = 'b9ee86ec-a5e0-4693-8f2f-519259fe1956';
const clientSecret = 'bcfdbe54-5791-42f8-a1ce-1951c178f8ca';
const redirectUri = 'https://05e5-186-107-1-31.ngrok-free.app/auth/callback'; // Debe coincidir con la URL configurada en Sonos

// Conectar y configurar la base de datos SQLite
const db = new sqlite3.Database('./tokens.db'); // Guarda la base de datos en un archivo llamado tokens.db

// Crear la tabla si no existe
db.serialize(() => {
    db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      usuario TEXT PRIMARY KEY,
      token TEXT
    )
  `);
});

// Middleware para parsear JSON
app.use(express.json());

// Función para codificar en Base64 las credenciales
const encodeCredentials = (clientId, clientSecret) => {
    return Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
};

// Endpoint para redirigir a la autenticación de Sonos
app.get('/auth/login', (req, res) => {
    const usuario = req.query.usuario; // El usuario se pasa como parámetro en la query

    if (!usuario) {
        return res.status(400).send('Error: Se requiere el parámetro usuario.');
    }

    const scope = 'playback-control-all';
    const state = encodeURIComponent(usuario); // El usuario se pasa como el state para identificarlo luego

    const authUrl = `https://api.sonos.com/login/v3/oauth?client_id=${clientId}&response_type=code&state=${state}&scope=${scope}&redirect_uri=${encodeURIComponent(redirectUri)}`;

    // Redirigir al usuario a la página de autenticación de Sonos
    res.redirect(authUrl);
});

// Endpoint para recibir el callback con el código de autorización
app.get('/auth/callback', async (req, res) => {
    const { code, state: usuario } = req.query;

    if (!code || !usuario) {
        return res.status(400).send('Error: no se recibió el código de autorización o el usuario.');
    }

    try {
        // Encabezado Authorization con las credenciales codificadas en Base64
        const authHeader = `Basic ${encodeCredentials(clientId, clientSecret)}`;

        // Intercambiar el código de autorización por un token de acceso
        const tokenResponse = await axios.post('https://api.sonos.com/login/v3/oauth/access', new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: redirectUri
        }).toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': authHeader // Agregar el encabezado de autorización
            }
        });

        const accessToken = tokenResponse.data.access_token;

        // Guardar el token en la base de datos para el usuario
        db.run(
            `INSERT OR REPLACE INTO usuarios (usuario, token) VALUES (?, ?)`,
            [usuario, accessToken],
            (err) => {
                if (err) {
                    console.error('Error al guardar el token en la base de datos:', err.message);
                    return res.status(500).send('Error al guardar el token.');
                }

                // Enviar la respuesta indicando éxito
                res.json({
                    message: 'Autenticación exitosa',
                    usuario: usuario,
                    access_token: accessToken
                });
            }
        );
    } catch (error) {
        console.error('Error al intercambiar el código por un token:', error.response?.data || error.message);
        res.status(500).send('Error al obtener el token de acceso.');
    }
});


// Endpoint para obtener todos los usuarios y sus tokens
app.get('/usuarios', (req, res) => {
    // Consultar todos los usuarios en la base de datos
    db.all('SELECT * FROM usuarios', (err, rows) => {
        if (err) {
            console.error('Error al consultar la base de datos:', err.message);
            return res.status(500).send('Error al consultar los usuarios.');
        }

        if (rows.length === 0) {
            return res.status(404).send('No se encontraron usuarios.');
        }

        // Enviar la lista de usuarios
        res.json({
            usuarios: rows
        });
    });
});


// Endpoint para obtener el token de un usuario
app.get('/usuarios/:usuario/token', (req, res) => {
    const { usuario } = req.params;

    // Consultar el token del usuario en la base de datos
    db.get('SELECT token FROM usuarios WHERE usuario = ?', [usuario], (err, row) => {
        if (err) {
            console.error('Error al consultar la base de datos:', err.message);
            return res.status(500).send('Error al consultar el token.');
        }

        if (!row) {
            return res.status(404).send('Usuario no encontrado.');
        }

        // Enviar el token del usuario
        res.json({
            usuario: usuario,
            token: row.token
        });
    });
});

// Inicio del servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

