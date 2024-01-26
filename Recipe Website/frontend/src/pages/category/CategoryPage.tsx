import {BaseLayout} from "../../layout/BaseLayout.tsx";
import {Button, Flex, useDisclosure} from "@chakra-ui/react";
import {NavigationBar, SearchIcon} from "../../layout/component/MenuComponents.tsx";
import {useApiClient} from "../../adapter/useApiClient.ts";
import {useEffect, useState} from "react";
import {Category} from "../../adapter/__generated";
import {CreateCategoryModal} from "./components/CreateCategory.tsx";
import {CategoryTable} from "./components/CategoryTable.tsx";

export const CategoryPage = () => {
    const client = useApiClient();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [ categories, setCategories] = useState<Category[]>([]);
    const onLoadData = async () => {
        const res = await client.getAllCategory();
        setCategories(res.data);
    };
    useEffect(() => {
        onLoadData();
    }, []);

    const onCreateCategory = async (data: Category) => {
        await client.postCategory(data);
        onClose();
        await onLoadData();
    };

    const onDeleteCategory = async (entry: Category) => {
        await client.deleteCategory(entry.name);
        await onLoadData();
    };

    const [entryToBeUpdated, setEntryToBeUpdated] = useState<Category | null>(
        null,
    );

    const onClickUpdateCategory = async (entry: Category) => {
        setEntryToBeUpdated(entry);
        onOpen();
    };

    const onUpdateCategory = async (entry: Category) => {
        await client.putCategory(entryToBeUpdated?.name ?? "", entry);
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
                Add New Category
            </Button>
            <CreateCategoryModal
                initialValues={entryToBeUpdated}
                isOpen={isOpen}
                onClose={onClose}
                setEntry={setEntryToBeUpdated}
                onSubmit={(updatedEntry) => {
                    if (entryToBeUpdated) {
                        onUpdateCategory(updatedEntry);
                    } else {
                        onCreateCategory(updatedEntry );
                    }
                }}
            />
            <Flex justify="center" align="center" direction="column" mt={8} fontSize="1rem" >
                <CategoryTable
                    data={categories}
                    onClickDeleteEntry={onDeleteCategory}
                    onClickUpdateEntry={onClickUpdateCategory}
                />
            </Flex>
        </BaseLayout>
    );
};
