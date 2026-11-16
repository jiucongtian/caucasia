FROM node:22-alpine
ARG TARGET_SHA=unknown
LABEL org.opencontainers.image.revision=$TARGET_SHA
WORKDIR /app
COPY --chown=node:node index.html server.mjs package.json ./
COPY --chown=node:node src ./src
COPY --chown=node:node admin ./admin
COPY --chown=node:node backend ./backend
COPY --chown=node:node public ./public
ENV HOST=0.0.0.0 PORT=5188 STARLINK_DATA_DIR=/data NODE_ENV=production COOKIE_SECURE=1
USER node
EXPOSE 5188
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD node -e "fetch('http://127.0.0.1:5188/api/vehicles').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.mjs"]
