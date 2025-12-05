import { BrowserRouter, Routes, Route } from 'react-router';
import Dashboard from './Dashboard/pages/Dashboard';
import Kasir from "./Kasir/pages/Kasir/Kasir"
import Produk from './Produk/pages/Produk';
import Laporan from './Laporan/pages/Laporan';
import Register from './Login/pages/Register';
import Login from './Login/pages/Login';
import Keuangan from './Keuangan/pages/keuangan';
import { useEffect, useState } from 'react';
import { supabase } from '../supabase/supabaseClient';


export default function Index() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Cek session saat aplikasi dimuat
    supabase.auth.getSession().then(() => {
      setIsReady(true);
    })
  }, []);

  if (!isReady) {
    return <div>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route index path='/' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/kasir' element={<Kasir />} />
        <Route path='/produk' element={<Produk />} />
        <Route path='/laporan' element={<Laporan />} />
        <Route path='/keuangan' element={<Keuangan />} />
      </Routes>
    </BrowserRouter>
  )
}
