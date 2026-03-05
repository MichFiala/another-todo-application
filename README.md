# Another Todo App

A modern, full-stack todo application with real-time updates and swipe gestures — because the world needed one more todo app, but this time built properly.

---

## Tech Stack

### Backend
![.NET](https://img.shields.io/badge/.NET_10-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)
![ASP.NET Core](https://img.shields.io/badge/ASP.NET_Core-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Auth0](https://img.shields.io/badge/Auth0-EB5424?style=for-the-badge&logo=auth0&logoColor=white)

### Frontend
![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Mantine](https://img.shields.io/badge/Mantine-339AF0?style=for-the-badge&logo=mantine&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)

### Deployment
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Docker Hub](https://img.shields.io/badge/Docker_Hub-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Hetzner](https://img.shields.io/badge/Hetzner-D50C2D?style=for-the-badge&logo=hetzner&logoColor=white)
![Dokploy](https://img.shields.io/badge/Dokploy-000000?style=for-the-badge&logo=docker&logoColor=white)

---

## Architecture

```
a-todo/
├── api/          # ASP.NET Core Minimal API (.NET 10)
│   ├── Program.cs          # Minimal API endpoints + SSE
│   ├── TasksHub.cs         # Pub/Sub hub for SSE channels
│   ├── AppDbContext.cs     # EF Core DbContext
│   └── wwwroot/            # Compiled React SPA (served statically)
└── app/          # React SPA (TypeScript)
    └── src/
        ├── Card.tsx              # Swipeable task card
        ├── TasksSSEListener.tsx  # SSE client for real-time updates
        ├── authHook.ts           # Auth0 hook
        └── api-client/           # Auto-generated from OpenAPI spec
```

---

## Highlighted Features

### Swipe Gestures (Framer Motion)
Task cards support drag-to-action gestures using **Framer Motion**:
- **Swipe right** → mark task as finished ✅
- **Swipe left** → delete task 🗑️

Cards stack on top of each other with a slight rotation offset, giving a physical card-deck feel. The drag threshold is 150px, after which the card animates off-screen before triggering the action.

### Server-Sent Events (Real-time Updates)
When any task is modified (created, updated, deleted, shuffled), the server broadcasts an invalidation event to all connected clients of that user via **SSE**:

- **Backend**: Uses `Results.ServerSentEvents()` (ASP.NET Core 10 native API) backed by `System.Threading.Channels` for a lightweight, lock-free pub/sub hub
- **Frontend**: `sse.js` client with auto-reconnect, configurable retry count, and last-event-id tracking — on receiving a message, TanStack Query cache is invalidated and data refetches automatically
- **Background cleanup**: A `PeriodicTimer`-based hosted service runs every 5 minutes to close channels for users inactive for 10+ minutes

### OpenAPI-Generated API Client
The TypeScript API client (`src/api-client/`) is auto-generated from the backend's OpenAPI spec using `openapi-generator-cli`. Run `npm run openapi` to regenerate after API changes — no hand-written API calls.

### Auth0 JWT Authentication
Authentication is handled end-to-end via **Auth0**:
- Frontend uses `@auth0/auth0-react` to obtain JWT access tokens silently
- Backend validates tokens using `JwtBearerDefaults.AuthenticationScheme` with issuer and audience validation
- All API endpoints require authorization; the SSE endpoint authenticates via `Authorization: Bearer` header (not cookies)

### Task Shuffling
Active tasks have an explicit `Order` field. The shuffle endpoint randomizes the order server-side and notifies all clients via SSE — so if you have the app open on multiple devices, they all update simultaneously.

### Entity Framework Core with PostgreSQL
- `IDbContextFactory<AppDbContext>` for scoped DbContext instances per request (safe for concurrent/async endpoints)
- Bulk updates using `ExecuteUpdateAsync` (no entity tracking overhead)
- Auto-migrations on startup

---

## Getting Started

### Prerequisites
- .NET 10 SDK
- Node.js 18+
- PostgreSQL instance
- Auth0 tenant

### Backend
```bash
cd api
# Configure appsettings.json (ConnectionStrings:Default, Auth0:Domain/Audience/Issuer)
dotnet run
```

### Frontend
```bash
cd app
npm install
npm start
```

### Build & Release
The frontend builds into `api/wwwroot/` and is served as a static SPA by ASP.NET Core:
```bash
cd app
npm run build
npm run release
```

---

## Deployment

The app is deployed on a **Hetzner VPS** managed by **[Dokploy](https://dokploy.com)**.

### Release flow

```
api/release.bat <version>
```

The `release.bat` script automates the entire release in one command:

1. **Build React SPA** — `npm run build` compiles the frontend
2. **Copy to wwwroot** — static files are embedded into the ASP.NET Core project
3. **Build Docker image** — `dotnet publish --os linux --arch x64 -p:PublishProfile=DefaultContainer` builds a Linux x64 container image using .NET's built-in container support (no Dockerfile needed)
4. **Tag & push to Docker Hub** — image is tagged as `michfiala/todo-application:<version>` and pushed to Docker Hub

```
michfiala/todo-application:<version>  →  Docker Hub
```

5. **Dokploy deploys** — Dokploy running on the Hetzner VPS pulls the new image from Docker Hub and redeploys the container automatically
