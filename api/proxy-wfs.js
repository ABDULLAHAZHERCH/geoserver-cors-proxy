const fetch = require('node-fetch');

module.exports = async (req, res) => {
  const geoserverUrl = process.env.GEOSERVER_WFS_URL || 'http://localhost:8080/geoserver/emergency_ws/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=emergency_ws:emergency_locations&outputFormat=application/json';

  try {
    const response = await fetch(geoserverUrl);

    if (!response.ok) {
      return res.status(response.status).json({ error: `GeoServer error: ${response.statusText}` });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch from GeoServer', details: error.message });
  }
};