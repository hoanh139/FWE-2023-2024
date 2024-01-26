import {BaseLayout} from "../../layout/BaseLayout.tsx";
import {Button, Flex, useDisclosure} from "@chakra-ui/react";
import {useEffect, useState} from "react";
import {useApiClient} from "../../adapter/useApiClient.ts";
import {
    Ingredient,
} from "../../adapter/__generated";
import {IngredientTable} from "./components/IngredientTable.tsx";
import {CreateIngredientModal} from "./components/CreateIngredient.tsx";
import { SearchIcon, NavigationBar} from "../../layout/component/MenuComponents.tsx";

export const IngredientPage = () => {
    const client = useApiClient();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [ ingredients, setIngredients] = useState<Ingredient[]>([]);
    const onLoadData = async () => {
        const res = await client.getAllIngredients();
        setIngredients(res.data);
    };
    useEffect(() => {
        onLoadData();
    }, []);

    const onCreateIngredient = async (data: Ingredient) => {
        await client.postIngredient(data);
        onClose();
        await onLoadData();
    };

    const onDeleteIngredient = async (entry: Ingredient) => {
        await client.deleteIngredient(entry.name);
        await onLoadData();
    };

    const [entryToBeUpdated, setEntryToBeUpdated] = useState<Ingredient | null>(
        null,
    );

    const onClickUpdateIngredient = async (entry: Ingredient) => {
        setEntryToBeUpdated(entry);
        onOpen();
    };

    const onUpdateIngredient = async (entry: Ingredient) => {
        await client.putIngredient(entryToBeUpdated?.name ?? "", entry);
        onClose();
        await onLoadData();
        setEntryToBeUpdated(null);
    };

    return (
        <BaseLayout rightMenu={<SearchIcon/>} navbar={<NavigationBar/>}>
            <Button
                fontSize="1.5rem"
                color="teal.800"
                onClick={() => {
                    onOpen();
                }}
            >
                Add New Ingredient
            </Button>
            <CreateIngredientModal
                initialValues={entryToBeUpdated}
                isOpen={isOpen}
                onClose={onClose}
                setEntry={setEntryToBeUpdated}
                onSubmit={(updatedEntry) => {
                    if (entryToBeUpdated) {
                        onUpdateIngredient(updatedEntry);
                    } else {
                        onCreateIngredient(updatedEntry );
                    }
                }}
            />
            <Flex justify="center" align="center" direction="column" mt={8} fontSize="1rem">
                <IngredientTable
                    data={ingredients}
                    onClickDeleteEntry={onDeleteIngredient}
                    onClickUpdateEntry={onClickUpdateIngredient}
                />
            </Flex>
        </BaseLayout>
    );
};