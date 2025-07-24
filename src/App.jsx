/* eslint-disable no-unused-vars */
import { useState } from 'react';
import './App.css'
import LoginForm from './views/LoginForm';
import { BrowserRouter , Routes,Route } from 'react-router-dom';
import RegisterForm from './views/RegisterForm';

function App() {
  

  return (
    <BrowserRouter>
      {/* <LoginForm></LoginForm> */}
      <Routes>
        <Route path='/register' element={<RegisterForm />} />
        <Route path='/login' element={<LoginForm />} />
        {/* <Route path='/' element={<LoginForm />} /> */}
      </Routes>
    </BrowserRouter>
  )
}

export default App
