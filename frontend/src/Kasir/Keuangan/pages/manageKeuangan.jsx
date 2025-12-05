import Sidebar from "../../components/Sidebar";
import "../style/keuangan.scss";
import { useState, useEffect } from "react";
import { supabase } from "../../../supabase/supabaseClient";
import moment from "moment-timezone";
import Money from "../../Kasir/assets/money.png";
import Swal from "sweetalert2";
import DownTrend from "../../Kasir/assets/downtrend.png";

export default function Keuangan() {
  const [tanggal, setTanggal] = useState("");
  const [dataPengeluaran, setDataPengeluaran] = useState([]);
  const [keterangan, setKeterangan] = useState("");
  const [jumlahUang, setJumlahUang] = useState("");
  const [stats, setStats] = useState({
    totalPenjualanHariIni: 0,
    totalSeluruhPenjualan: 0,
    totalPengeluaran: 0,
  });

  useEffect(() => {
    fetchStats();
    // fetchDataPengeluaran();
  }, []);

  useEffect(() => {
    fetchDataPengeluaran();
  }, [tanggal])

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

  const simpanPengeluaran = async (e) => {
    e.preventDefault();

    try {
      const { error } = await supabase.from("transaksi_pengeluaran").insert([
        {
          keterangan,
          jumlah: Number(jumlahUang),
          tanggal: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error("Error inserting expenditure:", error);
        alert("Gagal menyimpan pengeluaran.");
      } else {
        fetchStats();
        fetchDataPengeluaran();
        setKeterangan("");
        setJumlahUang("");
        Swal.fire({
          icon: "success",
          title: "Laporan berhasil disimpan",
          text: "Cek data pengeluaran terbaru di tabel riwayat pengeluaran.",
        });
      }
    } catch (error) {
      console.error("Error saving expenditure:", error);
      alert("Gagal menyimpan pengeluaran.");
    }
  };

  const fetchDataPengeluaran = async () => {
    try {
        let query = supabase.from("transaksi_pengeluaran").select("*");

        if (tanggal) {
          // Filter by selected date
          const start = moment.tz(tanggal, "Asia/Jakarta").startOf("day").toISOString();
          const end = moment.tz(tanggal, "Asia/Jakarta").endOf("day").toISOString();
          query = query.gte("tanggal", start).lte("tanggal", end);
        }

        const { data, error } = await query.order("tanggal", { ascending: false });

      if (error) {
        console.error("Error fetching expenditure data:", error);
        return;
      }
      setDataPengeluaran(data);
    } catch (error) {
      console.error("Error fetching expenditure data:", error);
    }
  };

  return (
    <div>
      <Sidebar />
      <div className="keuangan-container">
        <h1>Halaman Keuangan</h1>
        <div className="info-cards">
          <div className="card">
            <h4>Total Uang Toko</h4>
            <p>Rp. {stats.totalSeluruhPenjualan.toLocaleString("id-ID")}</p>
            <img src={Money} alt="" />
            <span className="stockup">Cash Balance</span>
          </div>

          <div className="card">
            <h4>Total Pengeluaran</h4>
            <p>Rp. {stats.totalPengeluaran.toLocaleString("id-ID")}</p>
            <img src={DownTrend} alt="" />
            <span className="stockdown">Cash Outflow</span>
          </div>
        </div>
        <div className="container-form-manage-uang">
          <form onSubmit={simpanPengeluaran}>
            <h2>Manage Uang Toko</h2>
            <div className="group-input">
              <p>Keterangan : </p>
              <input
                type="text"
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
              />
              <p>Jumlah uang yang digunakan :</p>
              <input
                type="number"
                value={jumlahUang}
                onChange={(e) => setJumlahUang(e.target.value)}
              />
              <button>Simpan</button>
            </div>
          </form>
        </div>
        <div className="tabel-keuangan">
          <h2>Riwayat Pengeluaran Uang Toko</h2>
          <div className="filter">
            <p>
              Pilih tanggal :{" "}
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
              />
            </p>
          </div>
          <table>
            <thead>
              <tr>
                {/* <th>No</th> */}
                <th>Keterangan</th>
                <th>Jumlah Pengeluaran</th>
                <th>Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {dataPengeluaran.map((item) => (
                <tr key={item.id}>
                  {/* <td>{item.id}</td> */}
                  <td>{item.keterangan}</td>
                  <td>Rp. {item.jumlah.toLocaleString("id-ID")}</td>
                  <td>
                    {moment(item.tanggal)
                      .tz("Asia/Jakarta")
                      .format("DD-MM-YYYY HH:mm")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
