import { Route, Routes } from "react-router-dom";
import AddProduct from "./pages/AddProduct";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/products/new" element={<AddProduct />} />
      <Route path="/orders" element={<Orders />} />
    </Routes>
  );
}

export default App;
