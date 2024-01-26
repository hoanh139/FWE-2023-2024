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
import { InputControl, SubmitButton, TextareaControl } from "formik-chakra-ui";
import { Ingredient } from "../../../adapter/__generated";


export const CreateIngredientModal = ({
        initialValues,
        onSubmit,
        setEntry,
        ...restProps
    }: Omit<ModalProps, "children"> & {
    initialValues: (Ingredient & { name?: string }) | null;
    setEntry: (data: Ingredient | null) => void;
    onSubmit?: (data: Ingredient) => void;
}) => {
    return (
        <Modal {...restProps}>
            <ModalOverlay />

            <Formik<Ingredient>
                initialValues={initialValues ?? { name: "" }}
                onSubmit={(e, formikHelpers) => {
                    onSubmit?.(e);
                    formikHelpers.setSubmitting(false);
                }}
            >
                <ModalContent as={Form}>
                    <ModalHeader fontSize="1.5em" color={"teal.900"} fontWeight="bold">
                        {initialValues ? "Edit Ingredient " : "Create Ingredient"}
                    </ModalHeader>
                    <ModalCloseButton onClick={()=>{setEntry(null)}}/>
                    <ModalBody>
                        <VStack spacing={4}>
                            <InputControl name={"name"} label={"Name"} />
                            <TextareaControl name={"description"} label={"Description"} />
                            <TextareaControl name={"link"} label={"Link"} />
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <SubmitButton>
                            {initialValues ? "Edit Ingredient" : "Create Ingredient"}
                        </SubmitButton>
                    </ModalFooter>
                </ModalContent>
            </Formik>
        </Modal>
    );
};
