# How to use openSSL to create Self-Signed certificate for HTTPS
  - in windows if we have git installed in our machine, we already have openSSL
  - in Linux and Mac we can use openSSL by installing git or from `openssl.org` website

  - run `openssl req -x509 -newkey rsa:4096 -nodes -keyout key.pem -out cert.pem -days 365`