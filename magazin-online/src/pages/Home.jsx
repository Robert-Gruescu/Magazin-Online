import React from "react";
import Navbar from "../components/Navbar";

const Home = () => {
  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <Navbar />
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold text-white">
          Bun venit in magazinul nostru!
        </h1>
        <p className="mt-4 text-gray-400">
          Aici veti gasi cele mai bune produse.
        </p>
      </div>
    </div>
  );
};

export default Home;
