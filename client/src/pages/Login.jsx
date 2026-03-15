import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/auth';

const Login = () => {
  const [user, setUser] = useState({
      email: "",
      password: "",
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { storeTokenInLS, storeUserInLS } = useAuth();

  const handleInputChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await loginUser(user);
      const token = response.token;
      const loggedInUser = response.user || response.userData || { email: user.email };
      
      storeTokenInLS(token);
      storeUserInLS(loggedInUser);
      toast.success("Login Successful");
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="p-10 bg-gray-900 border border-gray-800 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold text-white mb-6">Admin Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input
              type="email"
              value={user.email}
              onChange={handleInputChange}
              name="email"
              required
              className="w-full px-4 py-2 rounded-md border border-gray-700 bg-gray-800 text-white focus:outline-none focus:border-blue-600"
              placeholder="admin@example.com"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Password</label>
            <input
              type="password"
              value={user.password}
              onChange={handleInputChange}
              name="password"
              required
              className="w-full px-4 py-2 rounded-md border border-gray-700 bg-gray-800 text-white focus:outline-none focus:border-blue-600"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-md text-white font-medium"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="mt-4 text-gray-500 text-sm">
          Dashboard works without login. Sign up via API to create users.
        </p>
      </div>
    </div>
  );
};

export default Login;
