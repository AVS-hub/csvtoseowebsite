# CSV to SEO Website

This project contains a Node.js/Express backend and a React frontend built with Vite.
It lets you upload CSV files and manage pages for SEO-optimized websites.

## Prerequisites
- Node.js 18 or later

## Setup
1. Install dependencies for the root workspace:
   ```bash
   npm install
   ```
2. Install backend and frontend dependencies:
   ```bash
   cd backend && npm install
   cd ../vitereact && npm install
   cd ..
   ```
3. Copy `backend/.env` and adjust the values for `JWT_SECRET` and `OPENAI_API_KEY`.
4. Initialize the database:
   ```bash
   node backend/initdb.js
   ```

## Running in Development
Start both the API and the React dev server:
```bash
npm run dev
```
The backend listens on `http://localhost:1337` and the frontend on `http://localhost:5173`.

## Building the Frontend
To build the React app for production:
```bash
cd vitereact && npm run build
```
The compiled files will be in `vitereact/dist`.
