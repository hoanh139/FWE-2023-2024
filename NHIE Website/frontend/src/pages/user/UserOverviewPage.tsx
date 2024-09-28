import { useEffect, useState } from "react";
import {
    Box,
    Button,
    Heading,
    Link,
    VStack,
    useColorModeValue,
    Flex, Table, Thead, Tr, Th, Tbody, Td,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import {
    getUserPlaylists,
    Playlist,
    useAuth,
} from "../../providers/AuthProvider.tsx";
import { BaseLayout } from "../../layout/BaseLayout.tsx";
import ViewPlaylistModal from "./components/ViewPlaylistModal.tsx";

export const UserOverviewPage = () => {
    const { user } = useAuth();
    const [playlists, setPlaylists] = useState([]);
    const [isTableHovered, setIsTableHovered] = useState(false);

    const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(
        null
    );
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    const handleViewPlaylist = (playlist: Playlist) => {
        setSelectedPlaylist(playlist);
        setIsViewModalOpen(true);
    };

    useEffect(() => {
        const fetchUserPlaylists = async () => {
            try {
                if (user) {
                    const userPlaylists = await getUserPlaylists(user.id);
                    setPlaylists(userPlaylists);
                }
            } catch (error) {
                console.error("Error fetching user playlists:", error);
            }
        };

        if (user) {
            fetchUserPlaylists();
        }
    }, [user]);
    const handleRemovePlaylist = async (playlistId: string) => {
        try {
            const response = await fetch(`/api/playlist/${playlistId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    creator: { id: user?.id },
                }),
            });

            if (response.ok) {
                setPlaylists((prevPlaylists) =>
                    prevPlaylists.filter(
                        (playlist: Playlist) => playlist.id !== playlistId
                    )
                );
            } else {
                const data = await response.json();
                console.error("Error deleting playlist:", data);
            }
        } catch (error) {
            console.error("Error deleting playlist:", error);
        }
    };

    const cardHoverColor = useColorModeValue("gray.100", "gray.800");

    return (
        <BaseLayout>
            <Flex h="full">
                {/* User Overview Section */}
                <Box flex="1" p={4} borderRadius="lg" boxShadow="md" transition="transform 0.2s, box-shadow 0.2s" _hover={{
                    transform: "translateY(-4px)",
                    boxShadow: "lg",
                    bg: cardHoverColor,
                }}>
                    <Heading mb={4}>User Overview</Heading>
                    {user && (
                        <VStack align="start" mb={4}>
                            <Box>
                                <strong>Email:</strong> {user.email}
                            </Box>
                            <Box>
                                <strong>First Name:</strong> {user.firstName}
                            </Box>
                            <Box>
                                <strong>Last Name:</strong> {user.lastName}
                            </Box>
                            <Link as={RouterLink} to="/user/edit-user-info">
                                <Button colorScheme="teal">Edit</Button>
                            </Link>
                        </VStack>
                    )}
                </Box>

                {/* Playlist Section */}
                <Box
                    flex="2"
                    p={4}
                    borderRadius="lg"
                    boxShadow="md"
                    transition="transform 0.2s, box-shadow 0.2s"
                    _hover={{
                        transform: "translateY(-4px)",
                        boxShadow: "lg",
                        bg: cardHoverColor,
                    }}
                    onMouseEnter={() => setIsTableHovered(true)}
                    onMouseLeave={() => setIsTableHovered(false)}
                    overflowY={isTableHovered ? "auto" : "hidden"}
                >
                    <Flex justify="space-between" align="center">
                        <Heading mb={4}>Playlists</Heading>
                        <Link as={RouterLink} to="/user/create-playlist">
                            <Button colorScheme="green">Add Playlist</Button>
                        </Link>
                    </Flex>

                    <Table variant="striped" colorScheme="teal" w="100%" >
                        <Thead>
                            <Tr>
                                <Th>Playlist Name</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {playlists.map((playlist: Playlist) => (
                                <Tr key={playlist.id}
                                    _hover={{
                                        transform: "translateY(-4px)",
                                        boxShadow: "lg",
                                        bg: cardHoverColor,
                                    }} >
                                    <Td>{playlist.name}</Td>
                                    <Td>
                                        <Flex justifyItems="center">
                                        <Button colorScheme="blue" mr={2} onClick={() => handleViewPlaylist(playlist)}>
                                            View
                                        </Button>
                                        <Link
                                            as={RouterLink}
                                            to={`/user/edit-playlist/${playlist.id}`}
                                        >
                                            <Button colorScheme="teal" mr={2}>Edit</Button>
                                        </Link>
                                        <Button colorScheme="red" mr={2} onClick={() => handleRemovePlaylist(playlist.id)}>
                                            Remove
                                        </Button>
                                        </Flex>
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                    <ViewPlaylistModal
                        isOpen={isViewModalOpen}
                        onClose={() => setIsViewModalOpen(false)}
                        playlist={selectedPlaylist || ({} as Playlist)}
                    />
                </Box>
            </Flex>
        </BaseLayout>
    );
};
