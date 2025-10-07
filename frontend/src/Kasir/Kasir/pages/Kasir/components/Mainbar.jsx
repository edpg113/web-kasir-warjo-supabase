import React, { useState, useEffect } from "react";
import "../style/mainbar.css";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function Mainbar({
  selectedCategory,
  setSelectedCategory,
  addTocart,
  menu,
  loading,
}) {
  const [qtyInputs, setQtyInputs] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalItem, setModalItem] = useState(null);
  const [modalQty, setModalQty] = useState(1);
  const [catatan, setCatatan] = useState("");

  useEffect(() => {
    setQtyInputs([]);
  }, []);

  // Filter
  const filteredMenu = selectedCategory
    ? menu.filter((item) => item.kategori === selectedCategory)
    : menu;

  const handleQtyChange = (id, qty) => {
    setQtyInputs((prev) => ({
      ...prev,
      [id]: qty,
    }));
  };

  // Buka modal saat tombol "Beli" diklik
  const handleBeliClick = (item) => {
    setModalItem(item);
    // setModalQty(qtyInputs[item.id] || 1);
    setModalQty(1); // selalu mulai dari 1 setiap buka modal
    setCatatan("");
    setShowModal(true);
  };

  // Tambah ke keranjang dan tutup modal
  const handleModalSubmit = (e) => {
    e.preventDefault();
    addTocart({ ...modalItem, catatan: catatan }, modalQty);
    setQtyInputs((prev) => ({
      ...prev,
      [modalItem.id]: modalQty,
    }));
    setShowModal(false);
  };

  return (
    <div className="mainbar">
      <div className="navbar">
        <h1>Kasir</h1>
      </div>
      <div className="filtered">
        <ul>
          <li onClick={() => setSelectedCategory("")}>
            <button>Semua</button>
          </li>
          <li onClick={() => setSelectedCategory("makanan")}>
            <button>Makanan</button>
          </li>
          <li onClick={() => setSelectedCategory("cemilan")}>
            <button>Cemilan</button>
          </li>
          <li onClick={() => setSelectedCategory("kopi")}>
            <button>Kopi</button>
          </li>
          <li onClick={() => setSelectedCategory("non-kopi")}>
            <button>Non-Kopi</button>
          </li>
        </ul>
      </div>
      <div className="flex">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="container">
              <Skeleton height={150} />
              <Skeleton height={100} />
              <Skeleton height={80} />
            </div>
          ))
        ) : filteredMenu.length > 0 ? (
          filteredMenu.map((item) => (
            <div className="container" key={item.id}>
              <div className="icon">
                <img src={item.gambar} alt={item.produk} />
              </div>
              <p>{item.namaProduk}</p>
              <div className="menuItem">
                <div className="menuInfo">
                  <h4 className="price">
                    Rp. {item.hargaProduk.toLocaleString("id-ID")}
                    <p>{item.qty > 0 ? `(${item.qty})` : "Habis"}</p>
                  </h4>

                  <button onClick={() => handleBeliClick(item)}>Beli</button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="no-data">Tidak ada menu tersedia</p>
        )}
      </div>
      {/* Modal */}
      {showModal && (
        <div className="boxModal">
          <form onSubmit={handleModalSubmit}>
            <h3>Tambahkan Catatan</h3>
            <h3>{modalItem.namaProduk}</h3>
            <div>
              <label>Qty : </label>
              <input
                type="number"
                min="1"
                value={modalQty}
                onChange={(e) => setModalQty(parseInt(e.target.value))}
                style={{ width: "60px", border: "none", margin: "10px" }}
              />
            </div>

            <textarea
              placeholder="Tambahkan catatan (opsional)"
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                boxSizing: "border-box",
                resize: "none", // Mencegah perubahan ukuran
                minHeight: "80px", // Tinggi minimal textarea
              }}
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
            ></textarea>

            <div
              style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}
            >
              <button
                style={{
                  width: "70px",
                  height: "35px",
                  background: "rgb(54, 52, 52)",
                  border: "none",
                  color: "white",
                  borderRadius: "10px",
                  cursor: "pointer",
                }}
                type="button"
                onClick={() => setShowModal(false)}
              >
                Batal
              </button>
              <button
                style={{
                  width: "170px",
                  height: "35px",
                  background: "#28a745",
                  border: "none",
                  color: "white",
                  borderRadius: "10px",
                  cursor: "pointer",
                }}
                type="submit"
              >
                Tambah Ke Keranjang
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
