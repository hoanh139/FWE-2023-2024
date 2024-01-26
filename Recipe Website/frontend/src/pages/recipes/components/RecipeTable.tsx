import { Recipe } from "../../../adapter/__generated";
import {
    IconButton, Link,
    Table,
    TableContainer, Tag,
    Tbody,
    Td,
    Th,
    Thead,
    Tr,
} from "@chakra-ui/react";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import {Link as RouterLink} from "react-router-dom";

export const RecipeTable = ({
                                    data,
                                    onClickDeleteEntry,
                                    onClickUpdateEntry,
                                }: {
    data: Recipe[];
    onClickDeleteEntry: (recipetEntry: Recipe) => void;
    onClickUpdateEntry: (recipetEntry: Recipe) => void;
}) => {
    return (
        <TableContainer>
            <Table variant="simple">
                <Thead>
                    <Tr>
                        <Th>Recipe</Th>
                        <Th>Rating</Th>
                        <Th>Action</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {data.map((entry) => {
                        return (
                            <Tr>
                                <Td><Link as={RouterLink} key={entry.name} to={`/recipe/${entry.name}`}>{entry.name}</Link></Td>
                                <Td>{entry.rating}</Td>
                                <Td>
                                    <IconButton
                                        aria-label={"Delete Recipe"}
                                        icon={<DeleteIcon />}
                                        onClick={() => onClickDeleteEntry(entry)}
                                    />{" "}
                                    <IconButton
                                        aria-label={"Edit Recipe"}
                                        icon={<EditIcon />}
                                        onClick={() => onClickUpdateEntry(entry)}
                                    />{" "}
                                </Td>
                            </Tr>

                        );
                    })}
                </Tbody>
            </Table>
        </TableContainer>
    );
};
