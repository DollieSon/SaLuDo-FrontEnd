# Security headers for the SPA (rendered from a template: ${API_ORIGIN} and
# ${API_WS_ORIGIN} come from the container environment).
# - script-src 'self': no inline or third-party scripts, which limits what an XSS can load
# - style-src 'unsafe-inline': React style={{...}} attributes and chart libraries need it
# - api.qrserver.com: QR codes for job application links
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://api.qrserver.com; font-src 'self' data:; media-src 'self' blob:; connect-src 'self' ${API_ORIGIN} ${API_WS_ORIGIN} https://api.qrserver.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=()" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header Cross-Origin-Opener-Policy "same-origin" always;
