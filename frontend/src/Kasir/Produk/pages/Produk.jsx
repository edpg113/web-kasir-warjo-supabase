import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import "../style/produk.css";
import Swal from "sweetalert2";
import { supabase } from "../../../supabase/supabaseClient";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function Produk() {
  const [namaProduk, setNamaProduk] = useState("");
  const [kategori, setKategori] = useState("");
  const [hargaBeli, setHargaBeli] = useState("");
  const [hargaProduk, setHarga] = useState("");
  const [gambar, setGambar] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [qty, setQty] = useState(""); // Default quantity
  const [menu, setMenu] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editNama, setEditNama] = useState("");
  const [editHargaBeli, setEditHargaBeli] = useState("");
  const [editHarga, setEditHarga] = useState("");
  const [editTampil, setEditTampil] = useState(false); // default false, penting untuk checkbox
  const [editQty, setEditQty] = useState("0"); // default empty
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  // Handle image selection and preview
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setGambar(file);
      setPreviewImage(URL.createObjectURL(file)); // preview instan
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();

    let publicUrl = null;

    if (gambar) {
      const fileName = `${Date.now()}-${gambar.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("image")
        .upload(fileName, gambar);

      if (uploadError) {
        console.error("Upload error", uploadError);
        Swal.fire("Error", "Gagal upload gambar.", "error");
        return;
      }

      const { data: urlData } = supabase.storage
        .from("image")
        .getPublicUrl(fileName);

      publicUrl = urlData.publicUrl;
    }

    const { data, error } = await supabase
      .from("produk")
      .insert([
        {
          namaProduk,
          hargaBeli,
          hargaProduk,
          kategori,
          qty,
          gambar: publicUrl,
          tampil: false, // Default ke false saat tambah
        },
      ])
      .select();

    if (error) {
      console.log("error", error);

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
        title: "Gagal Menambahkan Produk!",
      });
    } else {
      console.log("data : ", data);
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
        title: "Data Berhasil Di Tambahkan!",
      });
      // clear input
      setNamaProduk("");
      setHargaBeli("");
      setHarga("");
      setKategori("");
      setQty("");
      setGambar(null);
      setPreviewImage(null); // show uploaded image
      fetchMenu(); // refresh data menu
    }
  }

  async function fetchMenu() {
    try {
      const { data, error } = await supabase.from("produk").select("*");
      setMenu(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching menu data:", error);
      alert("Gagal mengambil data menu. Silakan coba lagi.");
    }
  }

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Yakin ingin menghapus produk ini ?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, Hapus!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const { data, error } = await supabase
            .from("produk")
            .delete()
            .eq("id", id);

          Swal.fire({
            title: "Deleted!",
            text: "Produk berhasil dihapus.",
            icon: "success",
          });
          fetchMenu(); // Refresh menu after deletion
          setShowEditModal(false);
        } catch (error) {
          console.error("Error deleting product:", error);
          Swal.fire("Error", "Gagal menghapus produk.", "error");
        }
      }
    });
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        navigate("/");
      } else {
        setSession(data.session);
      }
    });
    fetchMenu();
  }, []);

  // Filter
  const filteredMenu = selectedCategory
    ? menu.filter((item) => item.kategori === selectedCategory)
    : menu;

  const handleEditClick = (item) => {
    setEditItem(item);
    setEditNama(item.namaProduk);
    setEditHargaBeli(item.hargaBeli);
    setEditHarga(item.hargaProduk);
    setEditQty(item.qty);
    setEditTampil(item.tampil); // Set sesuai nilai dari database (true/false)
    setShowEditModal(true);
  };

  const handleUpdateEdit = async (e) => {
    e.preventDefault();
    try {
      const { data, erorr } = await supabase
        .from("produk")
        .update({
          namaProduk: editNama,
          hargaBeli: editHargaBeli,
          hargaProduk: editHarga,
          qty: editQty,
          tampil: editTampil, // Kirim nilai boolean langsung
        })
        .eq("id", editItem.id);

      if (erorr) {
        console.error("Error updating product:", erorr);
        Swal.fire("Error", "Gagal mengubah produk.", "error");
      } else {
        Swal.fire("Berhasil!", "Produk berhasil diubah.", "success");
        setShowEditModal(false);
        fetchMenu(); // refresh data
      }
    } catch (error) {
      console.error("Error editing product:", error);
      Swal.fire("Error", "Gagal mengubah produk.", "error");
    }
  };

  // total produk tersedia
  const totalProdukTerdisplay = menu.filter(
    (item) => item.qty > 0 && item.tampil === true // Perbaiki kondisi filter
  ).length;

  // total produk habis
  const totalProdukHabis = menu.filter((item) => item.qty === 0).length;

  return (
    <div>
      <Sidebar />
      <div className="mainbarProduk">
        <h1>Tambah Produk Baru</h1>
        <div className="produk-container">
          <form onSubmit={handleSubmit} className="form-flex">
            <div className="form-row">
              <p>Nama Produk:</p>
              <input
                type="text"
                id="namaProduk"
                name="namaProduk"
                value={namaProduk}
                required
                onChange={(e) => setNamaProduk(e.target.value)}
              />
              <p>Kategori:</p>
              <select
                onChange={(e) => setKategori(e.target.value)}
                value={kategori}
                required
              >
                <option value=""> -- Pilih Kategori --</option>
                <option value="makanan">Makanan</option>
                <option value="cemilan">Cemilan</option>
                <option value="kopi">Kopi</option>
                <option value="non-kopi">Non-Kopi</option>
              </select>
            </div>
            <div className="form-row">
              <p>Harga Beli:</p>
              <input
                type="number"
                id="hargaBeli"
                name="hargaBeli"
                value={hargaBeli}
                required
                onChange={(e) => setHargaBeli(e.target.value)}
              />
              <p>Harga Jual:</p>
              <input
                type="number"
                id="harga"
                name="hargaProduk"
                value={hargaProduk}
                required
                onChange={(e) => setHarga(e.target.value)}
              />
            </div>
            <div className="form-row">
              <p>Qty:</p>
              <input
                type="number"
                id="qty"
                name="qty"
                value={qty}
                required
                onChange={(e) => setQty(e.target.value)}
              />
              <p>Gambar:</p>
              <input
                type="file"
                id="gambar"
                accept="image/*"
                required
                onChange={handleFileChange}
                style={{ paddingTop: "10px" }}
              />
              {previewImage && (
                <div style={{ marginTop: "10px" }}>
                  <img
                    src={previewImage}
                    alt="Preview"
                    style={{
                      width: "150px",
                      height: "150px",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  />
                </div>
              )}

              <button type="submit">Tambah Produk</button>
            </div>
          </form>

          <div className="box-produk">
            <h4>Total Produk Terdisplay: {totalProdukTerdisplay}</h4>
            <h4>Total Produk Habis: {totalProdukHabis}</h4>
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
          <div className="flex2">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="container2">
                  <Skeleton height={150} />
                  <Skeleton height={100} />
                  <Skeleton height={80} />
                </div>
              ))
            ) : filteredMenu.length > 0 ? (
              filteredMenu.map((item) => (
                <div className="container2" key={item.id}>
                  <div className="icon2">
                    <img src={item.gambar} alt={item.gambar} />
                  </div>
                  <strong>{item.namaProduk}</strong>
                  <div className="menuItem2">
                    <div className="menuInfo2">
                      <p>
                        Harga Beli : Rp.{" "}
                        {item.hargaBeli.toLocaleString("id-ID")} <br />
                        Harga Jual : Rp.{" "}
                        {item.hargaProduk.toLocaleString("id-ID")}
                      </p>
                      <p>
                        Stock :{" "}
                        {item.qty && Number(item.qty) > 0 ? (
                          item.qty
                        ) : (
                          <span style={{ color: "red" }}>Stok Habis</span>
                        )}
                        <br />
                        Ditampilkan :{" "}
                        <span
                          style={{
                            color:
                              item.tampil && item.qty && Number(item.qty) > 0
                                ? "green"
                                : "red",
                            fontWeight: "700",
                          }}
                        >
                          {item.tampil && item.qty && Number(item.qty) > 0
                            ? "Ya"
                            : "Tidak"}
                        </span>
                      </p>
                      <button onClick={() => handleEditClick(item)}>
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-data">Tidak ada menu tersedia</p>
            )}
          </div>
        </div>
        {showEditModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Edit Produk</h3>
              <form onSubmit={handleUpdateEdit}>
                <p>Nama Produk:</p>
                <input
                  type="text"
                  value={editNama}
                  onChange={(e) => setEditNama(e.target.value)}
                  required
                />
                <p>Harga Beli:</p>
                <input
                  type="number"
                  value={editHargaBeli}
                  onChange={(e) => setEditHargaBeli(e.target.value)}
                  required
                />
                <p>Harga Jual:</p>
                <input
                  type="number"
                  value={editHarga}
                  onChange={(e) => setEditHarga(e.target.value)}
                  required
                />
                <p>Stock:</p>
                <input
                  type="number"
                  value={editQty}
                  onChange={(e) => setEditQty(e.target.value)}
                  required
                />
                <p>Tampilkan Produk:</p>
                <label>
                  <input
                    type="checkbox"
                    checked={editTampil}
                    onChange={(e) => setEditTampil(e.target.checked)}
                  />
                </label>
                <div className="modal-buttons">
                  <button type="button" onClick={() => setShowEditModal(false)}>
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(editItem.id)}
                  >
                    Hapus Produk
                  </button>
                  <button type="submit">Simpan</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
