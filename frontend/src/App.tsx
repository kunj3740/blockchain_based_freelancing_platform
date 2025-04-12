import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";

import { HomePage } from "./components/HomePage";
import { ClientAuth } from "./components/ClientAuth";
import { ListFreeLancer } from "./components/ListFreeLancer";
import { FreelancerAuth } from "./components/FreeLancerAuth";
import ListClient from "./components/ListClient";

function App() {
  useEffect(() => {
    localStorage.setItem("id", "2"); // store as string
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/client/auth" element={<ClientAuth />} />
        <Route path="/freelancer/auth" element={<FreelancerAuth />} />
        <Route path="/client/find" element={<ListClient />} />"
        <Route path="/freelancer/find" element={<ListFreeLancer />} />"
        {/* <Route path="/" element={<HomePage />} />

        {/* You can add more routes here */}
      </Routes>
    </Router>
  );
}

export default App;
