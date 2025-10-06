import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./Register";
import Login from "./Login";
import Index from "./Index";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index path="/" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/index" element={<Index />} />
      </Routes>
    </BrowserRouter>
  );
}
