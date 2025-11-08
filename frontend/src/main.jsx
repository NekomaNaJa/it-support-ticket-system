import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate
} from "react-router-dom";
import './index.css';
import { AuthProvider } from './context/AuthContext';

// Import Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import TicketFlowPage from './pages/TicketFlowPage';
import CreateTicketPage from './pages/CreateTicketPage';
import TicketDetailPage from './pages/TicketDetailPage';
import TicketEditPage from './pages/TicketEditPage';
import KnowledgeBasePage from './pages/KnowledgeBasePage';
import CreateKnowledgeBasePage from './pages/CreateKnowledgeBasePage';
import EditKnowledgeBasePage from './pages/EditKnowledgeBasePage';
import KnowledgeBaseDetailPage from './pages/KnowledgeBaseDetailPage';
import ManagementLayout from './pages/Management/ManagementLayout';
import UserManagementPage from './pages/Management/UserManagementPage';
import EditUserPage from './pages/Management/EditUserPage';
import CategoryManagementPage from './pages/Management/CategoryManagementPage';
import EditCategoryPage from './pages/Management/EditCategoryPage';


import ProtectedLayout from './components/ProtectedLayout';
// import ProtectedRoute from './components/ProtectedRoute';

const router = createBrowserRouter([
  // --- 1. Public Routes (ไม่ต้องล็อกอิน) ---
  // (วางไว้นอก Layout)
  { path: "/", element: <LoginPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },

  // --- 2. Protected Routes (ต้องล็อกอิน) ---
  // (เราสร้าง "กลุ่ม" ที่มี "Layout")
  {
    element: <ProtectedLayout />, // (ทุกหน้าที่อยู่ "ข้างใน" นี้ จะมี Navbar)
    children: [
        // User + Staff + Admin Routes
        { path: "/ticket-flow", element: <TicketFlowPage /> },
        { path: "/ticket/:id", element: <TicketDetailPage /> },
        { path: "/ticket-edit/:id", element: <TicketEditPage /> },
        { path: "/create-ticket", element: <CreateTicketPage /> },

        { path: "/knowledge-base", element: <KnowledgeBasePage /> },
        { path: "/knowledge-base/:id", element: <KnowledgeBaseDetailPage /> },

        // Staff + Admin Routes
        { path: "/knowledge-base/create", element: <CreateKnowledgeBasePage /> },
        { path: "/knowledge-base/edit/:id", element: <EditKnowledgeBasePage /> },

        // Admin Only Routes
        {
        path: "/dashboard",
        element: <AdminDashboardPage />
      },
      {
          path: "/management",
          element: <ManagementLayout />,
          children: [
              { path: "users", element: <UserManagementPage /> },
              { path: "users/edit/:id", element: <EditUserPage /> },
              { path: "categories", element: <CategoryManagementPage /> },
              { path: "categories/edit/:id", element: <EditCategoryPage /> },
              { path: "", element: <Navigate to="users" replace /> }
          ]
      },
        // (TODO: สร้างหน้า ManagementPage)
        // { path: "/management", element: <ManagementPage /> },
    ]
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>,
);