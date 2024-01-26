import { ReactNode } from "react";
import { VStack } from "@chakra-ui/react";
import { Header } from "./Header.tsx";
import { Page } from "./Page.tsx";

export const BaseLayout = ({
    children,
    navbar,
    rightMenu,
}: {
    children: ReactNode;
    navbar: ReactNode;
    rightMenu?: ReactNode;
}) => {
    return (
        <VStack h={"100vh"} w={"100%"} bg={"teal.200"}>
            <Header rightMenu={rightMenu} navbar={navbar}/>
            <Page>{children}</Page>
        </VStack>
    );
};
