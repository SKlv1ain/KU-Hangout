import React, { useEffect, useState } from "react";
import { getUsers } from "./services/api";

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUsers()
      .then(response => {
        setUsers(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching users:", error); //couldn't find user
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <h2>Loading users...</h2>;
  }

  return (
    <div>
      <h1>Users List</h1>
      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <ul>
          {users.map(user => (
            <li key={user.id}>
              <strong>{user.username}</strong> — Role: {user.role}, Contact: {user.contact}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default UsersPage;
