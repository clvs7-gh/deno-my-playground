FROM frolvlad/alpine-glibc:latest

ENV DENO_INSTALL /usr/local

RUN set -ex && \
    mkdir /app && \
    apk add --no-cache unzip curl && \
    curl -fsSL https://deno.land/x/install/install.sh | sh && \
    { \
      echo '#!/bin/sh'; \
      echo '/usr/local/bin/deno run --unstable --allow-read=/app $@'; \
    } > /usr/local/bin/launch && \
    chmod +x /usr/local/bin/launch

WORKDIR /app

CMD ["/app/launch"]
