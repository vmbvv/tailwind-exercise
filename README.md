# Run Project

## 1) Install dependencies

Backend:

```bash
cd academy-backend
npm install
```

Frontend:

```bash
cd ../academy-frontend
npm install
```

## 2) Configure backend env

Create `academy-backend/.env`:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=http://localhost:5173
```

## 3) Start backend

```bash
cd academy-backend
npm run dev
```

## 4) Start frontend

Open a second terminal:

```bash
cd academy-frontend
npm run dev
```

## 5) Open app

`http://localhost:5173`

---
If PowerShell blocks `npm`, use `npm.cmd` instead.
