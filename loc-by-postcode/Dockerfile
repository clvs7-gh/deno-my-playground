FROM frolvlad/alpine-glibc:latest

ENV DENO_INSTALL /usr/local
ENV DENO_DIR /tmp/.cache

RUN set -ex && \
    apk add --no-cache unzip curl && \
    curl -fsSL https://deno.land/x/install/install.sh | sh && \
    { \
      echo '#!/bin/sh'; \
      echo '/usr/local/bin/deno run --unstable --allow-read=/app --allow-net=www.post.japanpost.jp --allow-env=LBP_* $@'; \
    } > /usr/local/bin/launch && \
    chmod +x /usr/local/bin/launch

COPY ./app /app
WORKDIR /app

RUN set -ex && \
    /usr/local/bin/deno cache --unstable index.ts

CMD ["launch", "index.ts"]