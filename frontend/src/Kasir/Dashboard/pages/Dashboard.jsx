import Sidebar from "../../components/Sidebar";
import Monitoring from "../components/Monitoring";
import "../style/monitoring.css";
import { useEffect, useState } from "react";
import Stock from "../../Kasir/assets/stock.png";
import Money from "../../Kasir/assets/money.png";
import { supabase } from "../../../supabase/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [session, setSession] = useState(null);
  const [displayName, setDisplayName] = useState("");
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalPenjualanHariIni: 0,
    totalProdukTersedia: 0,
    produkTerjual: 0,
    totalSeluruhPenjualan: 0,
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        navigate("/");
      } else {
        setSession(data.session);
      }
    });

    const fetchStats = async () => {
      try {
        const waktu = new Date().toISOString().slice(0, 10);
        const { data: penjualanHariIni, error: errorPenjualanHariIni } =
          await supabase
            .from("transaksi_sales")
            .select("total")
            .gte("tanggal", waktu)
            .lt("tanggal", `${waktu}T23:59:59+00:00`);

        if (errorPenjualanHariIni) {
          console.error("Error fetching today's sales:", errorPenjualanHariIni);
        }

        const totalPenjualanHariIni =
          penjualanHariIni?.reduce((sum, record) => sum + record.total, 0) || 0;

        const { data: seluruhPenjualan, error: errorSeluruhPenjualan } =
          await supabase.from("transaksi_sales").select("total");

        if (errorSeluruhPenjualan) {
          console.error("Error fetching total sales:", errorSeluruhPenjualan);
        }

        const totalSeluruhPenjualan =
          seluruhPenjualan?.reduce((sum, record) => sum + record.total, 0) || 0;

        setStats({
          ...stats,
          totalPenjualanHariIni,
          totalSeluruhPenjualan,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };
    fetchStats();
    getProfiles();
  }, []);

  async function getProfiles() {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("Error fetching user:", userError);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .single();
    if (error) {
      console.error("Error fetching profile:", error);
    } else {
      setDisplayName(data.display_name);
    }
  }

  return (
    <div className="dashboard-page">
      <Sidebar />
      <div className="main-content">
        <h1>Dashboard, 👋 {displayName ? displayName : "loading..."}</h1>
        <div className="info-cards">
          <div className="card">
            <h4>Total Penjualan Hari Ini</h4>
            <p>Rp. {stats.totalPenjualanHariIni.toLocaleString("id-ID")}</p>
            <img src={Stock} alt="" />
            <span className="stockup">Cash Inflow</span>
          </div>

          <div className="card">
            <h4>Total Uang Toko</h4>
            <p>Rp. {stats.totalSeluruhPenjualan.toLocaleString("id-ID")}</p>
            <img src={Money} alt="" />
            <span className="stockdown">Profit</span>
          </div>
        </div>
        <Monitoring />
      </div>
    </div>
  );
}
