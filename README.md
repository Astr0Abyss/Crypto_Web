# Crypto Toolkit

Client-side cipher tools with automatic guest and user history persistence through Neon.

## Run Locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env` from `.env.example` and add your Neon pooled connection string:

   ```bash
   cp .env.example .env
   ```

3. Start the app:

   ```bash
   npm start
   ```

4. Open `http://127.0.0.1:5500/`.

## Accounts And Guest Persistence

The app does not require login. Each browser gets a random guest identity stored in `localStorage`, such as `Guest A1B2C3`. Users can also create an account with name, email, and password. Passwords are salted and hashed on the server, and the browser stores only a session token.

When `DATABASE_URL` is configured, the server creates the required Neon tables automatically and saves each encrypt/decrypt generation for the active signed-in user. If nobody is signed in, generations are saved for the guest.

The database stores:

- guest id and display name
- algorithm name
- encrypt/decrypt mode
- input text
- output text
- creation time

Keys are not saved.
