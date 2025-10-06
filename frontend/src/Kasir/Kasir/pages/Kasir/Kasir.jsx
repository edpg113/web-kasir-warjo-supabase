import React, { useState, useEffect } from "react";
import "../../style/register.css";
import Sidebar from "../../../components/Sidebar";
import Mainbar from "./components/Mainbar";
import Rigthbar from "./components/Rigthbar";
import { supabase } from "../../../../supabase/supabaseClient";

export default function Dashboard() {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMenu = async () => {
    try {
      const { data, error } = await supabase
        .from("produk")
        .select("*")
        .eq("tampil", true)
        .gt("qty", 0)
        .order("id", { ascending: true });
      setMenu(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching menu data:", error);
      alert("Gagal mengambil data menu. Silakan coba lagi.");
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const addTocart = (item, qty) => {
    setCartItems((prevCartItems) => {
      const existingItem = prevCartItems.find((i) => i.id === item.id);
      if (existingItem) {
        // Kalau produk sudah ada, update qty
        return prevCartItems.map((i) =>
          i.id === item.id
            ? { ...i, qty: i.qty + qty, catatan: item.catatan }
            : i
        );
      } else {
        // Kalau produk belum ada maka tambah baru
        return [...prevCartItems, { ...item, qty }];
      }
    });
  };

  const removeFromCart = (id) => {
    setCartItems((prevCartItems) =>
      prevCartItems.filter((item) => item.id !== id)
    );
  };

  const clearCart = () => {
    setCartItems([]);
    fetchMenu(); // Refresh menu to update stock
  };

  return (
    <div>
      <div className="body">
        <Sidebar />
        <Rigthbar
          cartItems={cartItems}
          removeFromCart={removeFromCart}
          fetchMenu={fetchMenu}
          clearCart={clearCart}
        />
        <Mainbar
          menu={menu}
          fetchMenu={fetchMenu}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          addTocart={addTocart}
          loading={loading}
        />
      </div>
    </div>
  );
}
