<!-- Ramatan Developments - Dashboard README -->

# Ramatan Developments — Dashboard

Professional, open-source-ready README for the Ramatan Developments Dashboard project.

---

**Project Overview**

Ramatan Developments — Dashboard is a lightweight full-stack web application providing an administrative dashboard for managing projects, units, operations, and users. It includes:

- A small custom PHP backend API (no heavy frameworks required).
- A modern Vite-powered JavaScript frontend.
- A MySQL schema for the application's data model.

This README documents how to set up, run, and deploy the system in development and production environments.

--

**Features**

- User authentication using JSON Web Tokens (JWT).
- Role-based access control (admin, sales, etc.).
- CRUD for Projects, Units, Operations, and Users.
- Rate limiting for API endpoints (simple file-based cache).
- Tools for one-time tasks (e.g., create first admin).
- Lightweight, framework-free PHP backend for portability.

--

**Technology Stack**

| Layer          | Technology                     |
| -------------- | ------------------------------ |
| Backend        | PHP (PDO + custom JWT helpers) |
| Frontend       | Vite + React (ESM)             |
| Database       | MySQL                          |
| Authentication | JWT (HS256)                    |

--

**Project Folder Structure**

```
ramatan-dashboard/
├─ backend/                # PHP API
│  ├─ api/
│  ├─ middleware/
│  ├─ tools/               # One-time scripts (create-admin.php)
│  ├─ cache/
│  ├─ logs/
│  └─ config.php           # DB + env loader + JWT helpers
├─ frontend/               # Vite + JS frontend
├─ database/
│  └─ ramatan_db.sql       # Schema + seed data
└─ README.md
```

--

## Backend Setup (PHP)

Minimum requirements

- PHP 7.4+ (recommended PHP 8.x)
- PDO extension (pdo_mysql)
- Web server (Apache, Nginx, or built-in PHP server)
- MySQL server

Important environment variables (backend):

- `DB_HOST` — MySQL host (e.g. `127.0.0.1`)
- `DB_NAME` — Database name (e.g. `ramatan_db`)
- `DB_USER` — DB username
- `DB_PASS` — DB password
- `JWT_SECRET` — Secret used to sign JWTs (change in production)
- `JWT_ALGORITHM` — Algorithm (default: `HS256`)

How the backend loads `.env`

- The file `backend/config.php` contains a small, dependency-free `.env` loader function `loadEnvFile(...)`. It will attempt to read the first existing `.env` from:

  - `project_root/.env` (one level up)
  - `backend/.env`

- The loader parses simple `KEY=VALUE` lines, ignores comments that start with `#`, removes optional surrounding quotes, and sets values using `putenv()` and `$_ENV` / `$_SERVER` entries.

JWT authentication overview

- The backend implements JWT helpers inside `backend/config.php`:
  - `generateJWT($user_data)` — Creates a token with `iss`, `iat`, `exp` (24 hours), and user info (`user_id`, `username`, `role`). Signed using `JWT_SECRET` and HMAC-SHA256.
  - `verifyJWT($jwt)` — Verifies signature and expiration; returns payload on success or `false` on failure.

Token validation middleware

- Middleware helper functions implement the common patterns:
  - `getAuthorizationHeader()` — Retrieves `Authorization` header supporting different server environments.
  - `getBearerToken()` — Extracts the bearer token from `Authorization: Bearer <token>`.
  - `validateToken()` — Ensures token exists, calls `verifyJWT()`, checks that the user is still active in the DB, and returns decoded payload. Returns HTTP 401/403 JSON error responses on failure.
  - Role-based helpers: `requireAuth()`, `requireAdmin()`, `requireSales()` — wrap `validateToken()` and enforce role checks.

CRUD operations pattern

- Each resource (units, projects, operations, users) follows a simple pattern in `backend/api/*`:
  - Use prepared statements via the shared `$pdo` instance from `config.php`.
  - Validate and sanitize input with helper functions (e.g., `validateRequired()`, `validateEmail()`).
  - Use `requireAuth()` or `requireAdmin()` as needed to protect endpoints.
  - Respond with consistent JSON using `sendSuccess()` and `sendError()` helpers.

