import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useEffect, useState } from "react";
import "../style/monitoring.css";
import { supabase } from "../../../supabase/supabaseClient";

export default function Monitoring() {
  const [data, setData] = useState([]);
  const [mode, setMode] = useState("harian");

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (mode === "harian") {
          // Ambil semua transaksi detail lalu agregasi di sisi client
          const { data: result, error } = await supabase
            .from("transaksi_sales_detail")
            .select("tanggal, subtotal")
            .order("tanggal", { ascending: true });

          if (error) {
            console.error("Error fetching harian:", error);
            return;
          }

          // Group by tanggal
          const grouped = result.reduce((acc, curr) => {
            const tgl = curr.tanggal.split("T")[0]; // YYYY-MM-DD
            if (!acc[tgl]) acc[tgl] = 0;
            acc[tgl] += curr.subtotal;
            return acc;
          }, {});

          const formatted = Object.entries(grouped).map(([tanggal, totalPendapatan]) => ({
            tanggal,
            totalPendapatan,
          }));

          setData(formatted);
        } else {
          // Mode bulanan → gunakan fungsi RPC di Supabase
          const { data: result, error } = await supabase.rpc("get_pendapatan_bulanan");
          if (error) {
            console.error("Error fetching bulanan:", error);
            return;
          }
          setData(result);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [mode]);

  // Format tanggal harian
  const formatTanggalIndo = (tanggalStr) => {
    const tanggal = new Date(tanggalStr);
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(tanggal);
  };

  // Format bulan (dari "YYYY-MM")
  const formatBulanIndo = (bulanStr) => {
    const [tahun, bulan] = bulanStr.split("-");
    const tanggal = new Date(tahun, bulan - 1);
    return new Intl.DateTimeFormat("id-ID", {
      month: "long",
      year: "numeric",
    }).format(tanggal);
  };

  return (
    <div className="chart-container">
      <h2>Statistik Pendapatan</h2>

      <select value={mode} onChange={(e) => setMode(e.target.value)}>
        <option value="harian">Per Hari</option>
        <option value="bulanan">Per Bulan</option>
      </select>

      <ResponsiveContainer width="100%" height={300} className="cart-responsive">
        <BarChart data={data} margin={{ top: 20, right: 0, bottom: 0, left: 50 }}>
          <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
          <XAxis
            dataKey={mode === "harian" ? "tanggal" : "bulan"}
            tickFormatter={mode === "harian" ? formatTanggalIndo : formatBulanIndo}
          />
          <YAxis tickFormatter={(value) => `Rp ${value.toLocaleString("id-ID")}`} />
          <Tooltip
            formatter={(value) => `Rp ${value.toLocaleString("id-ID")}`}
            labelFormatter={mode === "harian" ? formatTanggalIndo : formatBulanIndo}
          />
          <Bar dataKey={mode === "harian" ? "totalPendapatan" : "totalpendapatan"} fill="#28a745" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
