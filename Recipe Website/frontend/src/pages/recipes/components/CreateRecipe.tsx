import {
    Button, HStack, IconButton,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    ModalProps,
    VStack,
} from "@chakra-ui/react";
import {Field, Form, Formik} from "formik";
import { InputControl, SubmitButton } from "formik-chakra-ui";
import {Recipe, RecipeIngredient, RecipeStep, RecipeTag} from "../../../adapter/__generated";
import {useApiClient} from "../../../adapter/useApiClient.ts";
import {DeleteIcon} from "@chakra-ui/icons";
import {useState} from "react";
import {array, number, object, string} from "yup";


export const CreateRecipeIngredientSchema = object({
    unit: string().required(),
    amount: number().required(),
    ingredient: object({
        name: string().required(),
    }).required()
});

export const CreateRecipeStepSchema = object({
    number: number().required(),
    description: string().required(),
});
export const CreateRecipeTagSchema = object({
    category: object({
        name: string().required(),
    }).required()
});

export const CreateRecipeSchema = object({
    name: string().required(),
    description: string().required(),
    rating: number().min(1).max(5).required(),
    picture: string().required(),
    recipeIngredients: array().of(CreateRecipeIngredientSchema),
    recipeTags: array().of(CreateRecipeTagSchema),
    recipeSteps: array().of(CreateRecipeStepSchema),
});

