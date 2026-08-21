(function () {
  const host = location.hostname;
  let apiBase = '';
  if (host === 'localhost' || host === '127.0.0.1') {
    apiBase = 'http://localhost:8787';
  } else if (host.includes('github.io')) {
    apiBase = 'https://shieldau.onrender.com';
  }
  window.SHIELDAU_AGORA = { apiBase };
})();