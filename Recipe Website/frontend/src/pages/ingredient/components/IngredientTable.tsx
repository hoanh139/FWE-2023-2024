import { Ingredient } from "../../../adapter/__generated";
import {
    IconButton,
    Table,
    TableContainer,
    Tbody,
    Td,
    Th,
    Thead,
    Tr,
} from "@chakra-ui/react";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";

export const IngredientTable = ({
                                    data,
                                    onClickDeleteEntry,
                                    onClickUpdateEntry,
                                }: {
    data: Ingredient[];
    onClickDeleteEntry: (ingredientEntry: Ingredient) => void;
    onClickUpdateEntry: (ingredientEntry: Ingredient) => void;
}) => {
    return (
        <TableContainer>
            <Table variant="simple">
                <Thead>
                    <Tr>
                        <Th>Ingredient</Th>
                        <Th>Description</Th>
                        <Th>Link</Th>
                        <Th>Action</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {data.map((entry) => {
                        return (
                            <Tr>
                                <Td>{entry.name}</Td>
                                <Td>{entry.description}</Td>
                                <Td>{entry.link}</Td>
                                <Td>
                                    <IconButton
                                        aria-label={"Delete Ingredient"}
                                        icon={<DeleteIcon />}
                                        onClick={() => onClickDeleteEntry(entry)}
                                    />{" "}
                                    <IconButton
                                        aria-label={"Edit Ingredient"}
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
