import React, { useState, useEffect } from "react";
import { useNavigate, useParams} from "react-router-dom";
import {
    Box,
    Button,
    Heading,
    Input, Table, Tbody, Td, Text, Th, Thead, Tr, useColorModeValue,
    VStack,
} from "@chakra-ui/react";
import {useAuth, Playlist, PlaylistQuestion} from "../../providers/AuthProvider.tsx";
import { BaseLayout } from "../../layout/BaseLayout.tsx";
import EditQuestionModal from "./components/EditQuestionModal.tsx";

const EditPlaylistPage: React.FC = () => {
    const { user } = useAuth();
    const { playlistId } = useParams<{ playlistId: string }>();
    const [playlist, setPlaylist] = useState<Playlist | null>(null);
    const [selectedQuestion, setSelectedQuestion] = useState<PlaylistQuestion | null>(null);
    const [isEditQuestionModalOpen, setIsEditQuestionModalOpen] = useState(false);
    const [isTableHovered, setIsTableHovered] = useState(false);


    useEffect(() => {
        const fetchPlaylist = async () => {
            try {
                const response = await fetch(`/api/playlist/${playlistId}`);
                if (response.ok) {
                    const playlistData = await response.json();
                    setPlaylist(playlistData);
                } else {
                    console.error("Error fetching playlist:", response);
                }
            } catch (error) {
                console.error("Error fetching playlist:", error);
            }
        };

        if (user) {
            fetchPlaylist();
        }
    }, [user, playlistId]);
    const navigate = useNavigate();

    const returnToUserOverviewPage = () => {
        navigate("/user/overview");
    };
    const handleUpdatePlaylistName = (newName: string) => {
        setPlaylist((prevPlaylist) => {
            if (prevPlaylist) {
                return { ...prevPlaylist, name: newName };
            }
            return null;
        });
    };

    const handleUpdateQuestion = (newContent: string) => {
        setPlaylist((prevPlaylist) => {
            if (prevPlaylist && selectedQuestion) {
                const updatedQuestions = prevPlaylist.playlistQuestions.map((playlistQuestion) =>
                    playlistQuestion.question.id === selectedQuestion.question.id
                        ? { ...playlistQuestion, question: { ...playlistQuestion.question, content: newContent } }
                        : playlistQuestion
                );
                return { ...prevPlaylist, playlistQuestions: updatedQuestions };
            }
            return null;
        });
        setIsEditQuestionModalOpen(false)
    };
    const handleEditQuestionClick = (playlistQuestion: PlaylistQuestion) => {
        setSelectedQuestion(playlistQuestion);
        setIsEditQuestionModalOpen(true);
    };
    const handleRemoveQuestion = async (questionId: string) => {
        try {
            setPlaylist((prevPlaylist) => {
                if (prevPlaylist) {
                    const updatedQuestions = prevPlaylist.playlistQuestions.filter(
                        (playlistQuestion) => playlistQuestion.question.id !== questionId
                    );
                    return {...prevPlaylist, playlistQuestions: updatedQuestions};
                }
                return null;
            });
            const response = await fetch(`/api/playlist/${playlistId}/questions`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    questions: [questionId],
                    creator: { id: user?.id },
                }),
            });
            if (response.ok) {
                console.log("Question removed successfully!");
            } else {
                const data = await response.json();
                console.error("Error:", data);
            }
        } catch (error) {
            console.error("Error deleting question from playlist:", error);
        }
    };

    const handleSaveChanges = async () => {
        try {
            console.log("Playlist questions are: ", playlist?.playlistQuestions)
            // Make API call to update the playlist with the updated data
            const response = await fetch(`/api/playlist/${playlistId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: playlist?.name,
                    playlistQuestions: playlist?.playlistQuestions.map((playlistQuestion) => ({
                        question: { id: playlistQuestion.question.id },
                        playlist: playlistId
                    })),
                    creator: { id: user?.id },
                }),
            });

            if (response.ok) {
                console.log("Changes saved successfully!");
                returnToUserOverviewPage()
            } else {
                const data = await response.json();
                console.error("Error saving changes:", data);
            }
        } catch (error) {
            console.error("Error saving changes:", error);
        }
    };
    const cardHoverColor = useColorModeValue("gray.100", "gray.800");
    return (
        <BaseLayout>
            <Box p={4}>
                <Heading mb={4}>Edit Playlist</Heading>
                {playlist && (
                    <VStack align="start">
                        <Box
                            flex="2"
                            p={4}
                            mb ={4}
                            borderRadius="lg"
                            boxShadow="md"
                            transition="transform 0.2s, box-shadow 0.2s"
                        >
                            <Text>Playlist Name: </Text>
                            <Input
                                type="text"
                                value={playlist.name}
                                onChange={(e) => handleUpdatePlaylistName(e.target.value)}
                            />
                        </Box>

                        <Box
                            flex="2"
                            p={4}
                            mb ={4}
                            borderRadius="lg"
                            boxShadow="md"
                            transition="transform 0.2s, box-shadow 0.2s"
                            onMouseEnter={() => setIsTableHovered(true)}
                            onMouseLeave={() => setIsTableHovered(false)}
                            overflowY={isTableHovered ? "auto" : "hidden"}
                        >
                            <Text>Questions: </Text>
                            <Table variant="striped" colorScheme="teal" w="100%" mb ={4}>
                                <Thead>
                                    <Tr>
                                        <Th>Index</Th>
                                        <Th>Question Content</Th>
                                        <Th>Action</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {playlist.playlistQuestions.map((playlistQuestion, index) => (
                                        <Tr key={playlistQuestion.question.id}
                                            _hover={{
                                                transform: "translateY(-4px)",
                                                boxShadow: "lg",
                                                bg: cardHoverColor,
                                            }}>
                                            <Td>{index + 1}</Td>
                                            <Td>{playlistQuestion.question.content}</Td>
                                            <Td >
                                                <Button
                                                    colorScheme="blue"
                                                    onClick={() => handleEditQuestionClick(playlistQuestion)}
                                                    mr={4}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    colorScheme="red"
                                                    onClick={() => handleRemoveQuestion(playlistQuestion.question.id)}
                                                >
                                                    Remove
                                                </Button>
                                            </Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>

                            {selectedQuestion && (
                                <EditQuestionModal
                                    isOpen={isEditQuestionModalOpen}
                                    onClose={() => setIsEditQuestionModalOpen(false)}
                                    initialQuestion={selectedQuestion.question}
                                    onUpdateQuestion={handleUpdateQuestion}
                                />
                            )}
                        </Box>
                    </VStack>
                )}
                <Button colorScheme="teal" onClick={handleSaveChanges}>
                    Save Changes
                </Button>
                <Button colorScheme="gray" onClick={returnToUserOverviewPage}>
                    Cancel
                </Button>
            </Box>
        </BaseLayout>
    );
};

export default EditPlaylistPage;
