import { NextApiRequest, NextApiResponse } from 'next';

/**
 * CORS Proxy for Kibrisquiz.com API - Improved implementation
 * This handles API requests and forwards them to the target API
 */
export default async function handler(req, res) {
  // Get the target endpoint from query
  const { endpoint } = req.query;

  if (!endpoint) {
    console.error('No endpoint specified in CORS proxy request');
    return res.status(400).json({ success: false, message: 'API endpoint not specified' });
  }

  // Build the full target URL
  const targetUrl = `https://kibrisquiz.com/api/${endpoint.replace(/^\//, '')}`;

  try {
    console.log(`[CORS Proxy] Forwarding ${req.method} request to: ${targetUrl}`);

    // Prepare headers for the outgoing request
    const headers = {
      'Content-Type': 'application/json',
    };

    // Copy any authorization header
    if (req.headers.authorization) {
      headers['Authorization'] = req.headers.authorization;
    }

    // Forward cookies if present
    if (req.headers.cookie) {
      headers['Cookie'] = req.headers.cookie;
    }

    // Prepare the fetch options
    const fetchOptions = {
      method: req.method,
      headers,
    };

    // For POST/PUT/PATCH requests, add the body
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      if (req.body) {
        // Log request body for debugging (sanitize sensitive info in production)
        const debugBody = { ...req.body };
        if (debugBody.password) debugBody.password = '***';
        console.log(`[CORS Proxy] Request body:`, debugBody);
        
        fetchOptions.body = JSON.stringify(req.body);
      }
    }
    
    // Make the request to the target API
    const response = await fetch(targetUrl, fetchOptions);
    console.log(`[CORS Proxy] Received response with status: ${response.status}`);
    
    // Create a basic response with the same status code
    res.status(response.status);
    
    // Parse the response body
    let responseBody;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      try {
        responseBody = await response.json();
        console.log('[CORS Proxy] Response parsed as JSON:', responseBody);
      } catch (error) {
        console.error('[CORS Proxy] Error parsing JSON response:', error);
        responseBody = { 
          success: false, 
          message: 'Error parsing API response',
          error: error.message
        };
      }
    } else {
      const text = await response.text();
      console.error(`[CORS Proxy] Received non-JSON response: ${text.substring(0, 100)}...`);
      responseBody = { 
        success: false, 
        message: 'API returned non-JSON response',
        responseText: text.substring(0, 200)
      };
    }
    
    // Forward all important headers from the response
    const headersToForward = [
      'set-cookie',
      'authorization',
      'www-authenticate',
      'cache-control',
      'content-type'
    ];
    
    for (const headerName of headersToForward) {
      const headerValue = response.headers.get(headerName);
      if (headerValue) {
        res.setHeader(headerName, headerValue);
      }
    }
    
    // Handle Set-Cookie specifically for auth purposes
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      console.log('[CORS Proxy] Forwarding Set-Cookie header');
      res.setHeader('Set-Cookie', setCookieHeader);
    }
    
    // Return the response body
    return res.json(responseBody);
    
  } catch (error) {
    console.error(`[CORS Proxy] Error forwarding request to ${targetUrl}:`, error);
    
    return res.status(500).json({
      success: false,
      message: 'Giriş başarısız',
      proxyError: 'API isteği sırasında bir hata oluştu',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
