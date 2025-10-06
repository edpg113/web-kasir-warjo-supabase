import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import "../style/laporan.css";
import moment from "moment-timezone";
import Swal from "sweetalert2";
import { supabase } from "../../../supabase/supabaseClient";
import * as XLSX from "xlsx";

export default function Laporan() {
  const [tanggal, setTanggal] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // Format YYYY-MM-DD
  });

  const [transaksi, setTransaksi] = useState([]);
  const [selectedTransaksi, setSelectedTransaksi] = useState(null);
  const [detail, setDetail] = useState([]);

  useEffect(() => {
    fetchTransaksi();
  }, [tanggal]);

  const formatTanggal = moment(tanggal).format("YYYY-MM-DD");
  const fetchTransaksi = async () => {
    try {
      const { data, error } = await supabase
        .from("transaksi_sales")
        .select("*")
        .gte("tanggal", formatTanggal)
        .lt(
          "tanggal",
          moment(formatTanggal).add(1, "days").format("YYYY-MM-DD")
        )
        .order("id", { ascending: false });
      setTransaksi(data);
    } catch (error) {
      console.error("Error fetching transaksi:", error);
      alert("Gagal mengambil data transaksi. Silakan coba lagi.");
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [selectedTransaksi]);

  const fetchDetail = async () => {
    if (selectedTransaksi) {
      try {
        const { data, error } = await supabase
          .from("transaksi_sales_detail")
          .select("*")
          .eq("transaksi_id", selectedTransaksi.transaksi_id);

        if (error) {
          console.error("Error fetching detail:", error);
          Swal.fire({
            icon: "error",
            title: "Gagal mengambil detail transaksi",
            text: "Silakan coba lagi.",
          });
          setDetail([]);
        } else {
          setDetail(data);
        }
      } catch (error) {
        console.error("Error fetching detail:", error);
        Swal.fire({
          icon: "error",
          title: "Gagal mengambil detail transaksi",
          text: "Silakan coba lagi.",
        });
        setDetail([]);
      }
    } else {
      setDetail([]);
    }
  };
  // download laporan
  const downloadLaporan = async () => {
    try {
      // ambil data transaksi dari database
      const { data, error } = await supabase
        .from("transaksi_sales_detail")
        .select("*")
        .gte("tanggal", formatTanggal)
        .lt(
          "tanggal",
          moment(formatTanggal).add(1, "days").format("YYYY-MM-DD")
        );

      if (error) {
        console.error("Error mengambil data:", error);
        Swal.fire({
          icon: "error",
          title: "Gagal mengambil data",
          text: "Silakan coba lagi.",
        });
        return;
      }
      if (!data || data.length === 0) {
        Swal.fire({
          icon: "warning",
          title: "Data kosong",
          text: "Tidak ada transaksi detail pada tanggal ini.",
        });
        return;
      }

      // ubah data ke worksheet
      const worksheet = XLSX.utils.json_to_sheet(data);

      // buat workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan");

      // export ke blob
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });

      // simpan file
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      // bikin URL sementara
      const url = URL.createObjectURL(blob);

      // bikin <a> untuk trigger download
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `laporan sales tanggal ${formatTanggal}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // hapus object URL dari memory
      URL.revokeObjectURL(url);

      Swal.fire({
        icon: "success",
        title: "Laporan berhasil diunduh",
        text: "Cek file Excel di folder unduhan",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Laporan gagal diunduh",
        // text: "Cek file Excel di folder unduhan",
      });
      console.log(error);
    }
  };

  return (
    <div>
      <Sidebar />
      <div className="laporan-container">
        <h1>Laporan Transaksi</h1>
        <div className="filter-tanggal">
          <label>Pilih Tanggal: </label>
          <input
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
          />
          <button onClick={downloadLaporan}>Export ke Excel</button>
        </div>

        <div className="transaksi-list">
          {transaksi.length > 0 ? (
            transaksi.map((trx) => (
              <div
                key={trx.id}
                className="transaksi-box"
                onClick={() => setSelectedTransaksi(trx)}
              >
                <p>
                  <strong>ID:</strong> {trx.transaksi_id}
                </p>
                <p>
                  <strong>Waktu:</strong>{" "}
                  {moment(trx.tanggal)
                    .tz("Asia/Jakarta")
                    .format("DD-MM-YYYY HH:mm")}
                </p>
                <p>
                  <strong>Total:</strong> Rp {trx.total.toLocaleString("id-ID")}
                </p>
              </div>
            ))
          ) : (
            <p>Tidak ada transaksi di tanggal ini</p>
          )}
        </div>

        {selectedTransaksi && (
          <div
            className="modal-overlay"
            onClick={() => setSelectedTransaksi(null)}
          >
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3 style={{ paddingBottom: "10px" }}>Detail Transaksi</h3>
              <p>No. Transaksi : {selectedTransaksi.transaksi_id}</p>
              <p>
                Waktu :{" "}
                {selectedTransaksi.tanggal
                  ? moment(selectedTransaksi.tanggal)
                      .tz("Asia/Jakarta")
                      .format("DD-MM-YYYY HH:mm")
                  : "Tidak ada waktu transaksi"}
              </p>
              <p>Payment : {selectedTransaksi.payment}</p>
              {detail.length > 0 ? (
                <table border="1">
                  <thead>
                    <tr>
                      <th>Produk</th>
                      <th>Qty</th>
                      <th>Harga</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.namaProduk}</td>
                        <td>{item.qty}</td>
                        <td>Rp. {item.harga.toLocaleString("id-ID")}</td>
                        <td>Rp. {item.subtotal.toLocaleString("id-ID")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>Tidak ada detail</p>
              )}
              <div className="modal-footer">
                <h4>
                  Total : Rp. {selectedTransaksi.total.toLocaleString("id-ID")}
                </h4>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
