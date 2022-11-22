import React, { useState, useEffect } from "react";
import { getUserById } from "./controller/user_query";
function App() {
  const [user, setUsers] = useState(false);
  useEffect(() => {
    getUsers();
  }, []);
  function getUsers() {
    fetch("http://localhost:3000")
      .then((response) => {
        return response.text();
      })
      .then((data) => {
        setUsers(data);
      });
  }
  function createUser() {
    let email = prompt("Enter email");
    let password = prompt("Enter Password");
    fetch("http://localhost:3000/quatro_user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password, email }),
    })
      .then((response) => {
        return response.text();
      })
      .then((data) => {
        alert(data);
        getUsers();
      });
    time;
  }
  function deleteUser() {
    let id = prompt("Enter User id");
    fetch(`http://localhost:3000/quatro_user/${id}`, {
      method: "DELETE",
    })
      .then((response) => {
        return response.text();
      })
      .then((data) => {
        alert(data);
        getUsers();
      });
  }
  return (
    <div>
      {users ? users : "There is no user data available"}
      <br />
      <button onClick={createUser}>Add merchant</button>
      <br />
      <button onClick={deleteUser}>Delete merchant</button>
      <br />
      <button onClick={getUserById}>get user</button>
    </div>
  );
}
export default App;
