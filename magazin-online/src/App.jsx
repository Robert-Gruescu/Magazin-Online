import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Product from "./pages/Product";
import Category from "./pages/Category";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import Favorites from "./pages/Favorites";
import WeeklyDeals from "./pages/WeeklyDeals";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/category/:slug" element={<Category />} />
      <Route path="/produs/:id" element={<Product />} />
      <Route path="/register" element={<Register />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/favorite" element={<Favorites />} />
      <Route path="/reduceri" element={<WeeklyDeals />} />
    </Routes>
  );
}

export default App;
