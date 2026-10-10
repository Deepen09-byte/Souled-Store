import './App.css'
import { RouterProvider } from 'react-router-dom'
import { routes } from './app.routes.jsx'
import { useSelector } from 'react-redux';
import { useAuth } from '../features/auth/hook/useauth.js';
import { useEffect } from 'react';

function App() {

  const { handleGetMe } = useAuth();

  useEffect(() => {
    handleGetMe();
  }, []);

  const user = useSelector((state) => state.auth.user);
  console.log(user);

  return <RouterProvider router={routes} />;
}

export default App
