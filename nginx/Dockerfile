FROM nginx:alpine

# Install certbot and dependencies
RUN apk add --no-cache certbot certbot-nginx bash openssl

# Copy nginx configuration
COPY conf.d /etc/nginx/conf.d/

# Copy the entrypoint script
COPY docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"] 