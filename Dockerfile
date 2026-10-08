ARG NGINX_IMAGE=nginx:stable-alpine
FROM ${NGINX_IMAGE}
ARG TARGET_SHA
LABEL org.opencontainers.image.title="Caucasus procurement demo" \
      org.opencontainers.image.revision="${TARGET_SHA}"
COPY deploy/container-nginx.conf /etc/nginx/nginx.conf
COPY index.html /usr/share/nginx/html/index.html
COPY src/ /usr/share/nginx/html/src/
COPY assets/ /usr/share/nginx/html/assets/
RUN test -n "$TARGET_SHA" && printf '%s\n' "$TARGET_SHA" > /usr/share/nginx/html/release.txt
USER nginx
EXPOSE 8080
HEALTHCHECK --interval=15s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O - http://127.0.0.1:8080/healthz >/dev/null || exit 1
ENTRYPOINT ["nginx", "-g", "daemon off;"]
