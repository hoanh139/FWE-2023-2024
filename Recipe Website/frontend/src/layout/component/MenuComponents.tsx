import {HStack, Link} from "@chakra-ui/react";
import {Link as RouterLink} from "react-router-dom";
import {Search2Icon} from "@chakra-ui/icons";

export const NavigationBar: React.FC = () => {
    return (
        <HStack  px={4}
                 py={2}
                 bgColor="teal"
                 color="white"
                 borderRadius="md"
                 fontWeight="bold"
        >
            <Link color={"teal.100"} as={RouterLink} to="/home">Home</Link>
            <Link color={"teal.100"} as={RouterLink} to="/category">Category</Link>
            <Link color={"teal.100"} as={RouterLink} to="/ingredient">Ingredient</Link>
            <Link color={"teal.100"} as={RouterLink} to="/recipe">Recipe</Link>
        </HStack>
    );
};

export const SearchIcon: React.FC   = () => {
    return (
            <Link color="teal.200" as={RouterLink} to="/search">
                <Search2Icon boxSize={5}/>
            </Link>
    );
};