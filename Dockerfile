FROM node:20.17.0-bookworm-slim

RUN apt-get update && apt-get install -y \
  build-essential \
  gcc \
  autoconf \
  automake \
  zlib1g-dev \
  libpng-dev \
  nasm \
  bash \
  libvips-dev \
  git \
  --no-install-recommends && \
  rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /opt/app

RUN --mount=type=bind,source=package.json,target=package.json \
  --mount=type=bind,source=yarn.lock,target=yarn.lock \
  --mount=type=cache,target=/usr/local/share/.cache/yarn/v6 \
  yarn install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Expose the port Strapi will run on
EXPOSE 1337

# Run the Strapi application
CMD ["yarn", "start"]
