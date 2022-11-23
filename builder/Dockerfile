FROM node:14-alpine

RUN apk update && apk upgrade && \
    apk add --no-cache \
      python3 \
      make \
      g++ \
      git

ENTRYPOINT ["npm"]
