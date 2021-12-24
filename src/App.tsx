import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Contact from "./pages/Contact";
import Success from "./pages/Success";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Contact />} />
        <Route path="/success" element={<Success />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
