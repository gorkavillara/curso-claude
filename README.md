# TaskMaster-TS

Full-stack demo project used in a Claude Code course. It is intentionally **multi-layered** so an AI assistant can be asked to navigate the codebase and perform changes that span several files (routes, model, tests, frontend client and Dockerfile).

- **Backend:** Node.js + TypeScript + Express, persisting data in SQLite via `better-sqlite3`.
- **Frontend:** static HTML + a lightweight TypeScript client that consumes the REST API.
- **Tests:** Jest suite (API + model) using an in-memory SQLite database.
- **Tooling:** shared `tsconfig.base.json`, root `package.json`, functional `Dockerfile` for the backend.

## Project structure

```
.
├── backend/
│   ├── src/
│   │   ├── server.ts            # entry point
│   │   ├── app.ts               # Express app factory
│   │   ├── db/connection.ts     # SQLite init / schema
│   │   ├── models/task.ts       # Task model (CRUD)
│   │   ├── routes/tasks.ts      # REST endpoints
│   │   └── middleware/errorHandler.ts
│   └── tsconfig.json
├── frontend/
│   ├── index.html
│   ├── src/
│   │   ├── main.ts              # DOM wiring
│   │   ├── api.ts               # typed fetch client
│   │   └── styles.css
│   ├── nginx.conf               # nginx config used by the container
│   ├── Dockerfile               # frontend image (nginx)
│   └── tsconfig.json
├── tests/
│   ├── tasks.test.ts            # API tests (supertest)
│   └── db.test.ts               # model tests
├── Dockerfile                   # backend image (Node)
├── compose.yml                  # orchestrates backend + frontend
├── jest.config.js
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Requirements

- Node.js 20+
- npm 10+
- (optional) Docker 24+ if you want to run the backend in a container

## Installation

```bash
git clone <this-repo> taskmaster-ts
cd taskmaster-ts
npm install
```

> `better-sqlite3` compiles a native binding during `npm install`. On Linux/macOS the default toolchain is enough; on Windows install the "Desktop development with C++" workload from Visual Studio Build Tools if the install fails.

## Running the backend (dev)

```bash
npm run dev
```

The API listens on `http://localhost:3000`:

- `GET    /health`
- `GET    /api/tasks`
- `POST   /api/tasks`         `{ "title": "...", "description": "..." }`
- `GET    /api/tasks/:id`
- `PUT    /api/tasks/:id`
- `DELETE /api/tasks/:id`

The SQLite file is created in `./data/taskmaster.db` by default (override with `DB_PATH`).

## Running the frontend

Compile TypeScript (the build step also copies `index.html` and `styles.css` into `dist/frontend`, producing a self-contained web root):

```bash
npm run build:frontend
npx http-server dist/frontend -p 8080
# then visit http://localhost:8080
```

The client points to `http://localhost:3000/api` by default.

## Build everything

```bash
npm run build   # compiles backend -> dist/backend and frontend -> dist/frontend
npm start       # runs the compiled backend
```

## Running the tests

```bash
npm test
```

Tests use an in-memory SQLite database (`:memory:`) so they leave no artefacts.

## Docker

### Backend only

```bash
docker build -t taskmaster-ts .
docker run --rm -p 3000:3000 -v "$(pwd)/data":/app/data taskmaster-ts
```

The backend exposes port `3000` and persists the SQLite database on the `/app/data` volume.

### Full stack with Docker Compose

`compose.yml` runs both services together:

| Service    | Image                      | Exposed port | Notes                              |
| ---------- | -------------------------- | ------------ | ---------------------------------- |
| `backend`  | `taskmaster-ts-backend`    | `3000`       | Node + Express + SQLite            |
| `frontend` | `taskmaster-ts-frontend`   | `8080` → 80  | nginx serving the compiled client  |

```bash
# Build and start both services
docker compose up --build

# In the background
docker compose up -d --build

# Stop everything
docker compose down
```

Then open:

- API:      <http://localhost:3000/health>
- Frontend: <http://localhost:8080>

The SQLite database is persisted in a named volume (`taskmaster-data`). The frontend talks to the backend via the browser using `http://localhost:3000/api`, so both containers just need to expose their ports to the host.

## Scripts reference

| Script                  | Description                              |
| ----------------------- | ---------------------------------------- |
| `npm run dev`           | Backend with hot reload (`ts-node-dev`)  |
| `npm run build`         | Build backend + frontend                 |
| `npm run build:backend` | Compile backend only                     |
| `npm run build:frontend`| Compile frontend only                    |
| `npm start`             | Run compiled backend from `dist/`        |
| `npm test`              | Jest test suite                          |
| `npm run lint`          | Type-check backend + frontend (no emit)  |
| `npm run clean`         | Remove `dist/`                           |

## License

MIT
