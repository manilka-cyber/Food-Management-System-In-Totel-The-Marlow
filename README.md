# The Marlow — Full-Stack Multi-Device Suite (Fixed)

## What Was Fixed
1. **Phone / Tablet / Desktop Layout (`styles.css` & `index.html`):**
   - Removed conflicting duplicate CSS rules at the bottom of `styles.css` that overrode `.sidebar` on mobile.
   - Wrapped tables in `.table-wrap` (`overflow-x: auto`) so wide tables scroll smoothly inside their card instead of stretching the phone screen.
   - Added 16px mobile form font sizes to prevent iOS Safari auto-zoom on input focus and responsive 2-column KPI/room grids.
2. **Database + Backend + Frontend Sync (`server.js`, `db.js`, `schema.sql`, `app.js`):**
   - Connected frontend actions (Register, Login, Create Order, Advance Order Status, Toggle Dish Availability, Add/Restock Inventory) to `/api/*` endpoints in `server.js` backed by MySQL (`the_marlow_db`), while keeping automatic `localStorage` fallback if opened standalone.

## How to Run & Open on Any Device
1. Start MySQL (e.g., via XAMPP / WAMP / MySQL service) and import `schema.sql`:
   ```sql
   SOURCE schema.sql;
   ```
2. Copy `.env.example` to `.env` and set your `DB_USER` and `DB_PASSWORD`.
3. Install dependencies and start the server:
   ```bash
   npm install
   npm start
   ```
4. Open on your PC at `http://localhost:5000`, or open `http://<YOUR-PC-IP>:5000` on your phone/tablet connected to the same Wi-Fi.
