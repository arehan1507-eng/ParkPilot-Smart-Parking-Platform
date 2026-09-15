# ParkPilot — Smart Parking Platform

ParkPilot is a full-stack parking management platform that makes reserving a parking space simple, visual, and reliable. Drivers can see live slot availability, reserve a space, manage their bookings, and update their profile. Operators and administrators have access to booking history, exports, and live performance analytics.

The interface is designed as a premium product experience: an animated landing page, a live parking-map preview, smooth dashboard transitions, and responsive controls throughout.

## What it does

- Lets users sign up, sign in, and manage their profile securely.
- Displays live parking availability across zones and individual slots.
- Creates slot bookings with vehicle, location, duration, and note details.
- Tracks payments, bookings, and saved locations for drivers.
- Provides operators and administrators with analytics, booking management, CSV export, and status controls.
- Includes accessible focus states and a reduced-motion mode for motion-sensitive users.

## Technology stack

| Area | Technologies |
| --- | --- |
| Frontend | React 18, Vite, React Router, CSS animations |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcryptjs |
| Tooling | npm, JavaScript modules |

> This is a JavaScript/Node.js project, so it uses `package.json` and `package-lock.json` for dependencies. A Python `requirements.txt` file is not applicable.

## Repository structure

```text
service-booking-platform/
├── client/                 # React + Vite frontend
│   └── src/
│       ├── components/
│       ├── context/
│       ├── pages/
│       └── styles/
├── server/                 # Express API and MongoDB models
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       └── routes/
├── docs/screenshots/       # Verified CLI and UI screenshots
├── package.json            # Root scripts
└── README.md
```

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or newer
- npm (installed with Node.js)
- MongoDB Community Server running locally, or a MongoDB Atlas connection string

## Installation

From the project root, install all dependencies:

```powershell
npm.cmd install
npm.cmd run install:all
```

PowerShell can block `npm.ps1` under some execution policies. The commands above intentionally use `npm.cmd`, which works without changing your machine’s execution policy.

## Environment configuration

The project works with the local defaults. To customize them, create these files from the examples:

```powershell
Copy-Item server\.env.example server\.env
Copy-Item client\.env.example client\.env
```

Default server configuration:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/service-booking-platform
JWT_SECRET=replace-with-a-long-random-secret
CLIENT_URL=http://localhost:5173
```

If you use MongoDB Atlas, replace `MONGODB_URI` with your Atlas connection string. Do not commit `.env` files or real secrets to GitHub.

## Run locally

Make sure MongoDB is running, then start the full application:

```powershell
npm.cmd run start:full
```

Open [http://localhost:5000](http://localhost:5000) in your browser.

For development with separate frontend and backend terminals:

```powershell
# Terminal 1
npm.cmd run dev:server

# Terminal 2
npm.cmd run dev:client
```

The Vite frontend runs at [http://localhost:5173](http://localhost:5173) in split development mode.

## Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@gmail.com` | `loml` |
| Operator | `operator@servicehub.com` | `operator123` |
| User | `user@gmail.com` | `user123` |

## CLI verification

The frontend has been compiled successfully for production with:

```powershell
npm.cmd run build
```

Expected result:

```text
vite building for production...
✓ modules transformed
✓ built successfully
```

## Screenshots

Add verified terminal and application screenshots to [`docs/screenshots`](docs/screenshots/README.md) before publishing the repository. The capture guide lists exactly what to show and how to name each image.

## License

This project is currently for educational and portfolio use.
