// const API_BASE_URL = 'https://octagames-new-production.up.railway.app';
// const API_BASE_URL = 'http://localhost:3000';
const API_BASE_URL = 'https://octagames.onrender.com';

const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
if (!isMobile) {
    window.location.href = "/not_allowed.html";
}