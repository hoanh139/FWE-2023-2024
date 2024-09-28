// src/App.tsx
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import { AuthProvider } from "./providers/AuthProvider.tsx";
import { AppRoutes } from "./AppRoutes.tsx";
import { SocketProvider } from "./providers/SocketProvider.tsx";

const App: React.FC = () => {
  return (

    <ChakraProvider>
      <BrowserRouter>
        <AuthProvider>
          <SocketProvider>
            <AppRoutes />
          </SocketProvider>
        </AuthProvider>
      </BrowserRouter>
    </ChakraProvider>
  );
};

export default App;
