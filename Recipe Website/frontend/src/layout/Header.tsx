import {Box, Flex, HStack, VStack} from "@chakra-ui/react";
import { ReactNode } from "react";

export const Header = ({navbar, rightMenu }: { rightMenu: ReactNode, navbar?: ReactNode }) => {
    return (
    <VStack bg={"teal.400"} w={"100%"}>
        <HStack bg={"teal.500"} p={8} w={"100%"}>
            <Box color={"teal.200"} fontSize="2em" fontWeight="bold" flex={2}>Recipe Website</Box>
            <Flex justifyContent={"flex-end"} flex={1}>
            {rightMenu}
            </Flex>
        </HStack>

        <HStack>{navbar}</HStack>
    </VStack>
);
};
