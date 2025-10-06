import { useState } from "react";
import { supabase } from "./supabaseClient";
import { useNavigate, Link } from "react-router-dom";
import "./login-register.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Error Login:", error.message);
      alert("Error Login : " + error.message);
    } else {
      console.log("Login successful:", data);
      alert(
        "Login successful! Welcome back."
      );
        navigate("/index");
    }
  }

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
      <p>
        Belum punya akun? <Link to="/">Register</Link>
      </p>
    </div>
  );
}

export default Login;