import { NextApiRequest, NextApiResponse } from 'next';

/**
 * CORS Proxy for Kibrisquiz.com API
 */
export default async function handler(req, res) {
  // Get the target endpoint from query
  const { endpoint } = req.query;
  
  if (!endpoint) {
    return res.status(400).json({ error: 'API endpoint not specified' });
  }

  const targetUrl = `https://kibrisquiz.com/api/${endpoint}`;
  
  try {
    const fetchOptions = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    // Include body for POST, PUT, PATCH requests
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      fetchOptions.body = JSON.stringify(req.body);
    }
    
    // Make the request to the external API
    const response = await fetch(targetUrl, fetchOptions);
    
    // Get the response data
    let data;
    try {
      data = await response.json();
    } catch (e) {
      data = { error: 'Invalid JSON response from API' };
    }
    
    // Copy status code from the API response
    res.status(response.status);
    
    // Forward Set-Cookie headers if present
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      res.setHeader('Set-Cookie', setCookieHeader);
    }
    
    // Return the API response
    return res.json(data);
    
  } catch (error) {
    console.error(`CORS Proxy error for ${targetUrl}:`, error);
    return res.status(500).json({ 
      error: 'Proxy error', 
      message: error.message,
      endpoint: endpoint
    });
  }
}
