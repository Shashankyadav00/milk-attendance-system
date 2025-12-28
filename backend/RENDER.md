# Running on Render

To run this backend on Render, set the following environment variables in your Render service:

- `DATABASE_URL` — **must be a JDBC Postgres URL**, e.g. `jdbc:postgresql://host:5432/dbname`. If Render provides a `postgres://` URL, convert it to the `jdbc:` form (e.g., replace `postgres://` with `jdbc:postgresql://` and include user/password if required) or set `DATABASE_URL` in Render to the JDBC form.
- `DB_USERNAME` — (optional) DB username if not included in `DATABASE_URL`.
- `DB_PASSWORD` — (optional) DB password if not included in `DATABASE_URL`.
- `SENDGRID_API_KEY` — SendGrid API key for email features.
- `ADMIN_EMAIL` — recipient address used by the email service.
- `FRONTEND_URL` — (recommended) the origin of your frontend app, e.g. `https://milk-attendance-frontend.onrender.com`. If set, the backend will allow CORS requests from this origin in addition to `http://localhost:3000`.
- `PORT` — optional; defaults to 8080.

Deployment options:

- Docker: the repo includes a `Dockerfile` in `backend/`. Render can build using Docker.
- Native build: use Render's build system with `mvn -B -DskipTests package` and run with `java -jar target/*.jar`.

Notes:
- The test environment uses H2 in-memory DB (configured in `src/test/resources/application.properties`) so tests are safe to run during CI.
- For production DB, ensure `DATABASE_URL` is set to a valid JDBC URL (Spring's `spring.datasource.url` loads the value from `${DATABASE_URL}`).
