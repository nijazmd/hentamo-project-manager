import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { ProjectProvider } from '../context/ProjectContext';
import { AppRoutes } from './routes';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProjectProvider>
          <AppRoutes />
        </ProjectProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