export const CreateRecipeModal = ({
                                          initialValues,
                                          onSubmit,
                                          setEntry,
                                          ...restProps
                                      }: Omit<ModalProps, "children"> & {
    initialValues: (Recipe & { name?: string }) | null;
    setEntry: (data: Recipe | null) => void;
    onSubmit?: (data: Recipe) => void;
}) => {
    const client = useApiClient();

    const [inputFields, setInputFields] = useState<number>(0);

    const addInputField = () => {
        initialValues?.recipeIngredients?.push(undefined)
        setEntry(initialValues);
        setInputFields(inputFields+1);
    };

    const onDeleteIngredientFromRecipe = async (entry: RecipeIngredient, index) => {
        if(entry!=undefined){
            const ingredient : string[] = [entry.ingredient.name];
            const request = {
                "ingredientNames": ingredient
            }
            await client.deleteIngredientsFromRecipe(entry.recipe, request);
        }
        initialValues?.recipeIngredients?.splice(index, 1);
        setEntry(initialValues);

        setInputFields(inputFields-1);
    };

    const addInputCategoryField = () => {
        initialValues?.recipeTags?.push(undefined)
        setEntry(initialValues);
        setInputFields(inputFields+1);
    };

    const onDeleteCategoryFromRecipe = async (entry: RecipeTag, index) => {

        if(entry!=undefined){
            const categories : string[] = [entry.category.name];
            const request = {
                "categories": categories
            }
            await client.deleteCategoriesFromRecipe(entry.recipe, request);
        }
        initialValues?.recipeTags?.splice(index, 1);
        setEntry(initialValues);
        setInputFields(inputFields-1);
    };

    const addInputStepField = () => {
        initialValues?.recipeSteps?.push(undefined)
        setEntry(initialValues);
        setInputFields(inputFields+1);
    };

    const onDeleteStepFromRecipe = async (entry: RecipeStep, index) => {
        if(entry!=undefined){
            const step : number[] = [entry.number];
            const request = {
                "stepNumbers": step
            }
            await client.deleteStepsFromRecipe(entry.recipe, request);
        }
        initialValues?.recipeSteps?.splice(index, 1);
        setEntry(initialValues);

        setInputFields(inputFields-1);
    };

    return (
        <Modal {...restProps}>
            <ModalOverlay />

            <Formik<Recipe>
                initialValues={initialValues ?? { name: "" , recipeTags: [], recipeIngredients: [], recipeSteps: []}}
                onSubmit={(e, formikHelpers) => {
                    onSubmit?.(e);
                    formikHelpers.setSubmitting(false);
                }}
                validationSchema={CreateRecipeSchema}
            >
                <ModalContent as={Form} width="50%" maxW="50%" >
                    <ModalHeader fontSize="1.5em" color={"teal.900"} fontWeight="bold">
                        {initialValues?.name!="" ? "Edit Recipe " : "Create Recipe"}
                    </ModalHeader>
                    <ModalCloseButton onClick={()=>{setEntry({ name: "" , recipeTags: [], recipeIngredients: [], recipeSteps: []})}}/>
                    <ModalBody>
                        <VStack spacing={4}>
                            <InputControl name={"name"} label={"Name"} />
                            <InputControl name={"description"} label={"Description"} />
                            <InputControl name={"picture"} label={"Picture"} />
                            <InputControl name={"rating"} label={"Rating"}/>
                            <Field name="recipeTags">
                                {() => {
                                    if(initialValues?.recipeTags != null && inputFields <= initialValues?.recipeTags.length){
                                        setInputFields(initialValues?.recipeTags.length);
                                    }
                                    return (
                                        <VStack spacing={4}>
                                            {initialValues?.recipeTags?.map((_, index)   =>
                                                (
                                                    <HStack>
                                                        <InputControl
                                                            name={`recipeTags.${index}.category.name`}
                                                            label={`Category #${index + 1}`}
                                                        />
                                                        <IconButton
                                                            aria-label={`Delete Category #${index + 1}`}
                                                            icon={<DeleteIcon />}
                                                            onClick={() => {
                                                                onDeleteCategoryFromRecipe(initialValues?.recipeTags[index], index);
                                                            }}
                                                        />
                                                    </HStack>
                                                ))}
                                            <Button onClick={addInputCategoryField}>
                                                Add Category
                                            </Button>
                                        </VStack>
                                    );
                                }}
                            </Field>
                            <Field name="recipeIngredients">
                                {() => {
                                    if(initialValues?.recipeIngredients != null && inputFields <= initialValues?.recipeIngredients.length){
                                        setInputFields(initialValues?.recipeIngredients.length);
                                    }
                                    return (
                                        <VStack spacing={4}>
                                            {initialValues?.recipeIngredients?.map((_, index)   =>
                                            (
                                            <HStack>
                                                <InputControl
                                                    name={`recipeIngredients.${index}.ingredient.name`}
                                                    label={`Ingredient #${index + 1}`}
                                                />
                                                <InputControl
                                                    name={`recipeIngredients.${index}.amount`}
                                                    label={`Amount`}
                                                />
                                                <InputControl
                                                    name={`recipeIngredients.${index}.unit`}
                                                    label={`Unit`}
                                                />
                                                <IconButton
                                                    aria-label={`Delete Ingredient #${index + 1}`}
                                                    icon={<DeleteIcon />}
                                                    onClick={() => {
                                                        onDeleteIngredientFromRecipe(initialValues?.recipeIngredients[index], index);
                                                    }}
                                                />
                                            </HStack>
                                            ))}
                                            <Button onClick={addInputField}>
                                                Add Ingredient
                                            </Button>
                                        </VStack>
                                    );
                                }}
                            </Field>
                            <Field name="recipeSteps">
                                {() => {
                                    if(initialValues?.recipeSteps != null && inputFields <= initialValues?.recipeSteps.length){
                                        setInputFields(initialValues?.recipeSteps.length);
                                    }

                                    return (
                                        <VStack spacing={4}>
                                            {initialValues?.recipeSteps?.map((_, index)   =>
                                                (
                                                    <HStack>
                                                        <InputControl
                                                            name={`recipeSteps.${index}.number`}
                                                            label={`Step #${index + 1}`}
                                                        />
                                                        <InputControl
                                                            name={`recipeSteps.${index}.description`}
                                                            label={`Amount`}
                                                        />
                                                        <IconButton
                                                            aria-label={`Delete Step #${index + 1}`}
                                                            icon={<DeleteIcon />}
                                                            onClick={() => {
                                                                onDeleteStepFromRecipe(initialValues?.recipeSteps[index], index);
                                                            }}
                                                        />
                                                    </HStack>
                                                ))}
                                            <Button onClick={addInputStepField}>
                                                Add Step
                                            </Button>
                                        </VStack>
                                    );
                                }}
                            </Field>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <SubmitButton>
                            {initialValues?.name!="" ? "Edit Recipe" : "Create Recipe"}
                        </SubmitButton>
                    </ModalFooter>
                </ModalContent>
            </Formik>
        </Modal>
    );
};
