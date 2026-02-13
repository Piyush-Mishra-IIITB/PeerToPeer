import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Room from "./pages/Room.jsx";
import React from 'react';
import { useMemo } from 'react';
import {io} from "socket.io-client";
import SocketProvider from "./providers/Socket.jsx";
function App() {
  return (
    <>
      <SocketProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/room/:roomId" element={<Room/>}/>
        </Routes>
      </SocketProvider>
    </>
  );
}

export default App;
