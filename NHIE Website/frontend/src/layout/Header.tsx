// Header.tsx
import {
    Box,
    HStack,
    IconButton,
    Text, // Import Text for displaying NHIE
} from "@chakra-ui/react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiHome } from "react-icons/fi"; // Ensure the Home icon is imported
import UserOverviewButton from "./UserOverviewButton.tsx";
import { useAuth } from "../providers/AuthProvider.tsx";

export const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, onLogout } = useAuth(); // Assuming onLogout is provided by useAuth

    const handleHomeClick = () => {
        // Automatically log out if on the auth/login or register page
        if (location.pathname === '/auth/login' || location.pathname === '/auth/register') {
            onLogout();
        }
        // Navigate based on user status
        if (!user) navigate("/auth/login");
        else navigate("/home");
    };

    const isAuthPage = location.pathname === '/auth/login' || location.pathname === '/auth/register';

    return (
        <HStack bg={"gray.800"} p={4} w={"100%"} justifyContent="space-between">
            <Box display="flex" alignItems="center">
                {/* Conditionally render the Home icon based on the current page */}
                {!isAuthPage && (
                    <IconButton
                        aria-label="Home"
                        icon={<FiHome />}
                        onClick={handleHomeClick}
                        color="white"
                        variant="ghost"
                    />
                )}
                <Text color="white" fontWeight="bold" ml={!isAuthPage ? 2 : 0}>NHIE</Text> {/* Adjust marginLeft based on the presence of the Home icon */}
            </Box>
            {!isAuthPage && <UserOverviewButton />}
        </HStack>
    );
};
