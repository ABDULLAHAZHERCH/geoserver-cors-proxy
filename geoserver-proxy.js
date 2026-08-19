const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const GEOSERVER_WFS_URL = process.env.GEOSERVER_WFS_URL || 'http://localhost:8080/geoserver/emergency_ws/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=emergency_ws:emergency_locations&outputFormat=application/json';

// Enable CORS for all routes
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'GeoServer Proxy', timestamp: new Date() });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'gis.html'));
});

// Proxy endpoint for GeoServer WFS GeoJSON
app.get('/proxy-wfs', async (req, res) => {
  try {
    console.log('📡 Fetching from GeoServer:', GEOSERVER_WFS_URL);
    const response = await fetch(GEOSERVER_WFS_URL);
    
    if (!response.ok) {
      console.error('❌ GeoServer returned:', response.status, response.statusText);
      return res.status(response.status).json({ error: `GeoServer error: ${response.statusText}` });
    }

    const data = await response.json();
    console.log(`✅ Fetched ${data.features?.length || 0} features from GeoServer`);
    res.json(data);
  } catch (err) {
    console.error('❌ Proxy error:', err.message);
    res.status(500).json({ error: 'Failed to fetch from GeoServer', details: err.message });
  }
});

// Alternative: support custom GeoServer URLs via query parameter
app.get('/proxy-wfs-custom', async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: 'URL parameter required' });
  }

  try {
    console.log('📡 Fetching from custom URL:', url);
    const response = await fetch(url);

    if (!response.ok) {
      return res.status(response.status).json({ error: `GeoServer error: ${response.statusText}` });
    }

    const data = await response.json();
    console.log(`✅ Fetched ${data.features?.length || 0} features`);
    res.json(data);
  } catch (err) {
    console.error('❌ Proxy error:', err.message);
    res.status(500).json({ error: 'Failed to fetch', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 GeoServer CORS Proxy started`);
  console.log(`📍 Health: http://localhost:${PORT}/health`);
  console.log(`🔄 WFS Proxy: http://localhost:${PORT}/proxy-wfs`);
  console.log(`🔄 Custom URL: http://localhost:${PORT}/proxy-wfs-custom?url=YOUR_URL\n`);
});
