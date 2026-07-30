# Form Project - Setup Guide

A simple form built with React (frontend) and Node.js + Express + MongoDB (backend, MVC structure).

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

1. Open terminal and go to the `frontend` folder:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Make sure `axios` is installed (used to send form data to backend):
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

6. Open that URL in the browser, fill the form, and click Submit. It will send the data to the backend API.

---

## Backend Setup (Step by Step)

1. Open a new terminal and go to the `backend` folder:
   ```
   cd backend
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
   http://localhost:3000/api/forms
   ```

---

## Project Structure

```
backend/
 ├── .env
 ├── app.js
 ├── server.js
 ├── package.json
 ├── config/database/db.js
 ├── model/formmodel/formmodel.js
 ├── controllers/formcontroller.js
 └── routes/formroute/formroutes.js

frontend/
 ├── App.jsx
 ├── App.css
 └── index.css
```

---

## Important Notes

- Run **backend first**, then **frontend** — form submit needs backend running to save data to MongoDB.
- Both servers must run at the same time (use 2 separate terminals).
- Do not share your `.env` file or MongoDB password publicly (e.g. on GitHub). Add `.env` to `.gitignore`.
