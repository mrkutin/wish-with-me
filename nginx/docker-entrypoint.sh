#!/bin/bash

# Create initial DH params
if [ ! -f /etc/nginx/ssl/dhparam.pem ]; then
    mkdir -p /etc/nginx/ssl
    openssl dhparam -out /etc/nginx/ssl/dhparam.pem 2048
fi

# Use HTTP-only config initially
cp /etc/nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf.ssl
cp /etc/nginx/conf.d/default.conf.template /etc/nginx/conf.d/default.conf

# Start nginx with HTTP-only config
nginx -g 'daemon off;' &
NGINX_PID=$!

# Wait for nginx to start
sleep 5

# Get the certificates
certbot certonly --nginx \
    --non-interactive \
    --agree-tos \
    --email serge.kutin@gmail.com \
    -d wishwith.me \
    -d api.wishwith.me

# Switch to SSL config after certificates are obtained
cp /etc/nginx/conf.d/default.conf.ssl /etc/nginx/conf.d/default.conf
nginx -s reload

# Set up auto-renewal
(
    while :; do
        certbot renew --nginx
        sleep 12h
    done
) &

# Follow nginx logs
exec tail -f /var/log/nginx/access.log /var/log/nginx/error.log 