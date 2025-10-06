import { useState } from "react";
import { supabase } from "./supabaseClient";
import { useNavigate, Link } from "react-router-dom";
import "./login-register.css";


function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleRegister(e) {
    e.preventDefault();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: 'http://localhost:5173/login',
      }
    });

    if (error) {
      console.error("Error signing up:", error.message);
      alert("Error signing up: " + error.message);
    } else {
      console.log("Sign-up successful:", data);
      alert(
        "Sign-up successful! Please check your email to confirm your account."
      );
      navigate("/login");
    }
  }

  return (
    <div className="auth-container">
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
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
        <button type="submit">Sign Up</button>
      </form>
      <p>
        Sudah punya akun? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}

export default Register;