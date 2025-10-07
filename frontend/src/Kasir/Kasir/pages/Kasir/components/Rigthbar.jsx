import { useState, useEffect, useRef } from "react";
import "../style/rightbar.css";
import Swal from "sweetalert2";
import Done from "../../../assets/done2.gif";
import Cart from "../../../assets/cart.png";
import Struk from "./Struk";
import { supabase } from "../../../../../supabase/supabaseClient";

export default function Rigthbar({
  cartItems,
  removeFromCart,
  fetchMenu,
  clearCart,
}) {
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("tunai");
  const [uangKonsumen, setUangKonsumen] = useState("");
  const [showPaymentDetailsModal, setShowPaymentDetailsModal] = useState(false);
  const [transaksiDetails, setTransaksiDetails] = useState(null);
  const [countdown, setCountdown] = useState(10);

  const totalHarga = cartItems.reduce(
    (total, item) => total + item.hargaProduk * item.qty,
    0
  );

  useEffect(() => {
    let timer;
    if (showPaymentDetailsModal && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setShowPaymentDetailsModal(false);
      clearCart();
      setUangKonsumen("");
    }
    return () => clearInterval(timer);
  }, [showPaymentDetailsModal, countdown]);

  const kembalian = uangKonsumen - totalHarga;

  function generateKodeTransaksi() {
    const tanggal = new Date();
    const tahun = tanggal.getFullYear();
    const bulan = String(tanggal.getMonth() + 1).padStart(2, "0");
    const hari = String(tanggal.getDate()).padStart(2, "0");
    const random = Math.floor(1000 + Math.random() * 9000); // angka 4 digit

    return `TRX${tahun}${bulan}${hari}${random}`;
  }

  const handleBayar = async () => {
    const uang = Number(uangKonsumen);
    if (!uang || uang < totalHarga) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Uang konsumen kurang!",
      });
      return;
    }

    const kodeTransaksi = generateKodeTransaksi();

    try {
      // hitung total qty (jumlahkan qty tiap item, bukan hanya jumlah baris)
      const totalQty = cartItems.reduce((s, it) => s + (it.qty || 0), 0);

      // 1) Insert header transaksi dan ambil id yang dibuat
      const { data: headerData, error: headerError } = await supabase
        .from("transaksi_sales")
        .insert([
          {
            // jika ingin menyimpan ringkasan nama produk di header:
            qty: totalQty,
            total: totalHarga,
            transaksi_id: kodeTransaksi,
            payment: paymentMethod,
          },
        ])
        .select(); // penting supaya Supabase mengembalikan row yang baru dibuat

      if (headerError) throw headerError;

      // 2) Siapkan data detail per item (satu row per produk yang dibeli)
      const details = cartItems.map((item) => ({
        transaksi_id: kodeTransaksi, // pastikan nama kolom sesuai DB
        produk_id: item.id ?? null, // kalau ada referensi produk
        namaProduk: item.namaProduk, // atau nama_produk sesuai kolom DB
        harga: item.hargaProduk,
        qty: item.qty,
        subtotal: item.hargaProduk * item.qty,
        payment: paymentMethod,
      }));

      // 3) Insert semua detail sekaligus
      const { data: detailData, error: detailError } = await supabase
        .from("transaksi_sales_detail")
        .insert(details);

      if (detailError) throw detailError;

      // 4) Update stok di tabel produk
      for (const item of cartItems) {
        const { error: ProdukError } = await supabase.rpc("decrement_stok", {
          pid: item.id,
          pqty: item.qty,
        });

        if (ProdukError) {
          console.error(
            "Error updating stock for product ID",
            item.id,
            ":",
            ProdukError
          );
        }
      }

      // 5) Siapkan data untuk tampil di struk/modal
      setTransaksiDetails({
        id: kodeTransaksi,
        total: totalHarga,
        uangDibayarkan: uang,
        kembalian: uang - totalHarga,
        metodePembayaran: paymentMethod,
        items: cartItems,
      });

      // refresh & UI
      fetchMenu();
      setShowCheckoutModal(false);
      setCountdown(10);
      setShowPaymentDetailsModal(true);
      setUangKonsumen("");
    } catch (error) {
      console.error("Gagal menyelesaikan transaksi:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Terjadi kesalahan saat menyimpan transaksi. Cek console untuk detail.",
      });
    }
  };

  const strukRef = useRef(null);

  const handleCetakStruk = () => {
    window.print();
    clearCart();
    setShowPaymentDetailsModal(false);
    setUangKonsumen("");
  };

  const handleSelesai = () => {
    clearCart();
    setShowPaymentDetailsModal(false);
    setUangKonsumen("");
  };

  return (
    <div className="rightbar">
      <div className="receipt">
        <h2>
          <img src={Cart} alt="" />
          Keranjang
        </h2>
        <hr />
        <ul className="cart-items">
          {cartItems.length > 0 ? (
            cartItems.map((item) => (
              <li key={item.id}>
                <div className="row">
                  <span>
                    {item.namaProduk} x{item.qty}&nbsp;
                  </span>
                  <span> Rp {item.hargaProduk.toLocaleString("id-ID")}</span>
                  <button onClick={() => removeFromCart(item.id)}>X</button>
                </div>
                {item.catatan && (
                  <div className="catatan">Note : {item.catatan}</div>
                )}
              </li>
            ))
          ) : (
            <li>Keranjang Kosong</li>
          )}
        </ul>
        <hr />
        <div className="total">
          <p>Total : </p>
          <p>Rp. {totalHarga.toLocaleString("id-ID")}</p>
        </div>
        <button
          className="checkout-button"
          onClick={() => setShowCheckoutModal(true)}
        >
          Checkout
        </button>
      </div>

      {showCheckoutModal && (
        <div className="checkout-modal">
          <div className="modal-content">
            <ul>
              <li>
                <p>
                  Total Produk: <br /> {cartItems.length}
                </p>
              </li>
              <li>
                <p>
                  Total Harga: <br /> Rp. {totalHarga.toLocaleString("id-ID")}
                </p>
              </li>
              <li>
                <p>
                  Kembalian: <br /> Rp. {kembalian.toLocaleString("id-ID")}
                </p>
              </li>
            </ul>

            <label>Nominal Uang Konsumen:</label>
            <input
              type="number"
              value={uangKonsumen}
              onChange={(e) => setUangKonsumen(parseInt(e.target.value))}
            />

            <label>Metode Pembayaran:</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="tunai">Tunai</option>
              <option value="non-tunai">Non-Tunai</option>
            </select>

            <div className="modal-buttons">
              <button onClick={() => setShowCheckoutModal(false)}>
                Kembali
              </button>
              <button onClick={handleBayar}>Bayar</button>
            </div>
          </div>
        </div>
      )}

      {showPaymentDetailsModal && (
        <div className="payment-details-modal">
          <div className="modal-content">
            <div className="head">
              <div className="icon">
                <img src={Done} alt="done" />
              </div>
              <h2>Pembayaran Berhasil!</h2>
              <p>Transaksi telah berhasil diproses</p>
            </div>
            {transaksiDetails && (
              <div className="list-items">
                <ul>
                  <li>
                    No. Transaksi <span>{transaksiDetails.id}</span>
                  </li>
                  <li>
                    Total Bayar{" "}
                    <span>
                      Rp. {transaksiDetails.total.toLocaleString("id-ID")}
                    </span>
                  </li>
                  <li>
                    Kembalian{" "}
                    <span>
                      Rp. {transaksiDetails.kembalian.toLocaleString("id-ID")}
                    </span>
                  </li>
                </ul>
              </div>
            )}

            <div className="modal-buttons">
              <button className="cetak" onClick={handleCetakStruk}>
                Cetak Struk
              </button>
              <button className="selesai" onClick={handleSelesai}>
                Selesai
              </button>
            </div>
            <p className="countdown">
              Modal akan tertutup dalam {countdown} detik
            </p>
          </div>
        </div>
      )}
      <div
        style={{ display: "none", position: "absolute", top: 0, left: 0 }}
        className="struk-container"
        ref={strukRef}
      >
        {transaksiDetails && <Struk transaksiDetails={transaksiDetails} />}
      </div>
    </div>
  );
}
