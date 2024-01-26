import {BaseLayout} from "../../layout/BaseLayout.tsx";
import {Button, Flex, useDisclosure} from "@chakra-ui/react";
import {SearchIcon, NavigationBar} from "../../layout/component/MenuComponents.tsx";
import {useApiClient} from "../../adapter/useApiClient.ts";
import {useEffect, useState} from "react";
import {Recipe} from "../../adapter/__generated";
import {CreateRecipeModal} from "./components/CreateRecipe.tsx";
import {RecipeTable} from "./components/RecipeTable.tsx";

export const RecipeTablePage = () => {
    const client = useApiClient();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [ recipes, setRecipes] = useState<Recipe[]>([]);
    const onLoadData = async () => {
        const res = await client.getAllRecipes();
        setRecipes(res.data);
    };
    useEffect(() => {
        onLoadData();
    }, []);

    const onCreateRecipe = async (data: Recipe) => {
        await client.postRecipe(data);
        onClose();
        await onLoadData();
    };

    const onDeleteRecipe = async (entry: Recipe) => {
        await client.deleteRecipe(entry.name);
        await onLoadData();
    };

    const [entryToBeUpdated, setEntryToBeUpdated] = useState<Recipe | null>(
        { name: "" , recipeTags: [], recipeIngredients: [], recipeSteps: []},
    );

    const onClickUpdateRecipe = async (entry: Recipe) => {
        setEntryToBeUpdated(entry);
        onOpen();
    };

    const onUpdateRecipe = async (entry: Recipe) => {
        await client.putRecipe(entryToBeUpdated?.name ?? "", entry);
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
                Add New Recipe
            </Button>
            <CreateRecipeModal
                initialValues={entryToBeUpdated}
                isOpen={isOpen}
                onClose={onClose}
                setEntry={setEntryToBeUpdated}
                onSubmit={(updatedEntry) => {
                    if (entryToBeUpdated?.name != "") {
                        onUpdateRecipe(updatedEntry);
                    } else {
                        onCreateRecipe(updatedEntry);
                    }
                }}
            />
            <Flex justify="center" align="center" direction="column" mt={8} fontSize="1rem">
                <RecipeTable
                    data={recipes}
                    onClickDeleteEntry={onDeleteRecipe}
                    onClickUpdateEntry={onClickUpdateRecipe}
                />
            </Flex>
        </BaseLayout>
    );
};