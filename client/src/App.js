import React from 'react';
import './App.css';
import {BrowserRouter,Route,Routes} from 'react-router-dom'
import Login from './login'
import Register from './register';
import API from './api'

const App=()=>{
  //using router to route users to correct address
  return <div>
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/api" element={<API />} />
        <Route path="/register" element={<Register />} />
      </Routes>
      </BrowserRouter>
  </div>
}

export default App