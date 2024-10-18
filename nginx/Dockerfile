FROM nginx:1.21.1-alpine

RUN apk update && apk add bash shadow certbot openssl

RUN rm -rf /etc/nginx/conf.d/*
COPY ./conf /etc/nginx/conf.d
COPY ./nginx.conf /etc/nginx/nginx.conf