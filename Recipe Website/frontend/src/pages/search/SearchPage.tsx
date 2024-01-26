import {useEffect, useState} from 'react';
import {
    Box,
    FormControl,
    Input,
    Select,
    Button,
    HStack, Heading, useDisclosure, Flex,
} from '@chakra-ui/react';
import {SearchIcon, NavigationBar} from "../../layout/component/MenuComponents.tsx";
import {BaseLayout} from "../../layout/BaseLayout.tsx";
import {useApiClient} from "../../adapter/useApiClient.ts";
import {Recipe} from "../../adapter/__generated";
import {RecipeTable} from "../recipes/components/RecipeTable.tsx";
import {CreateRecipeModal} from "../recipes/components/CreateRecipe.tsx";

const SearchPage = () => {
    const client = useApiClient();

    const { isOpen, onOpen, onClose } = useDisclosure();

    const [entryToBeUpdated, setEntryToBeUpdated] = useState<Recipe | null>(
        null,
    );
    const [ recipes, setRecipes] = useState<Recipe[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchMode, setSearchMode] = useState('byname');

    useEffect(() => {

    }, []);

    const handleSearchModeChange = async (mode) => {
        setSearchMode(mode) ;
    };

    const handleSearch = async () => {
        if(searchTerm == ""){
            return;
        }
        if(searchMode === "byname" ){
            const res = await client.getRecipe(searchTerm);
            if (res.data != undefined){
                // recipes.push(res.data);
                await setRecipes([res.data]);
            }
        }
        else if(searchMode === "byingredient"){
            const res = await client.getAllRecipeByAnIngredient(searchTerm);
            await setRecipes(res.data);
        }
        else if(searchMode === "byrating"){
            const res = await client.getRecipeGtRating(parseInt(searchTerm));
            await setRecipes(res.data);
        }
    };

    const onDeleteRecipe = async (entry: Recipe) => {
        await client.deleteRecipe(entry.name);
        await handleSearch();
    };

    const onClickUpdateRecipe = async (entry: Recipe) => {
        setEntryToBeUpdated(entry);
        onOpen();
    };

    const onUpdateRecipe = async (entry: Recipe) => {
        await client.putRecipe(entryToBeUpdated?.name ?? "", entry);
        onClose();
        await handleSearch();
        setEntryToBeUpdated(null);
    };

    return (
        <BaseLayout rightMenu={<SearchIcon/>} navbar={<NavigationBar/>}>
            <Heading
                textAlign="center"
                color="teal.800"
            >
                Search Recipe
            </Heading>
            <HStack>
                <FormControl>
                    <Input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </FormControl>
                <Box>
                    <Button onClick={handleSearch} colorScheme="teal">Search</Button>
                </Box>
            </HStack>

            <Box w={"30%"} >
                <FormControl>
                    <Select value={searchMode} onChange={(e) => handleSearchModeChange(e.target.value)}>
                        <option value="byname">By Name</option>
                        <option value="byingredient">By Ingredient</option>
                        <option value="byrating">By Ratings</option>
                    </Select>
                </FormControl>
            </Box>
            <CreateRecipeModal
                initialValues={entryToBeUpdated}
                isOpen={isOpen}
                onClose={onClose}
                setEntry={setEntryToBeUpdated}
                onSubmit={(updatedEntry) => {
                    if (entryToBeUpdated) {
                        onUpdateRecipe(updatedEntry);
                    }
                }}
            />
            { recipes.length !== 0 && (
                <Flex justify="center" align="center" direction="column" mt={8} fontSize="1rem">
                    <RecipeTable
                    data={recipes}
                    onClickDeleteEntry={onDeleteRecipe}
                    onClickUpdateEntry={onClickUpdateRecipe}
                    />
                </Flex>
            )}
        </BaseLayout>
    );
};

export default SearchPage;