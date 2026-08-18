# EJS Frontend — What's New

A full server-rendered EJS frontend has been added on top of the existing JSON API. The API itself is **untouched** — every existing `/api/...` route still works exactly as before.

## How it works
- New pages are plain EJS "shells" served by `routes/views.js`.
- Each page loads its data in the browser via `fetch()` calls to your existing `/api/...` endpoints (see `public/js/api.js`).
- The JWT returned by `/api/auth/login` is stored in `localStorage` and attached to every API call as `Authorization: Bearer <token>`.
- Styling is plain CSS in `public/css/style.css` (no framework/build step).

## Setup
```bash
npm install
```
Make sure your `.env` has `MONGO_URL` and `JWT_SECRET` set (same as before).

```bash
npm run dev
```
Then open **http://localhost:5700** (or whatever `PORT` you've set).

## Pages added
- `/`, `/login`, `/register`
- Student: `/student/dashboard`, `/jobs`, `/job/:jobId`, `/applications`, `/placement-history`, `/profile`, `/tests`, `/take-test/:questionSetId`, `/test-results[/:testSessionId]`, `/leaderboard`, `/notifications`
- Company: `/company/dashboard`, `/create-job`, `/jobs`, `/applications/:jobId`
- TPO: `/tpo/dashboard`, `/job-approval`, `/jobs`, `/applications`, `/reports`, `/questions`

## Notes / known limitations
- The old JSON "welcome" route that used to live at `/` was moved to `/api-info` so it doesn't collide with the new home page.
- The TPO "Manage Jobs" page can edit/delete existing jobs but doesn't create brand-new ones from scratch (job creation is a Company action that goes through the approval workflow) — this matches how your backend is structured.
- All auth/role protection is still enforced server-side by your existing middleware; the frontend also redirects to `/login` or `/` client-side if the wrong role is detected, purely for UX.
