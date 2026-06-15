import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login          from './pages/Login'
import Register       from './pages/Register'
import Dashboard      from './pages/Dashboard'
import Chatbot        from './pages/Chatbot'
import KnowledgeGraph from './pages/KnowledgeGraph'
import Insights       from './pages/Insights'
import Eval           from './pages/Eval'
import MLClassifier   from './pages/MLClassifier'

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" replace />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"          element={<Navigate to="/login" replace />} />
        <Route path="/login"     element={<Login />} />
        <Route path="/register"  element={<Register />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/chat"      element={<PrivateRoute><Chatbot /></PrivateRoute>} />
        <Route path="/graph"     element={<PrivateRoute><KnowledgeGraph /></PrivateRoute>} />
        <Route path="/insights"  element={<PrivateRoute><Insights /></PrivateRoute>} />
        <Route path="/eval"      element={<PrivateRoute><Eval /></PrivateRoute>} />
        <Route path="/ml"        element={<PrivateRoute><MLClassifier /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App