# VoteApp — Online Voting System

A secure, full-stack online voting system built with Node.js, Express, MongoDB, and React. Supports Aadhar-based voter identity, role-based access control, real-time results with charts, and a modern dark-themed UI.

---

## Screenshots

> Login Page · Vote Page · Results Dashboard · Admin Panel

---

## Features

### Voter
- Register and login using Aadhar Card Number
- View all candidates with party information
- Cast vote with confirmation prompt (one vote per voter)
- View live results with bar chart and vote share
- Update password from profile page

### Admin
- Add, update, and delete candidates
- View all registered voters
- Block or unblock voters
- Cannot vote (conflict of interest prevention)

### Security
- JWT-based authentication with role included in token
- Passwords hashed with bcrypt (never stored in plain text)
- Admin role checked via middleware on every protected route
- CSRF-safe — votes use POST requests, not GET
- Input validation on all routes
- MongoDB ObjectId validation to prevent CastError crashes
- Password never returned in API responses

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JSON Web Tokens (JWT) |
| Password Hashing | bcrypt |
| Frontend | React.js, React Router v6 |
| HTTP Client | Axios |
| Charts | Chart.js, react-chartjs-2 |
| Styling | Custom CSS (dark theme) |

---

## Project Structure

```
voting-app/
├── models/
│   ├── user.js               # User schema with bcrypt hooks
│   └── candidate.js          # Candidate schema with vote tracking
├── routes/
│   ├── userRoutes.js         # Signup, login, profile, password
│   └── candidateRoutes.js    # Candidates CRUD + voting + results
├── jwt.js                    # JWT middleware + adminOnly middleware
├── db.js                     # MongoDB connection with graceful shutdown
├── server.js                 # Express app entry point
└── voting-frontend/
    └── src/
        ├── api/
        │   └── axios.js          # Axios instance with JWT interceptor
        ├── context/
        │   └── AuthContext.js    # Global auth state
        ├── components/
        │   ├── Navbar.js         # Navigation with role-aware links
        │   └── ProtectedRoute.js # Route guard for logged-in users
        └── pages/
            ├── Login.js          # Login page
            ├── Signup.js         # Voter registration page
            ├── Vote.js           # Candidate list + vote button
            ├── Results.js        # Live results with bar chart
            ├── Profile.js        # User profile + password change
            └── Admin.js          # Admin panel — manage candidates
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- npm

### 1. Clone the repository
```bash
git clone https://github.com/ayanpaul14/voting-app.git
cd voting-app
```

### 2. Set up the backend
```bash
npm install
```

Create a `.env` file in the root folder:
```env
PORT=3000
MONGODB_URL_LOCAL=mongodb://127.0.0.1:27017/voting_app
JWT_SECRET=your_long_random_secret_here
```

Generate a secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Start the backend:
```bash
node server.js
```

### 3. Set up the frontend
```bash
cd voting-frontend
npm install
```

Create a `.env` file inside `voting-frontend`:
```env
PORT=5173
REACT_APP_API_URL=http://localhost:3000
```

Start the frontend:
```bash
npm start
```

### 4. Open the app
```
http://localhost:5173
```

---

## API Reference

### User Routes — `/user`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/signup` | None | Register a new voter |
| POST | `/login` | None | Login and get JWT token |
| GET | `/profile` | Voter/Admin | Get logged-in user profile |
| PUT | `/profile/password` | Voter/Admin | Change password |
| GET | `/voters` | Admin | Get all voters |
| PUT | `/block/:userId` | Admin | Block or unblock a voter |

### Candidate Routes — `/candidate`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | None | Get all candidates |
| POST | `/` | Admin | Add a new candidate |
| PUT | `/:candidateID` | Admin | Update a candidate |
| DELETE | `/:candidateID` | Admin | Delete a candidate |
| POST | `/vote/:candidateID` | Voter | Cast a vote |
| GET | `/vote/count` | None | Get live vote counts |

---

## Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Port for the backend server (default: 3000) |
| `MONGODB_URL_LOCAL` | MongoDB connection string |
| `JWT_SECRET` | Secret key for signing JWT tokens |

> Never commit your `.env` file. It is listed in `.gitignore`.

---

## Key Design Decisions

- **Aadhar as identity** — unique 12-digit identifier used instead of email for Indian voter context
- **Role in JWT payload** — admin role is embedded in the token so middleware doesn't need an extra DB call on every request
- **POST for voting** — vote endpoint uses POST not GET to prevent accidental re-submission via browser cache or link sharing
- **Parallel DB calls** — candidate and user are fetched simultaneously with `Promise.all` during voting for better performance
- **One admin only** — system enforces a single admin account to prevent privilege escalation

---

## Future Improvements

- [ ] Email/OTP verification on signup
- [ ] Rate limiting with `express-rate-limit`
- [ ] Real-time results with WebSockets
- [ ] Add election phases (scheduled, open, closed)
- [ ] Pie chart in addition to bar chart on results page

---

## Author

**Ayan Paul**
- GitHub: [@ayanpaul14](https://github.com/ayanpaul14)

---

## License

This project is open source and available under the [MIT License](LICENSE).
