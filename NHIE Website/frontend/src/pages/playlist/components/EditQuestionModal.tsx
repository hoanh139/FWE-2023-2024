// EditQuestionModal.tsx

import React, { useState } from "react";
import {
    Button,
    FormControl,
    Input,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    HStack,
    Text,
} from "@chakra-ui/react";
import {Question, useAuth} from "../../../providers/AuthProvider.tsx";


interface UpdatingQuestionModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialQuestion: Question;
    onUpdateQuestion: (newContent: string) => void;
}

const EditQuestionModal: React.FC<UpdatingQuestionModalProps> = ({ isOpen, onClose, initialQuestion, onUpdateQuestion }) => {
    const [questionContent, setQuestionContent] = useState(initialQuestion.content);
    const { user } = useAuth();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuestionContent(e.target.value);
    };

    const handleUpdateQuestion = async () => {
        onUpdateQuestion(questionContent);
        try {
            const response = await fetch(`/api/question/${initialQuestion.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    content: questionContent,
                    creator: {id: user?.id}
                }),
            });

            if (response.ok) {
                console.log("Question content changes saved successfully!");
            } else {
                const data = await response.json();
                console.error("Error saving Question content changes:", data);
            }
        } catch (error) {
            console.error("Error saving Question content changes:", error);
        }
        onClose();
    };

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} >
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Update Question</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <FormControl>
                            <HStack>
                                <Text fontSize="md" fontWeight="bold">
                                    Never Have I Ever:
                                </Text>
                                <Input
                                    type="text"
                                    value={questionContent}
                                    onChange={handleInputChange}
                                />
                            </HStack>
                        </FormControl>
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme="teal" mr={3} onClick={handleUpdateQuestion}>
                            Save Changes
                        </Button>
                        <Button onClick={onClose}>Cancel</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default EditQuestionModal;
