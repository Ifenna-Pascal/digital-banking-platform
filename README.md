# Online Banking

A banking app where users open accounts, deposit, withdraw and transfer money, with a dashboard showing their activity.

| Folder | What it is | Stack |
| --- | --- | --- |
| [`apps/api`](apps/api) | REST API with Jest tests | Node.js, Express, MongoDB, JWT |
| [`apps/web`](apps/web) | Banking dashboard | React, TypeScript, Tailwind CSS, Chart.js |

## Run it locally

You need Node 18+ and MongoDB (or Docker).

```bash
# 1. API
cd apps/api
cp .env.example .env       # fill in the values
npm install
npm start                  # http://localhost:4000
npm test                   # runs against an in-memory MongoDB

# 2. Web app (new terminal)
cd apps/web
npm install
NODE_OPTIONS=--openssl-legacy-provider npm start   # http://localhost:3000
```

The `NODE_OPTIONS` flag is needed because the web app uses an older Create React App on newer Node versions.

This repo combines the former `banking-api` and `banking-web` repos, with their full commit history.