Rate limiting and logs

- A simple file-based rate limiter (`rateLimit($key, $max_attempts, $time_window)`) writes per-key JSON timestamps to `backend/cache/`.
- Application logs are written to `backend/logs/` (`actions.log` and `php_errors.log`). Ensure the web server user can write to these directories.

--

## Frontend Setup (Vite + JS)

Important environment variable (frontend):

- `VITE_API_URL` — Base URL for the backend API (e.g. `http://localhost/ramatan-dashboard/backend/api`)

Install dependencies

From the `frontend/` folder run:

```powershell
cd frontend
npm install
```

Run development server

```powershell
npm run dev
```

Build production bundle

```powershell
npm run build
```

Notes about environment variables

- Vite only exposes env variables prefixed with `VITE_` to client code. Create a `.env` file in `frontend/` with:

```env
VITE_API_URL=http://localhost/ramatan-dashboard/backend/api
```

- Or export in PowerShell for the session:

```powershell
$env:VITE_API_URL = 'http://localhost/ramatan-dashboard/backend/api'
npm run dev
```

--

## Database Setup

The schema and seed data are in `/database/ramatan_db.sql`.

Using phpMyAdmin

1. Open phpMyAdmin (usually via `http://localhost/phpmyadmin`).
2. Create a new database named `ramatan_db` (or use another name and update `DB_NAME`).
3. Select the database and choose the Import tab.
4. Upload `/database/ramatan_db.sql` and run the import.

Using MySQL CLI

```powershell
# Create the database (only if not created by the SQL file)
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS ramatan_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Import the SQL file
mysql -u root -p ramatan_db < database/ramatan_db.sql
```

Creating the first admin user

Option 1 — use the provided one-time tool (recommended for convenience):

1. Edit `backend/tools/create-admin.php` to set credentials you want.
2. Run it from a browser or CLI (only run locally):

```powershell
# From project root
php backend/tools/create-admin.php

# Or visit in browser: http://localhost/ramatan-dashboard/backend/tools/create-admin.php
```

Option 2 — SQL insert

```sql
INSERT INTO users (username, password, email, phone, full_name, role, commission_rate, is_active)
VALUES (
  'admin1',
  'REPLACE_WITH_BCRYPT_HASH', -- use PHP password_hash for this
  'admin@example.com',
  '01000000001',
  'System Admin',
  'admin',
  0.00,
  1
);

-- Example to generate hash using PHP interactive shell:
-- php -r "echo password_hash('your_password_here', PASSWORD_BCRYPT);"
```

Security note: Remove or restrict access to `backend/tools/` in production.

--

## Environment Files — Examples

Backend `.env.example` (place in project root or `backend/`):

```env
# Database
DB_HOST=127.0.0.1
DB_NAME=ramatan_db
DB_USER=root
DB_PASS=

# JWT
JWT_SECRET=ChangeThisToASecureRandomString
JWT_ALGORITHM=HS256

# Optional: other app-level flags
APP_ENV=development
```

Frontend `.env.example` (place in `frontend/`):

```env
VITE_API_URL=http://localhost/ramatan-dashboard/backend/api
```

--

## Running the Full System (Quick Start)

1. Import the database: see Database Setup.
2. Create `.env` for backend and fill credentials.
3. Ensure `backend/logs/` and `backend/cache/` are writable by the web server.
4. Create the first admin via `backend/tools/create-admin.php`.
5. Start frontend dev server:

```powershell
cd frontend
npm install
npm run dev
```

6. Open the app in your browser (Vite will show the URL, e.g., `http://localhost:5173`).

--

## API Authentication Overview (JWT)

