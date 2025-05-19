// Cloudflare Pages 미들웨어
export async function onRequest(context) {
  const { request, env, next } = context;
  
  // 다음 핸들러로 요청 전달
  const response = await next();
  
  // HTML 응답인 경우에만 처리
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('text/html')) {
    let html = await response.text();
    
    // ENV 객체를 클라이언트에 전달 (API 키만 포함)
    const envScript = `
      <script>
        window.ENV = ${JSON.stringify({
          REACT_APP_OPENAI_API_KEY: env.REACT_APP_OPENAI_API_KEY || '',
        })};
      </script>
    `;
    
    // </head> 태그 앞에 스크립트 삽입
    html = html.replace('</head>', `${envScript}</head>`);
    
    // 새 응답 반환
    return new Response(html, {
      headers: response.headers,
      status: response.status,
      statusText: response.statusText,
    });
  }
  
  return response;
} 