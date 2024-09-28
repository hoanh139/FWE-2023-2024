import { ReactNode } from "react";
import { VStack } from "@chakra-ui/react";
import { Header } from "./Header.tsx";
import { Page } from "./Page.tsx";

export const BaseLayout = ({
                               children,

                           }: {
    children: ReactNode;
    rightMenu?: ReactNode;
}) => {
    return (
        <VStack bg="gray.100" h="100vh" w="100%">
          <Header />
          <Page>{children}</Page>
        </VStack>
      );
      
};