- Algorithm: `HS256` (HMAC-SHA256). The backend defines `JWT_ALGORITHM` = `HS256`.
- Signing key: `JWT_SECRET` from backend `.env`. Keep it secret and rotate if leaked.
- Token payload includes `iss`, `iat`, `exp` (24 hours), and user claims (`user_id`, `username`, `role`).

Typical flow:

1. Client posts credentials to `api/auth/login.php`.
2. Backend verifies credentials (password verified with `password_verify()`), then calls `generateJWT($user)`.
3. Client stores token (recommended: in memory or secure storage; do not store in localStorage for high-security apps).
4. Client sends `Authorization: Bearer <token>` with API requests.
5. Server middleware uses `getBearerToken()` and `validateToken()` to authenticate/authorize.

Token expiry and refresh

- Tokens currently expire after 24 hours. No refresh token flow is implemented by default — you can extend the API to implement refresh tokens if desired.

--

## How to create the first Admin user

- Quick method: edit and run `backend/tools/create-admin.php`. It will insert an `admin` user after hashing the password.
- SQL method: use an `INSERT` with `password_hash()` generated hash (see Database section for example).

Warning: Do not leave `backend/tools/create-admin.php` accessible in production. Delete or restrict it after use.

--

## Tools (`backend/tools/`)

- Purpose: one-time convenience scripts (e.g., creating the first admin account).
- Important: These files are not intended to be part of the long-running application surface — treat them as admin utilities.

Security recommendations

- Do not commit secrets in `tools` or `.env` to a public repository.
- Remove or restrict `tools/` from production deployments (via web server rules / .htaccess / remove files).

--

## Security Notes

- Change `JWT_SECRET` before deploying to production and keep it secret (use environment-level secret management).
- Protect `backend/tools/` — do not expose in production.
- Ensure `backend/logs/` and `backend/cache/` are not web-accessible.
- Validate and sanitize inputs; backend uses prepared statements and validation helpers, but always review endpoints before public deployment.
- Use HTTPS in production. Never transport tokens or credentials over plain HTTP.

--

## Development Notes

- Code style: The backend is intentionally simple and framework-free for portability and learning.
- If extending, prefer centralizing shared logic in `backend/config.php` or new included files.
- Consider introducing Composer and `vlucas/phpdotenv` if you want a more robust env loader.

Local dev tips

- If you see `DB Connection failed`, confirm `.env` values, MySQL is running, and the user has proper privileges.
- If JWT verification fails with `Invalid or expired token`, ensure `JWT_SECRET` is identical between servers and tokens were generated after secret was set.

--

## Screenshots

> Add screenshots here in the `/frontend/public` or `docs/` folder and reference them below. Example placeholders:

![Dashboard screenshot](./frontend/public/screenshot-dashboard.png)
![Projects screenshot](./frontend/public/screenshot-projects.png)

--

## Troubleshooting

- CORS errors: The project intends to manage CORS at the server or `.htaccess` level. Ensure your web server/CORS headers are set and do not duplicate headers.
- Permissions: If `logs` or `cache` cannot be written, set proper file permissions for the web server user.
- PHP errors: Enable `display_errors` only in development. Production should write errors to `backend/logs/php_errors.log`.
- 500 on DB connect: Verify `DB_HOST`, `DB_USER`, `DB_PASS`, and `DB_NAME` in backend `.env`.
- Frontend can't reach API: Confirm `VITE_API_URL` is correct and add trailing `/` consistent with your API routes.

--

## Quick Start (one-liners)

```powershell
# Import DB
mysql -u root -p ramatan_db < database/ramatan_db.sql

# Start frontend dev
cd frontend; npm install; npm run dev

# Run the one-time admin script (edit first)
php backend/tools/create-admin.php
```

--

## License

This project is released under the MIT License.

--

## Credits / Author

- Ramatan Developments — internal project
- Maintainer: Project team

If you want help extending this project (Dockerfile, CI/CD, refresh tokens, or migrating to a micro-framework), open an issue or reach out to the maintainers.

---

Thank you for using Ramatan Developments — Dashboard. Contributions and improvements are welcome.
