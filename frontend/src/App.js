import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import UsersPage from "./UserPage";
import { createUser } from "./services/api";

function App() {
  const handleCreateUser = async () => {
    try {
      const response = await createUser({
        "username": "jame",
        "password": "jamepass",
        "email": "jame@example.com"
      });
      console.log("User created:", response.data);
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  return (
    <Router>
      <nav>
        <Link to="/">Home</Link> |{" "}
        <Link to="/users">Check Users</Link>
      </nav>
      
      <Routes>
        <Route path="/" element={
          <div>
            <h1>Create User</h1>
            <button onClick={handleCreateUser}>Create Test User</button>
          </div>
        } />
        <Route path="/users" element={<UsersPage />} />
      </Routes>
    </Router>
  );
}

export default App;
