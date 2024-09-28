import React, {useState} from "react";
import {
    Badge,
    Box,
    Button, Center, Flex,
    FormControl,
    FormLabel, Heading, HStack,
    Input,
    VStack,

} from "@chakra-ui/react";
import {Question, useAuth} from "../../providers/AuthProvider.tsx";
import {useNavigate} from "react-router-dom";
import QuestionModal from "./components/QuestionModal.tsx";

import {BaseLayout} from "../../layout/BaseLayout.tsx";
import SelectExistingQuestionModal from "./components/SelectExistingQuestionModal.tsx";

const CreatePlaylistPage: React.FC = () => {
    const {user} = useAuth();
    const navigate = useNavigate();

    const handleCancel = () => {
        navigate("/user/overview");
    };

    const [playlistData, setPlaylistData] = useState({
        name: "",
        questions: [] as { content: string, type: string }[],
    });

    const [existingQuestions, setExistingQuestions] = useState<Question[]>([]);


    const [isSelectExistingQuestionModalOpen, setIsSelectExistingQuestionModalOpen] =
        useState(false);


    const handleSelectExistingQuestion = () => {
        setIsSelectExistingQuestionModalOpen(true);
    };

    const handleCloseSelectExistingQuestionModal = () => {
        setIsSelectExistingQuestionModalOpen(false);
    };

    const handleConfirmSelectExistingQuestion = (question: Question) => {
        console.log("Invoking saving ...", question)
        setPlaylistData((prev) => ({
            ...prev,
            questions: [...prev.questions, {content: question.content, type: 'selected'}],
        }));
        setExistingQuestions((prev) => [...prev, question]);
        setIsSelectExistingQuestionModalOpen(false);
    };


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setPlaylistData({
            ...playlistData,
            [name]: value,
        });
    };


    const handleDeleteQuestion = (index: number) => {
        setPlaylistData((prev) => {
            const updatedQuestions = [...prev.questions];
            updatedQuestions.splice(index, 1);
            return {...prev, questions: updatedQuestions};
        });
    };

    const saveQuestionToDatabase = async (question: { content: string, type: string }) => {
        try {
            const response = await fetch("/api/question", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    content: question.content,
                    creator: {id: user?.id}
                }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Data: ", data)
                return data;
            } else {
                const data = await response.json();
                console.error("Error saving question:", data);
                throw new Error("Error saving question");
            }
        } catch (error) {
            console.error("Error saving question:", error);
            throw new Error("Error saving question");
        }
    };

    const handleSavePlaylist = async () => {
        try {
            const savedQuestions = [];

            for (const question of playlistData.questions) {
                if (question.type !== "user-created") continue;

                const savedQuestion = await saveQuestionToDatabase({
                    content: question.content,
                    type: question.type,
                });
                savedQuestions.push({question: savedQuestion});
            }

            for (const existingQuestion of existingQuestions) {
                savedQuestions.push({question: existingQuestion});
            }

            console.log(savedQuestions);

            const response = await fetch("/api/playlist", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: playlistData.name,
                    playlistQuestions: savedQuestions,
                    creator: {id: user?.id},
                }),
            });

            if (response.ok) {
                navigate("/user/overview");
            } else {
                const data = await response.json();
                console.error("Error creating playlist:", data);
            }
        } catch (error) {
            console.error("Error creating playlist:", error);
        }
    };


    return (
        <BaseLayout>
            <Center h="full">
                <Box p={4} borderRadius="lg" boxShadow="md">
                    <Flex justify="space-between" align="center">
                        <Heading mb={4}>Create Playlist</Heading>
                        <div>
                            <Button onClick={handleCancel}>Cancel</Button>
                            <Button colorScheme="green" marginLeft={4} onClick={handleSavePlaylist}>
                                Save
                            </Button>
                        </div>

                    </Flex>
                    <Box flex="1" p={4} borderRadius="lg" boxShadow="md">
                        <FormControl>
                            <FormLabel>Name</FormLabel>
                            <Input
                                type="text"
                                name="name"
                                value={playlistData.name}
                                onChange={handleInputChange}
                            />
                        </FormControl>
                    </Box>
                    <Box flex="1" p={4} borderRadius="lg" boxShadow="md">
                        <FormControl>
                            <Flex justify="space-between" align="center" mb={4}>
                                <FormLabel>Questions</FormLabel>
                                <Flex justify="space-between" align="center">
                                    <Button
                                        colorScheme="teal"
                                        onClick={handleSelectExistingQuestion}
                                        ml={2}
                                        mr={2}
                                    >
                                        Select Existing Question
                                    </Button>
                                    <QuestionModal
                                        onAddQuestion={(question) => {
                                            setPlaylistData((prev) => ({
                                                ...prev,
                                                questions: [...prev.questions, {
                                                    content: question.content,
                                                    type: 'user-created'
                                                }],
                                            }));
                                        }}
                                    />
                                </Flex>
                            </Flex>
                            <VStack align="start" spacing={2}>
                                {playlistData.questions.map((question, index) => (
                                    <HStack key={index}>
                                        <Badge colorScheme="teal">{question.content}</Badge>
                                        <Button colorScheme="red" size="sm" onClick={() => handleDeleteQuestion(index)}>
                                            Delete
                                        </Button>
                                    </HStack>
                                ))}

                            </VStack>
                        </FormControl>
                    </Box>
                </Box>
            </Center>
            {isSelectExistingQuestionModalOpen && (
                <SelectExistingQuestionModal
                    onSelectQuestion={handleConfirmSelectExistingQuestion}
                    onClose={handleCloseSelectExistingQuestionModal}
                />
            )}
        </BaseLayout>
    );
};

export default CreatePlaylistPage;
