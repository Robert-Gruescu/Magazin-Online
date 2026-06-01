import { Route, Routes } from "react-router-dom";
import AddProduct from "./pages/AddProduct";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import Login from "./pages/Login";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/products/new" element={<AddProduct />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/orders" element={<Orders />} />
    </Routes>
  );
}

export default App;
