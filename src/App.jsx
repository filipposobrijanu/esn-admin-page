import React from "react";
import Navbar from "./components/Navbar/Navbar";
import Admin from "./components/Admin/Admin";
import { Routes, Route } from "react-router-dom";

const App = () => {
  return (
    <div>
      <Navbar />
      <Admin />
    </div>
  );
};

export default App;
