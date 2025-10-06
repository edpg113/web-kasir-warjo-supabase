import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../style/login.css";
import Swal from "sweetalert2";
import Icon from "../../Kasir/assets/logo.png";
import { supabase } from "../../../supabase/supabaseClient";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");

  const navigate = useNavigate();

  async function handleRegister(e) {
    e.preventDefault();

    const initial = displayName && displayName.trim() !== "" ? displayName : email;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: "http://localhost:5173/",
        data: {display_name: initial},
      },
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
        title: "Registrasi Gagal!",
      });
      navigate("/register");
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
        title: "Registrasi Berhasil! Silahkan cek email anda untuk verifikasi",
      });
      setTimeout(() => {
        navigate("/");
      }, 1000);
    }
  }

  return (
    <div className="containerLogin">
      <div className="box">
        <div className="icon">
          <img src={Icon} alt="" />
        </div>
        <form onSubmit={handleRegister}>
          <h1>Register</h1>
           <input
            type="text"
            placeholder="nama pengguna"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
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
          <button>SignUp</button>
        </form>
        <p style={{ padding: "10px", fontSize: "14px" }}>
          Sudah punya akun? <Link to="/">Login</Link>
        </p>
      </div>
    </div>
  );
}
