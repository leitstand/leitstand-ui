In this document we cover the setup and the usage of the remote renderer for web components. This is a custom
loader specifically created to support rendering components outside of the leitstand monolithic application.

# Getting started

```bash
docker run -it --rm -p 0.0.0.0:8080:8080 rcosnita/polymer-hello-world-docker:latest
cd contrib
npm install -d
npx http-server
open http://localhost:8081
```

## Running unit tests

```
npx jasmine --config=spec/support/jasmine.json
```