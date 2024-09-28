import {
    Menu,
    MenuButton,
    MenuList,
    MenuItem, Flex, IconButton,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider.tsx";
import {FiUser} from "react-icons/fi";

const UserOverviewButton = () => {
    const { user, onLogout } = useAuth();

    return (
        <>
            {user && (
                <Flex alignItems="center">

                    <Menu>
                        <MenuButton
                            as={IconButton}
                            icon={<FiUser />}
                            variant="ghost"
                            color="white"
                        />
                        <MenuList>
                            <MenuItem as={Link} to="/user/overview" color="black">Overview</MenuItem>
                            <MenuItem color="black" onClick={onLogout}>
                                Logout
                            </MenuItem>
                        </MenuList>
                    </Menu>
                </Flex>
            )}
        </>
    );
};

export default UserOverviewButton;
