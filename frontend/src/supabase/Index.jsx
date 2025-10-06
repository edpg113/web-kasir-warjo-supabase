import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Index() {
  const [user, setUser] = useState([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [editUser, setEditUser] = useState(null);
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [session, setSession] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        navigate("/login");
      } else {
        setSession(data.session);
      }
    });
    getUser();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  // get data user
  async function getUser() {
    const { data, error } = await supabase.from("cafeteria").select("*");
    if (error) {
      console.log("error", error);
    } else {
      setUser(data);
      console.log("data", data);
    }
  }

  // add new user
  async function handleSubmit(e) {
    e.preventDefault();

    const { data, error } = await supabase
      .from("cafeteria")
      .insert([{ username, password, email }]); // format harus array of object

    if (error) {
      console.log("error", error);
      alert("Error adding user");
    } else {
      console.log("data", data);
      alert("User added successfully");
      // clear input
      setUsername("");
      setPassword("");
      setEmail("");
      getUser(); // refresh data user
    }
  }

  // delete user
  async function handleDetele(id) {
    const { error } = await supabase.from("cafeteria").delete().eq("id", id);

    if (error) {
      console.log("error", error);
    } else {
      setUser(user.filter((item) => item.id !== id));
      alert("User deleted successfully");
    }
  }

  // edit user
  async function handleEdit(e) {
    e.preventDefault();

    const { data, error } = await supabase
      .from("cafeteria")
      .update({ username, password, email })
      .eq("id", editUser.id);

    if (error) {
      console.log("error", error);
      alert("Error updating user");
    } else {
      console.log("data", data);
      alert("User updated successfully");

      setUser(
        user.map((item) =>
          item.id === editUser.id
            ? { ...item, username, password, email }
            : item
        )
      );

      // clear input
      setUsername("");
      setPassword("");
      setEmail("");
      setEditUser(null);
    }
  }

  // click edit button in action
  const clickEdit = (item) => {
    setEditUser(item);
    setUsername(item.username);
    setPassword(item.password);
    setEmail(item.email);
  };

  // upload image
  async function handleUpload() {
    if (!file) alert("Please select a file to upload.");

    const fileName = `${Date.now()}-${file.name}`; // nama unik biar tidak bentrok

    const { data, error } = await supabase.storage
      .from("image") // nama bucket
      .upload(fileName, file);

    if (error) {
      console.log("error", error);
      alert("Error uploading file");
    } else {
      console.log("data", data);
      alert("File uploaded successfully");
      // dapatkan public url
      const { data: urlData } = supabase.storage
        .from("image")
        .getPublicUrl(fileName);
      setImageUrl(urlData.publicUrl);
    }
  }

  return (
    <div>
      {session && (
        <div>
          <h2>Welcome, {session.user.email}</h2>
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}
      <h1>User : </h1>
      <table border="1" cellPadding="10" cellSpacing="0">
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Password</th>
            <th>Email</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {user.length > 0 ? (
            user.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.username}</td>
                <td>{item.password}</td>
                <td>{item.email}</td>
                <td>
                  <button
                    style={{ padding: "5px", margin: "10px 20px" }}
                    onClick={() => handleDetele(item.id)}
                  >
                    X
                  </button>
                  <button
                    style={{ padding: "5px", margin: "10px 20px" }}
                    onClick={() => clickEdit(item)}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3">No users found</td>
            </tr>
          )}
        </tbody>
      </table>

      <h1>New User : </h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <br />
        <input
          type="email"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <br />
        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br />
        <button type="submit">Add User</button>
      </form>

      {editUser && (
        <div>
          <h1>Edit User : </h1>
          <form onSubmit={handleEdit}>
            <input
              type="text"
              placeholder="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <br />
            <input
              type="email"
              placeholder="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <br />
            <input
              type="password"
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <br />
            <button type="submit">Update User</button>
          </form>
        </div>
      )}
      <div style={{ marginTop: "50px" }}>
        <h1>Upload Image : </h1>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button onClick={handleUpload}>Upload</button>

        {imageUrl && (
          <div>
            <h3>Preview : </h3>
            <img src={imageUrl} alt={imageUrl} width="200" />
          </div>
        )}
      </div>
    </div>
  );
}
