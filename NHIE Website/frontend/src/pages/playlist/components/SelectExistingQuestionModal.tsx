import React, {useEffect, useState} from "react";
import {
    Button,
    FormControl,
    Select,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
} from "@chakra-ui/react";
import { Question } from "../../../providers/AuthProvider.tsx";

interface SelectExistingQuestionModalProps {
    onSelectQuestion: (selectedQuestion: Question) => void;
    onClose: () => void;
}


const SelectExistingQuestionModal: React.FC<SelectExistingQuestionModalProps> = ({
                                                                                     onSelectQuestion,
                                                                                     onClose,
                                                                                 }) => {
    const [selectedExistingQuestion, setSelectedExistingQuestion] = useState<string>("");
    const [existingQuestions, setExistingQuestions] = useState<Question[]>([]);

    useEffect(() => {
        // Fetch existing questions from the DB
        const fetchExistingQuestions = async () => {
            try {
                const response = await fetch("/api/question");
                if (response.ok) {
                    const data = await response.json();
                    setExistingQuestions(data);
                } else {
                    console.error("Error fetching existing questions:", response);
                }
            } catch (error) {
                console.error("Error fetching existing questions:", error);
            }
        };

        fetchExistingQuestions();
    }, []);

    const handleConfirmSelect = () => {
        const selectedQuestion = existingQuestions.find(
            (question) => question.id === selectedExistingQuestion
        );

        if (selectedQuestion) {
            onSelectQuestion(selectedQuestion);
        }

        onClose();
    };

    return (
        <Modal isOpen={true} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Select Existing Question</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <FormControl>
                        <Select
                            placeholder="Select an existing question"
                            value={selectedExistingQuestion}
                            onChange={(e) => {
                                setSelectedExistingQuestion(e.target.value);
                            }}
                        >
                            {existingQuestions.map((existingQuestion) => (
                                <option key={existingQuestion.id} value={existingQuestion.id}>
                                    {existingQuestion.content}
                                </option>
                            ))}
                        </Select>
                    </FormControl>
                </ModalBody>
                <ModalFooter>
                    <Button
                        colorScheme="teal"
                        mr={3}
                        onClick={handleConfirmSelect}
                        disabled={!selectedExistingQuestion}
                    >
                        Save
                    </Button>
                    <Button onClick={onClose}>Cancel</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default SelectExistingQuestionModal;

