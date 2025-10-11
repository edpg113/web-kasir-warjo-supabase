import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../supabase/supabaseClient";
import Sidebar from "../../components/Sidebar";
import Monitoring from "../components/Monitoring";
import "../style/monitoring.css";
import Stock from "../../Kasir/assets/stock.png";
import Money from "../../Kasir/assets/money.png";

export default function Dashboard() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalPenjualanHariIni: 0,
    totalProdukTersedia: 0,
    produkTerjual: 0,
    totalSeluruhPenjualan: 0,
  });

  useEffect(() => {
    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        navigate("/");
      }
    });

    // Initial session check
    checkUser();

    // Cleanup subscription
    return () => subscription?.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (session) {
      fetchStats();
      getProfiles();
    }
  }, [session]);

  async function checkUser() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (!session) {
        navigate("/");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error checking auth:", error);
      navigate("/");
    }
  }

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

  async function getProfiles() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user");

      const { data, error } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .single();
      
      if (error) throw error;
      setDisplayName(data.display_name);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  }

  // if (loading) {
  //   return <div>Loading...</div>;
  // }

  if (!session) {
    return null;
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