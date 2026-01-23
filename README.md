# Script2Sound

Script2Sound is a **full‑stack MERN-style project** that converts uploaded notes into scripts, generates multi‑speaker audio using OpenAI TTS, stores audio in MongoDB (GridFS), and provides practice questions based on the content.

This README is written so a **new developer can clone the repo and run it locally**, or modify only the frontend if needed.

---

## Project Structure

```
SCRIPT2SOUND/
│
├── backend/
│   ├── assets/          # Intro music, static audio assets
│   ├── config/          # DB & GridFS config
│   ├── controllers/     # API controllers (TTS, OCR, questions, auth)
│   ├── middleware/      # Auth middleware
│   ├── models/          # Mongoose models (User, Audio)
│   ├── routes/          # Express routes
│   ├── services/        # OpenAI, OCR services
│   ├── uploads/         # Temporary uploads (OCR)
│   ├── .env             # Environment variables
│   ├── server.js        # Express entry point
│   ├── package.json
│
├── src/                 # Frontend (Vite + React)
│   ├── assets/
│   ├── components/
│   ├── layouts/
│   ├── pages/
│   ├── services/        # API client (fetch / axios)
│   ├── utils/
│   ├── App.jsx
│   ├── main.jsx
│
├── public/
├── index.html
├── tailwind.config.js
├── vite.config.js
├── package.json
```

---

## Backend Dependencies

Install **inside `/backend`**:

```bash
cd backend
npm install
```

### Backend Packages Used

| Package       | Purpose              |
| ------------- | -------------------- |
| express       | Backend server       |
| mongoose      | MongoDB ODM          |
| mongodb       | GridFS streaming     |
| fluent-ffmpeg | Audio concatenation  |
| ffmpeg-static | FFmpeg binary        |
| multer        | File uploads (OCR)   |
| tesseract.js  | OCR text extraction  |
| jsonwebtoken  | Auth tokens          |
| bcryptjs      | Password hashing     |
| cors          | Cross-origin support |
| dotenv        | Env variables        |
| openai        | OpenAI API client    |
| nodemon (dev) | Auto-restart server  |

---

## Frontend Dependencies

Install **in project root**:

```bash
npm install
```

### Frontend Packages Used

| Package          | Purpose           |
| ---------------- | ----------------- |
| react            | UI framework      |
| react-dom        | React DOM         |
| react-router-dom | Routing           |
| vite             | Build tool        |
| tailwindcss      | Styling           |
| postcss          | CSS processing    |
| autoprefixer     | CSS compatibility |
| lucide-react     | Icons             |

---

## Environment Variables (Backend)

Create `/backend/.env`

```
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret
OPENAI_API_KEY=your_openai_key
```

⚠️ FFmpeg **does not** need manual install (ffmpeg-static is used) 

---

## Running the Project

### 1️. Start Backend

```bash
cd backend
npm run dev
```

Runs on: `http://localhost:5000`

---

### 2️. Start Frontend

```bash
npm run dev
```

Runs on: `http://localhost:5173`

---

## API Overview (Backend)

| Route               | Method | Purpose            |
| ------------------- | ------ | ------------------ |
| /auth/register      | POST   | Register user      |
| /auth/login         | POST   | Login              |
| /extract            | POST   | OCR notes          |
| /generate           | POST   | Script generation  |
| /tts                | POST   | Audio generation   |
| /library            | GET    | List user audio    |
| /audio/:filename    | GET    | Stream audio       |
| /audio/:id          | DELETE | Delete audio       |
| /questions/:audioId | GET    | Practice questions |

---

## Notes for Frontend-Only Developers

If your friend **only wants to change the frontend**:

* Backend must still be running
* Update API base URL in:

```
src/services/api.js
```

* All UI lives in:

```
src/pages
src/components
```

---

## Known Features

* Multi-speaker TTS
* Audio intro + fade
* GridFS audio storage
* Audio library + delete
* Practice questions per audio
* Tailwind responsive UI

---

## Common Issues

* **Audio not playing** → check auth token
* **OCR wrong text** → clear uploads & retry
* **Questions irrelevant** → ensure OCR text is passed to prompt

---

## Final Notes

This project is stable for local development. Any new contributor should:

1. Clone repo
2. Run backend
3. Run frontend
4. Add `.env`

