import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { register } from '../features/authSlice';
import { useNavigate } from 'react-router-dom';
import { unwrapResult } from '@reduxjs/toolkit';

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const resultAction = await dispatch(register({ name, email, password }));
      unwrapResult(resultAction);
      setError('');
      navigate('/login'); 
    } catch (err) {
      setError(err);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-green-50">
      <form className="bg-white p-8 rounded shadow w-96" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold mb-4 text-center text-green-900">Register</h2>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <input type="text" placeholder="Name" className="border p-2 rounded w-full mb-3"
               value={name} onChange={(e) => setName(e.target.value)} />
        <input type="email" placeholder="Email" className="border p-2 rounded w-full mb-3"
               value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" className="border p-2 rounded w-full mb-3"
               value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="bg-green-800 text-white w-full p-2 rounded hover:bg-green-900">
          Register
        </button>
      </form>
    </div>
  );
};

export default RegisterPage;
