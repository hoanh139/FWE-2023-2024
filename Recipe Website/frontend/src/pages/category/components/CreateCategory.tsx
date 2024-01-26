import {
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
import { Form, Formik } from "formik";
import { InputControl, SubmitButton } from "formik-chakra-ui";
import {Category} from "../../../adapter/__generated";


export const CreateCategoryModal = ({
                                        initialValues,
                                        onSubmit,
                                        setEntry,
                                        ...restProps
                                    }: Omit<ModalProps, "children"> & {
    initialValues: (Category & { name?: string }) | null;
    setEntry: (data: Category | null) => void;
    onSubmit?: (data: Category) => void;
}) => {
    return (
        <Modal {...restProps}>
            <ModalOverlay />

            <Formik<Category>
                initialValues={initialValues ?? { name: "" }}
                onSubmit={(e, formikHelpers) => {
                    onSubmit?.(e);
                    formikHelpers.setSubmitting(false);
                }}
            >
                <ModalContent as={Form}>
                    <ModalHeader fontSize="1.5em" color={"teal.900"} fontWeight="bold">
                        {initialValues ? "Edit Category " : "Create Category"}
                    </ModalHeader>
                    <ModalCloseButton onClick={()=>{setEntry(null)}}/>
                    <ModalBody>
                        <VStack spacing={4}>
                            <InputControl name={"name"} label={"Name"} />
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <SubmitButton>
                            {initialValues ? "Edit Category" : "Create Category"}
                        </SubmitButton>
                    </ModalFooter>
                </ModalContent>
            </Formik>
        </Modal>
    );
};
