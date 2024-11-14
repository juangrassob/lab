const express = require('express');
const axios = require('axios');
const app = express();

// Variables de configuración para Sonos (Reemplaza estos valores con tus credenciales)
const clientId = 'b9ee86ec-a5e0-4693-8f2f-519259fe1956';
const clientSecret = 'bcfdbe54-5791-42f8-a1ce-1951c178f8ca';
const redirectUri = 'https://05e5-186-107-1-31.ngrok-free.app/auth/callback'; // Debe coincidir con la URL configurada en Sonos

// Middleware para parsear JSON
app.use(express.json());

// Función para codificar en Base64 las credenciales
const encodeCredentials = (clientId, clientSecret) => {
  return Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
};

// Endpoint para redirigir a la autenticación de Sonos
app.get('/auth/login', (req, res) => {
  const state = 'someRandomState'; // Esto puede ser dinámico para asegurar el flujo
  const scope = 'playback-control-all';
  
  const authUrl = `https://api.sonos.com/login/v3/oauth?client_id=${clientId}&response_type=code&state=${state}&scope=${scope}&redirect_uri=${encodeURIComponent(redirectUri)}`;
  
  // Redirigir al usuario a la página de autenticación de Sonos
  res.redirect(authUrl);
});

// Endpoint para recibir el callback con el código de autorización
app.get('/auth/callback', async (req, res) => {
  const { code, state } = req.query;

  if (!code) {
    return res.status(400).send('Error: no se recibió el código de autorización.');
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

    // Enviar la respuesta o hacer algo con el token de acceso
    res.json({
      message: 'Autenticación exitosa',
      access_token: accessToken
    });
  } catch (error) {
    console.error('Error al intercambiar el código por un token:', error.response?.data || error.message);
    res.status(500).send('Error al obtener el token de acceso.');
  }
});

// Inicio del servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

