import {useEffect, useState} from "react";
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
    useDisclosure, HStack, Text
} from "@chakra-ui/react";
import {Question} from "../../../providers/AuthProvider.tsx";

interface QuestionModalProps {
    onAddQuestion: (question: { content: string }) => void;
}

const QuestionModal: React.FC<QuestionModalProps> = ({ onAddQuestion }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [questionData, setQuestionData] = useState({
        content: "",
    });
    const [existingQuestions, setExistingQuestions] = useState<Question[]>([]);
    const [selectedExistingQuestion, setSelectedExistingQuestion] = useState<string>("");

    useEffect(() => {
        // Fetch existing questions from the DB
        const fetchExistingQuestions = async () => {
            try {
                const response = await fetch("/api/question"); // Adjust the endpoint
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

    const isQuestionValid = async () => {
        try {
            const response = await fetch("/api/question");
            if (response.ok) {
                const data = await response.json();
                setExistingQuestions(data);

                // Check if the input content matches any existing question content
                return (
                    questionData.content.trim() !== "" &&
                    !existingQuestions.some((q) => q.content === questionData.content)
                );
            } else {
                console.error("Error fetching existing questions:", response);
                return false;
            }
        } catch (error) {
            console.error("Error fetching existing questions:", error);
            return false;
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setQuestionData({
            ...questionData,
            [name]: value,
        });
    };

    const handleSaveQuestion = async () => {
        const isValid = await isQuestionValid();

        if (isValid) {
            if (selectedExistingQuestion) {
                const selectedQuestion = existingQuestions.find((q) => q.content === selectedExistingQuestion);

                if (selectedQuestion) {
                    onAddQuestion({content: selectedQuestion.content});
                    setSelectedExistingQuestion("");
                }
            } else {
                const updatedQuestionData = {
                    content: `Never Have I Ever ${questionData.content}`,
                };
                onAddQuestion(updatedQuestionData);
            }

            setQuestionData({content: ""});
            onClose();
        } else {
            console.log("Invalid question. Please provide a non-empty and unique question.");
        }
    };

    return (
        <>
            <Button colorScheme="teal" onClick={onOpen}>
                Add Question
            </Button>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Add Question</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <FormControl>
                            <HStack>
                                <Text fontSize="md" fontWeight="bold" >Never Have I Ever:</Text>
                                <Input
                                    type="text"
                                    name="content"
                                    value={questionData.content}
                                    onChange={handleInputChange}
                                />
                            </HStack>
                        </FormControl>
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme="teal" mr={3} onClick={handleSaveQuestion} disabled={!existingQuestions.length}>
                            Save
                        </Button>
                        <Button onClick={onClose}>Cancel</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default QuestionModal;
