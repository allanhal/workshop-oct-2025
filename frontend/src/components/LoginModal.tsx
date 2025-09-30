/* eslint-disable react-hooks/rules-of-hooks */
import axios from 'axios';
import { useState } from 'react';

import useStore from '../store';
import { API } from '../utils/gameLogic';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  if (!isOpen) return null;

  const { profile, setProfile, token, setToken } = useStore();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const login = async () => {
    try {
      const res = await axios.post(`${API}/login`, { username, password });
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
      // setMessage("Login successful!");
      onClose();
    } catch (err) {
      setMessage(`Login failed ${err}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login();
  };

  if (profile) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg w-96 shadow-lg relative">
          <button
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            ✕
          </button>
          <h2 className="text-2xl font-bold mb-4">Profile</h2>
          <pre className="bg-gray-100 p-4 rounded">
            {JSON.stringify(profile, null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96 shadow-lg relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          ✕
        </button>
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border p-2 rounded"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 rounded"
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Login
          </button>
        </form>
        {message && <p className="mt-2 text-red-600">{message}</p>}
      </div>
    </div>
  );
}
