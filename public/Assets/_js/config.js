let API_BASE_URL = '';

if (window.location.hostname === 'localhost') {
  API_BASE_URL = 'http://localhost:3000';
} else if (window.location.hostname.includes('octagames-new-production.up.railway.app')) {
  API_BASE_URL = 'https://octagames-new-production.up.railway.app';
} else if (window.location.hostname.includes('octagames.onrender.com')) {
  API_BASE_URL = 'https://octagames.onrender.com';
} 
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
if (!isMobile) {
    window.location.href = "/not_allowed.html";
} 