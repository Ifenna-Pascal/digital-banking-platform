# Banking API

REST API for the online banking app: admin-opened accounts, a 4-digit transaction PIN, deposits, withdrawals, transfers, reversals and account history.

**Stack:** Node.js 18+, Express 4, MongoDB (Mongoose 8), JWT, bcrypt, express-validator, Helmet, CORS, rate limiting. Tests: Jest + Supertest against an in-memory MongoDB.

## Run it

```bash
cp .env.example .env      # set JWT_SECRET to a long random string
npm install
npm run seed:admin        # creates the first admin from ADMIN_EMAIL / ADMIN_PASSWORD
npm run dev               # http://localhost:4000
npm test                  # 66 integration tests, no MongoDB install needed
```

## How a customer gets an account

1. An admin calls `POST /admin/create_user`. The response includes a one-time **setup code** (valid 7 days). It is also emailed if `SIB_API_KEY` is set.
2. The customer calls `POST /user/setup_password` with their email, the setup code and a password (8+ characters).
3. The customer logs in with `POST /user/signin` and sends the token as `Authorization: Bearer <token>`.
4. The customer sets a PIN with `POST /user/setpin`. Every money endpoint needs that PIN.

## Endpoints

| Method | Path | Who | What |
|---|---|---|---|
| GET | `/ping` | anyone | health check |
| POST | `/user/signin` | anyone | `{email, password}` → token |
| POST | `/user/setup_password` | anyone | `{email, setup_token, password}` |
| PUT | `/user/change_password` | user | `{current_password, new_password}` |
| GET | `/user/user_details` | user | profile (no secrets), `has_pin` |
| PUT | `/user/update_profile` | user | any of `{first_name, last_name, email}` |
| POST | `/user/setpin` | user | `{pin}`; changing an existing PIN also needs `current_pin` or `password` |
| GET | `/user/transactions` | user | `?page=&limit=&type=` newest first |
| GET | `/user/summary` | user | balance, credit/debit totals, last 7 days by day |
| POST | `/transaction/deposit` | user | `{amount, pin, narration?}` |
| POST | `/transaction/withdrawal` | user | `{amount, pin, narration?}` |
| POST | `/transaction/transfer` | user | `{amount, pin, account_number, narration}` |
| GET | `/transaction/lookup/:account_number` | user | recipient's name before sending |
| POST | `/admin/create_user` | admin | `{email, first_name, last_name, role?}` → setup code |
| POST | `/admin/resend_setup/:id` | admin | new setup code for a user who hasn't set a password |
| GET | `/admin/users` | admin | paginated users |
| GET | `/admin/transactions` | admin | paginated transactions |
| PUT | `/admin/disable_user/:id`, `/admin/enable_user/:id` | admin | block or allow transactions |
| DELETE | `/admin/delete_user/:id` | admin | removes the user and all their transactions |
| PUT | `/admin/reverse_transaction/:transaction_id` | admin | reverses a transfer |

Amounts must be greater than 0 with at most 2 decimal places.

## How money moves

- **Every balance change is a single atomic database update.** A debit only succeeds if the balance covers it at that moment, so concurrent requests can't double-spend.
- **A transfer debits the sender, then credits the recipient.** If the credit fails, the sender is refunded. Both sides get a transaction entry with the same `reference`, so each person sees it in their own history.
- **A reversal keeps the original entries,** marks them `is_reversed`, and adds two `reversal` entries. It only goes through if the recipient still has the money, and a transfer can only be reversed once.

## Limits to know about

- **No multi-document transactions.** Without a MongoDB replica set, a crash between the debit and the credit of a transfer could leave it half done. The refund path covers ordinary failures but not a process crash.
- **Rate limits are kept in server memory.** Each API instance counts separately; use a shared store such as Redis if you run more than one.
