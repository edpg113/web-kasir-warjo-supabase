import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../supabase/supabaseClient";
import Sidebar from "../../components/Sidebar";
import Monitoring from "../components/Monitoring";
import "../style/monitoring.css";
// import Stock from "../../Kasir/assets/stock.png";
import Money from "../../Kasir/assets/money.png";
import DownTrend from "../../Kasir/assets/downtrend.png";
import UpTrend from "../../Kasir/assets/uptrend.png";

export default function Dashboard() {
  const [session, setSession] = useState(null);
  // const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalPenjualanHariIni: 0,
    totalSeluruhPenjualan: 0,
    totalPengeluaran: 0,
  });

  const checkUser = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      if (!session) {
        navigate("/");
      }
      // setLoading(false);
    } catch (error) {
      console.error("Error checking auth:", error);
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        navigate("/");
      }
    });

    // Initial session check
    checkUser();

    // Cleanup subscription
    return () => subscription?.unsubscribe();
  }, [navigate, checkUser]);

  useEffect(() => {
    if (session) {
      fetchStats();
      getProfiles();
    }
  }, [session]);

  const fetchStats = async () => {
    // ambil data penjualan hari ini
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

      // ambil data seluruh penjualan

      const { data: seluruhPenjualan, error: errorSeluruhPenjualan } =
        await supabase.from("transaksi_sales").select("total");

      if (errorSeluruhPenjualan) {
        console.error("Error fetching total sales:", errorSeluruhPenjualan);
      }

      const totalSeluruhPenjualan =
        seluruhPenjualan?.reduce((sum, record) => sum + record.total, 0) || 0;

      // ambil total pengeluaran
      const { data: pengeluaran } = await supabase
        .from("transaksi_pengeluaran")
        .select("jumlah");

      const totalPengeluaran =
        pengeluaran?.reduce((sum, record) => sum + record.jumlah, 0) || 0;

      // hitung total saldo akhir
      const totalSaldoAkhir = totalSeluruhPenjualan - totalPengeluaran;

      setStats({
        // ...stats,
        totalPenjualanHariIni,
        totalPengeluaran,
        totalSeluruhPenjualan: totalSaldoAkhir,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  async function getProfiles() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
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
            <img src={UpTrend} alt="" />
            <span className="stockup">Cash Inflow</span>
          </div>

          <div className="card">
            <h4>Total Pengeluaran</h4>
            <p>Rp. {stats.totalPengeluaran.toLocaleString("id-ID")}</p>
            <img src={DownTrend} alt="" />
            <span className="stockdown">Cash Outflow </span>
          </div>

          <div className="card">
            <h4>Total Uang Toko</h4>
            <p>Rp. {stats.totalSeluruhPenjualan.toLocaleString("id-ID")}</p>
            <img src={Money} alt="" />
            <span className="stockup">Cash Balance</span>
          </div>
        </div>
        <Monitoring />
      </div>
    </div>
  );
}
