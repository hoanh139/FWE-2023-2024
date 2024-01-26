import { useParams } from 'react-router-dom';
import {
    Box,
    Flex,
    Heading,
    Text,
    UnorderedList,
    ListItem,
    Image,
    OrderedList,
} from '@chakra-ui/react';
import {useEffect, useState} from "react";
import {useApiClient} from "../../adapter/useApiClient.ts";
import {Recipe} from "../../adapter/__generated";
import { NavigationBar, SearchIcon} from "../../layout/component/MenuComponents.tsx";
import {BaseLayout} from "../../layout/BaseLayout.tsx";

export const RecipeEntryPage = () => {
    const { name } = useParams();
    const client = useApiClient();

    const [ recipe, setRecipe] = useState<Recipe>(null);
    const onLoadData = async () => {
        const res = await client.getRecipe(name || "");
        setRecipe(res.data);
    };
    useEffect(() => {
        onLoadData();
    }, []);

    if (!recipe) {
        return <div>Loading...</div>;
    }

    return (
        <BaseLayout rightMenu={<SearchIcon/>} navbar={<NavigationBar/>}>
        <Flex height="100%" >
            {/* Left Side */}
            <Box flex="4" p="4" color="teal.800" >
                <Heading fontSize="4em">{recipe.name}</Heading>
                <Text fontSize="1.5em" fontWeight="bold">Rating: {recipe.rating}</Text>
                <Text fontSize="1.5em" fontWeight="bold">Categories: </Text>
                {recipe?.recipeTags?.map((recipeTag)   => (
                        <Text>-  {recipeTag.category.name}</Text>
                ))}
                <Heading fontSize="1.5em" mt="4">
                    Ingredients:
                </Heading>
                <UnorderedList>
                    {recipe.recipeIngredients.map((recipeingredient, index) => (
                        <ListItem key={index}>
                            {recipeingredient.ingredient.name}: {recipeingredient.amount} {recipeingredient.unit}
                        </ListItem>
                    ))}
                </UnorderedList>
            </Box>

            {/* Right Side */}
            <Box flex="6" p="4" color="teal.800">

                <Box order={{ base: 1, md: 2 }}w="30%" maxW="30%" minW="30%">
                    <Image src={recipe.picture} alt={recipe.name} w="100%" h="auto" objectFit="cover" />
                </Box>
                <Box order={{ base: 2, md: 1 }} flex="1" mr={{ md: 4 }}>
                    <Heading fontSize="1.5em" mt="4">
                        Recipe Steps:
                    </Heading>
                    <OrderedList>
                        {recipe.recipeSteps?.map((recipeStep, index) => (
                            <ListItem key={index}>{recipeStep.description}</ListItem>
                        ))}
                    </OrderedList>
                </Box>
            </Box>
        </Flex>
        </BaseLayout>
    );
};
