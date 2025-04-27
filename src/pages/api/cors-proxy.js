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
    // Prepare headers from the incoming request
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // Forward authorization header if present
    if (req.headers.authorization) {
      headers['Authorization'] = req.headers.authorization;
    }
    
    // Forward cookies if present
    if (req.headers.cookie) {
      headers['Cookie'] = req.headers.cookie;
    }
    
    const fetchOptions = {
      method: req.method,
      headers,
      credentials: 'include',
    };
    
    // Include body for POST, PUT, PATCH requests
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
      fetchOptions.body = JSON.stringify(req.body);
    }
    
    // Log request details for debugging
    console.log(`[CORS Proxy] ${req.method} ${targetUrl}`);
    
    // Make the request to the external API
    const response = await fetch(targetUrl, fetchOptions);
    
    // Get response data
    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch (e) {
        console.error('[CORS Proxy] JSON parse error:', e);
        data = { error: 'Invalid JSON response from API' };
      }
    } else {
      // Handle non-JSON responses
      const text = await response.text();
      console.error('[CORS Proxy] Non-JSON response:', text.substring(0, 100));
      data = { error: 'Non-JSON response from API' };
    }
    
    // Copy status code from the API response
    res.status(response.status);
    
    // Forward all headers that we want to expose
    for (const [key, value] of Object.entries(response.headers.raw())) {
      if (['set-cookie', 'authorization'].includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    }
    
    // Return the API response
    return res.json(data);
    
  } catch (error) {
    console.error(`[CORS Proxy] Error: ${error.message}`);
    return res.status(500).json({ 
      error: 'Proxy error', 
      message: error.message,
      endpoint: endpoint
    });
  }
}
