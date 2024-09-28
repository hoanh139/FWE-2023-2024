// ViewPlaylistModal.tsx

import React, {useEffect, useState} from "react";
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    VStack,
    Table,
    Thead,
    Tr,
    Th,
    Tbody,
    Td,
} from "@chakra-ui/react";
import {Playlist, PlaylistQuestion} from "../../../providers/AuthProvider.tsx";

interface ViewPlaylistModalProps {
    isOpen: boolean;
    onClose: () => void;
    playlist: Playlist;
}

const ViewPlaylistModal: React.FC<ViewPlaylistModalProps> = ({
                                                                 isOpen,
                                                                 onClose,
                                                                 playlist,
                                                             }) => {
    const [playlistDetails, setPlaylistDetails] = useState<Playlist | null>(
        null
    );

    useEffect(() => {
        // Make an API call to fetch detailed playlist information
        const fetchPlaylistDetails = async () => {
            try {
                const response = await fetch(`/api/playlist/${playlist.id}`);
                if (response.ok) {
                    const data = await response.json();
                    console.log("Fetched Playlist Details:", data);
                    setPlaylistDetails(data);
                } else {
                    console.error("Failed to fetch playlist details");
                }
            } catch (error) {
                console.error("Error fetching playlist details:", error);
            }
        };

        if (isOpen) {
            fetchPlaylistDetails();
        }
    }, [isOpen, playlist.id]);
    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>{`Viewing Playlist: ${playlist.name}`}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack align="start" spacing={4}>
                        {playlistDetails ? (
                            <>
                                <Table variant="striped" colorScheme="teal" w="100%">
                                    <Thead>
                                        <Tr>
                                            <Th>Index</Th>
                                            <Th>Question Content</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {playlistDetails.playlistQuestions?.map(
                                            (playlistQuestion: PlaylistQuestion, index) => (
                                                <Tr key={playlistQuestion.question.id}>
                                                    <Td>{index + 1}</Td>
                                                    <Td>{playlistQuestion.question.content}</Td>
                                                </Tr>
                                            )
                                        )}
                                    </Tbody>
                                </Table>
                            </>
                        ) : (
                            <p>No playlist details available</p>
                        )}

                    </VStack>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default ViewPlaylistModal;
