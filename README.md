# ShortcutURL

A modern URL shortener built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

- Shorten long URLs to easily shareable links
- Track click statistics for each shortened URL
- User authentication for managing your shortened URLs
- Responsive design with modern UI

## Tech Stack

- **Frontend**: React.js with Tailwind CSS and shadcn/ui components
- **Backend**: Node.js with Express.js
- **Database**: MongoDB
- **Authentication**: JWT

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Git

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/kevinduhamelhayes/shortcuturl.git
   cd shortcuturl
   ```

2. Install backend dependencies
   ```bash
   cd backend
   npm install
   ```

3. Install frontend dependencies
   ```bash
   cd ../frontend
   npm install
   ```

4. Create a `.env` file in the backend directory with the following variables:
   ```
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```

5. Start the development servers
   ```bash
   # In the backend directory
   npm run dev
   
   # In the frontend directory
   npm start
   ```

## Project Structure

```
shortcuturl/
│── backend/  (API with Express.js and MongoDB)
│   ├── config/
│   │   ├── db.js         # MongoDB connection
│   │   ├── models/
│   │   │   ├── Url.js        # URL data model
│   │   │   ├── User.js       # User data model
│   │   ├── routes/
│   │   │   ├── urlRoutes.js  # API routes for URLs
│   │   │   ├── userRoutes.js # API routes for users
│   │   ├── controllers/
│   │   │   ├── urlController.js  # URL business logic
│   │   │   ├── userController.js # User business logic
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js # Authentication middleware
│   │   ├── server.js         # Express.js server
│   │   ├── .env              # Environment variables
│   │   ├── package.json
│── frontend/  (React.js for the UI)
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/       # shadcn/ui components
│   │   │   ├── UrlForm.jsx   # Form for shortening URLs
│   │   │   ├── UrlList.jsx   # List of shortened URLs
│   │   │   ├── Navbar.jsx    # Navigation component
│   │   ├── pages/
│   │   │   ├── Home.jsx      # Home page
│   │   │   ├── Dashboard.jsx # User dashboard
│   │   │   ├── Login.jsx     # Login page
│   │   │   ├── Register.jsx  # Registration page
│   │   ├── context/
│   │   │   ├── AuthContext.jsx # Authentication context
│   │   ├── App.jsx           # Main application component
│   │   ├── index.jsx         # Entry point
│   │   ├── package.json
│── .gitignore
│── LICENSE
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Author

- Kevin Duhamel Hayes - [GitHub](https://github.com/kevinduhamelhayes) 