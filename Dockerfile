FROM mcr.microsoft.com/playwright:v1.62.1-noble

WORKDIR /app

# Install the exact dependency versions from package-lock.json first so this
# layer remains cached when only test files change.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Enables the CI retry/worker settings from playwright.config.ts.
ENV CI=true \
    HOST=0.0.0.0 \
    PORT=10000

EXPOSE 10000

# The Playwright image already contains Chromium, Firefox, WebKit, and their
# Ubuntu system dependencies, so no apt-get or browser install step is needed.
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('node:http').get({host:'127.0.0.1',port:process.env.PORT||10000,path:'/'},response=>process.exit(response.statusCode===200?0:1)).on('error',()=>process.exit(1))"

# ENTRYPOINT ensures Render starts the port-binding test server even if an old
# Docker command is still configured in the service settings.
ENTRYPOINT ["node", "render-test-runner.js"]
