import { Navigate, Route, Routes } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import Landing from "./pages/Landing";
import Products from "./pages/Products";
import Category from "./pages/Category";
import Product from "./pages/Product";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Favorites from "./pages/Favorites";
import WeeklyDeals from "./pages/WeeklyDeals";
import MyOrders from "./pages/MyOrders";
import Support from "./pages/Support";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
      {/* Pagina de prezentare a magazinului */}
      <Route path="/" element={<Landing />} />

      {/* Catalog */}
      <Route path="/produse" element={<Products />} />
      <Route path="/categorie/:slug" element={<Category />} />
      <Route path="/produs/:id" element={<Product />} />
      <Route path="/reduceri" element={<WeeklyDeals />} />

      {/* Cumpărare */}
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/favorite" element={<Favorites />} />

      {/* Cont */}
      <Route path="/comenzile-mele" element={<MyOrders />} />
      <Route path="/suport" element={<Support />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Rute vechi păstrate ca redirect, ca linkurile existente să nu pice */}
      <Route path="/category/:slug" element={<Navigate to="/produse" replace />} />

      <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
