import Logo from "../Kasir/assets/logo.png";
import "./sidebar.css";
import { Link, useNavigate } from "react-router-dom";
import Idashboard from "../Kasir/assets/dashboard.png";
import Ikasir from "../Kasir/assets/pos-system.png";
import Iproduk from "../Kasir/assets/products.png";
import Ilaporan from "../Kasir/assets/report.png";
import Ikeluar from "../Kasir/assets/exit.png";
import { supabase } from "../../supabase/supabaseClient";

export default function Sidebar() {
  async function signOut() {
    await supabase.auth.signOut();
    useNavigate("/");
  }
  return (
    <div>
      <div className="sidebar">
        <div className="logo">
          <img src={Logo} alt="Logo" />
          <span>Warjo ID</span>
        </div>
        <div className="list">
          <ul>
            <Link to="/dashboard">
              <li>
                <img src={Idashboard} alt="" />
                Dashboard
              </li>
            </Link>
            <Link to="/kasir">
              <li>
                <img src={Ikasir} alt="" />
                Kasir
              </li>
            </Link>

            <Link to="/produk">
              <li>
                <img src={Iproduk} alt="" />
                Produk
              </li>
            </Link>
            <Link to="/laporan">
              <li>
                <img src={Ilaporan} alt="" />
                Laporan
              </li>
            </Link>
            <Link to="/" onClick={signOut}>
              <li>
                <img src={Ikeluar} alt="" />
                Keluar
              </li>
            </Link>
          </ul>
        </div>
      </div>
    </div>
  );
}
