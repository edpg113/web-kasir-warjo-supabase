import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../style/login.css";
import Swal from "sweetalert2";
import Icon from "../../Kasir/assets/logo.png";
import { supabase } from "../../../supabase/supabaseClient";

export default function Login() {
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
      console.error("Error signing up:", error.message);
      const Toast = Swal.mixin({
        toast: true,
        position: "center",
        showConfirmButton: false,
        timer: 1000,
        // timerProgressBar: true,
        didOpen: (toast) => {
          toast.onmouseenter = Swal.stopTimer;
          toast.onmouseleave = Swal.resumeTimer;
        },
      });
      Toast.fire({
        icon: "error",
        title: "Login Gagal!",
      });
      navigate("/");
    } else {
      const Toast = Swal.mixin({
        toast: true,
        position: "center",
        showConfirmButton: false,
        timer: 1000,
        // timerProgressBar: true,
        didOpen: (toast) => {
          toast.onmouseenter = Swal.stopTimer;
          toast.onmouseleave = Swal.resumeTimer;
        },
      });
      Toast.fire({
        icon: "success",
        title: "Login Berhasil!",
      });
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    }
  }

  return (
    <div className="containerLogin">
      <div className="box">
        <div className="icon">
          <img src={Icon} alt="" />
        </div>
        <form onSubmit={handleLogin}>
          <h1>Login</h1>
          <input
            type="email"
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button>Login</button>
        </form>
        <p style={{ padding: "10px", fontSize: "14px" }}>
          Belum punya akun? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
