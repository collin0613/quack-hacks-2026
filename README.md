# QuackHacks

## Running locally

1. **Start the game server** (socket.io + game logic, port 3000):
   ```bash
   cd server && npm start
   ```
   You should see: `Server listening on http://localhost:3000`

2. **Start the client** (Vite dev server, port 5173):
   ```bash
   cd client && npm run dev
   ```
   Open http://localhost:5173 in your browser.

3. **Test Play**:

- Open  **two browser tabs** (or two windows) to http://localhost:5173. Both tabs connect to the same server. Use the same room ID (e.g. `test`) in both, choose a player name, and join the lobby! At the moment, this is not testable unless you set up a custom ngrok tunnelling config. So to test it out, we recommmend you simply switch between tabs and control each player independently using a single camera.

If the Lobby shows **Disconnected**, the server is not running—start it from the `server` folder first.
