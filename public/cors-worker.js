// CORS sorunlarını çözmek için servis işçisi

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Kibrisquiz.com'a giden istekleri müdahale et
  if (url.host === 'kibrisquiz.com') {
    event.respondWith(handleApiRequest(event.request));
  }
});

async function handleApiRequest(request) {
  // CORS header'lar ile isteği yeniden oluştur
  const modifiedRequest = new Request(request.url, {
    method: request.method,
    headers: request.headers,
    body: request.body,
    mode: 'cors',
    credentials: 'include'
  });

  try {
    // İsteği yap
    const response = await fetch(modifiedRequest);
    
    // CORS header'larını ekle
    const modifiedResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        ...Object.fromEntries([...response.headers.entries()]),
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
    
    return modifiedResponse;
  } catch (error) {
    console.error('API isteği başarısız:', error);
    return new Response(JSON.stringify({ error: 'CORS hatası' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}
