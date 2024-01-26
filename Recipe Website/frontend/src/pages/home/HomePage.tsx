import { BaseLayout } from "../../layout/BaseLayout.tsx";
import {Box, Button, HStack, Link, VStack} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import {SearchIcon} from "../../layout/component/MenuComponents.tsx";

export const HomePage = () => {
    return (
        <BaseLayout rightMenu={<SearchIcon/>} navbar={null}>
            <VStack >
                <Box color="teal.800" fontSize="4em" fontWeight="bold" mb={4}>
                    WELCOME TO RECIPE WEBSITE
                </Box>
                <HStack align="center" justify="center" height="100%">
                    <Link as={RouterLink} to="/category">
                        <Button colorScheme="teal" size='lg'>Category</Button>
                    </Link>
                    <Link as={RouterLink} to="/ingredient">
                        <Button colorScheme="teal" size='lg'>Ingredient</Button>
                    </Link>
                    <Link as={RouterLink} to="/recipe">
                        <Button colorScheme="teal" size='lg'>Recipe</Button>
                    </Link>
                </HStack>
            </VStack>

        </BaseLayout>
    );
};
