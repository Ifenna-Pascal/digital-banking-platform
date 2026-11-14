# Online Banking

A banking app where the bank opens accounts and customers deposit, withdraw and transfer money, with a dashboard showing their activity.

| Folder | What it is | Stack |
| --- | --- | --- |
| [`apps/api`](apps/api) | REST API with 66 integration tests | Node.js, Express, MongoDB, JWT |
| [`apps/web`](apps/web) | Customer and admin dashboard | React, TypeScript, Tailwind CSS, Chart.js |

## Run it locally

You need Node 18+ and MongoDB (local, Docker or Atlas).

```bash
# 1. API
cd apps/api
cp .env.example .env       # set MONGO_URL, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm install
npm run seed:admin         # creates the first admin
npm run dev                # http://localhost:4000
npm test                   # runs against an in-memory MongoDB, nothing to install

# 2. Web app (new terminal)
cd apps/web
cp .env.example .env       # REACT_APP_API_URL defaults to http://localhost:4000
npm install
npm start                  # http://localhost:3000
```

## Try it

1. Log in at `/login` as the admin from `.env`.
2. Under **Admin**, open an account. Copy the setup code it shows.
3. Log out, go to `/register`, and use that email and code to choose a password.
4. Log in as the customer, set a PIN under **Settings**, then deposit, withdraw and transfer.
5. As admin, you can disable accounts and reverse transfers.

See [`apps/api/README.md`](apps/api/README.md) for every endpoint and how money moves.

This repo combines the former `banking-api` and `banking-web` repos, with their full commit history.
