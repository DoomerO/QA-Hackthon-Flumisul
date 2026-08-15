FROM mcr.microsoft.com/playwright:v1.62.1-noble

WORKDIR /app

# Install the exact dependency versions from package-lock.json first so this
# layer remains cached when only test files change.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Enables the CI retry/worker settings from playwright.config.ts.
ENV CI=true

# The Playwright image already contains Chromium, Firefox, WebKit, and their
# Ubuntu system dependencies, so no apt-get or browser install step is needed.
CMD ["npm", "test", "--", "--reporter=line"]
