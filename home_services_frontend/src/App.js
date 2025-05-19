import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './Components/Auth/ProtectedRoute';

// Dashboard Layouts
import TaskerDashboard from './Components/TaskerDashboard/TaskerDashboard';
import AdminDashboard from './Components/AdminDashboard/AdminDashboard';

// Shared Components
import Login from './Components/Auth/Login';

import Home from './Components/Home';
import RegisterTasker from './Components/Auth/RegisterTasker';
import RegisterUser from './Components/Auth/RegisterUser';
import UserList from './Components/AdminDashboard/UsersManagement/UserList';
import UserCreate from './Components/AdminDashboard/UsersManagement/UserCreate';
import UserShow from './Components/AdminDashboard/UsersManagement/UserShow';
import UserEdit from './Components/AdminDashboard/UsersManagement/UserEdit';
import TaskerList from './Components/AdminDashboard/TaskerManagement/TaskerList';
import PendingTaskers from './Components/AdminDashboard/TaskerManagement/PendingTaskers';
import CreateTasker from './Components/AdminDashboard/TaskerManagement/CreateTasker';



function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register-tasker" element={<RegisterTasker />} />
                <Route path="/register" element={<RegisterUser />} />


        {/* Admin Dashboard */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        >
         {/*Users management*/}
        <Route path='users' element={<UserList />} />
  <Route path="users/create" element={<UserCreate />} />
  <Route path="users/:id" element={<UserShow />} />
  <Route path="users/:id/edit" element={<UserEdit />} />
  {/*Users management*/}
  <Route path="taskers" element={<TaskerList />} />
        <Route path="taskers/pending" element={<PendingTaskers />} />

      <Route path="taskers/create" element={<CreateTasker/>} />

        </Route>




        {/* Tasker Dashboard */}
        <Route
          path="/tasker"
          element={
            <ProtectedRoute roles={['tasker']}>
              <TaskerDashboard />
            </ProtectedRoute>
          }
        >
          
        </Route>




          <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;