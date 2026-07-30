# Form Project - Setup Guide

A full-stack form application built with React (frontend) and Node.js + Express + MongoDB (backend, MVC structure). Includes a split-screen UI with a submission form and a data table (view, update, delete, bulk delete with pagination).

---

## Quick Install

**Frontend:**
```
npm install
```

**Backend:**
```
npm install express mongoose cors dotenv nodemon axios
```

---

## Frontend Setup (Step by Step)

1. Open terminal and go to the `Frontend` folder:
   ```
   cd Frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Make sure `axios` is installed (used to send/fetch data to/from backend):
   ```
   npm install axios
   ```

4. Start the frontend dev server:
   ```
   npm run dev
   ```

5. Frontend will run on:
   ```
   http://localhost:5173
   ```

6. Open that URL in the browser. Left side has the form, right side has the submitted records table.

---

## Backend Setup (Step by Step)

1. Open a new terminal and go to the `Backend` folder:
   ```
   cd Backend
   ```

2. Install dependencies:
   ```
   npm install express mongoose cors dotenv nodemon
   ```

3. Check the `.env` file has the correct values:
   ```
   PORT=3000
   MONGO_URI=your-mongodb-connection-string
   ```

4. Start the backend server:
   ```
   npm start
   ```

5. If everything is correct, terminal will show:
   ```
   MongoDB connected
   Server running on port 3000
   ```

6. Backend API is now live at:
   ```
   http://localhost:3000
   ```

---

## Project Structure

```
Backend/
 ├── .env
 ├── app.js
 ├── server.js
 ├── package.json
 ├── config/database/db.js
 ├── model/
 │    ├── formmodel/formmodel.js
 │    ├── tablemodel/tablemodel.js
 │    └── deletelogmodel/deletelogmodel.js
 ├── controllers/
 │    ├── formcontroller/formcontroller.js
 │    └── tablecontroller/tablecontroller.js
 └── routes/
      ├── formroute/formroutes.js
      └── tableroute/tableroutes.js

Frontend/
 └── src/
      ├── App.jsx
      ├── App.css
      ├── index.css
      ├── main.jsx
      ├── Form/
      │    ├── form.jsx
      │    └── form.css
      └── Table/
           ├── table.jsx
           └── table.css
```

---

## API Endpoints

| Method | Endpoint                    | Description                          |
|--------|------------------------------|---------------------------------------|
| POST   | `/api/forms`                 | Submit a single form entry            |
| POST   | `/api/forms/bulk`             | Insert multiple form entries at once  |
| GET    | `/api/forms`                  | Get all raw form entries              |
| GET    | `/api/table?page=1&limit=5`   | Get paginated table data              |
| PUT    | `/api/table/:id`              | Update a single record                |
| DELETE | `/api/table/:id`              | Delete a single record                |
| POST   | `/api/table/bulk-delete`      | Delete multiple selected records      |

> Deleted records are not permanently lost immediately — a full copy (with a `deletedAt` timestamp) is first saved into the `deletelogs` collection before removal from the main collection.

---

## Important Notes

- Run **backend first**, then **frontend** — form submit and table data need the backend running.
- Both servers must run at the same time (use 2 separate terminals).
- Do not share your `.env` file or MongoDB password publicly (e.g. on GitHub). Add `.env` to `.gitignore`.
- `node_modules` should never be pushed to GitHub — keep it in `.gitignore`.