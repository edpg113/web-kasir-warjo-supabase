import React from "react";
import moment from "moment-timezone";
import "../style/struk.css";
import Icon from "../../../assets/logo.png";
import { supabase } from "../../../../../supabase/supabaseClient";
import { useEffect } from "react";

const Struk = ({ transaksiDetails }) => {
  const [displayName, setDisplayName] = React.useState("");

  if (!transaksiDetails) {
    return <p>Tidak ada data transaksi.</p>;
  }

  useEffect(() => {
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
    <div className="struk">
      <div className="head">
        <img src={Icon} alt="" />
      </div>
      <h2>Warjo ID</h2>
      <p>Jl. Pasir Muncang, Cikopo Selatan, Kab. Bogor</p>
      <hr />
      <p>Kasir : {displayName}</p>
      <p>No. Transaksi: {transaksiDetails.id}</p>
      <p>Tanggal: {moment().tz("Asia/Jakarta").format("DD/MM/YYYY HH:mm")}</p>
      <hr />
      <ul>
        {transaksiDetails.items.map((item, index) => (
          <li key={index}>
            {item.namaProduk} x {item.qty} - Rp.{" "}
            {item.hargaProduk.toLocaleString("id-ID")}
            {/* {item.catatan && <p>Catatan: {item.catatan}</p>} */}
          </li>
        ))}
      </ul>
      <hr />
      <p>Total: Rp {transaksiDetails.total.toLocaleString("id-ID")}</p>
      <p>Bayar: Rp {transaksiDetails.uangDibayarkan.toLocaleString("id-ID")}</p>
      <p>Kembali: Rp {transaksiDetails.kembalian.toLocaleString("id-ID")}</p>
      <hr />
      <div className="footer">
        <p>Terima kasih telah berbelanja!</p>
        <p>Instagram</p>
        <p>@warjoId</p>
      </div>
    </div>
  );
};

export default Struk;
