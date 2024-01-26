import { Category } from "../../../adapter/__generated";
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

export const CategoryTable = ({
                                  data,
                                  onClickDeleteEntry,
                                  onClickUpdateEntry,
                              }: {
    data: Category[];
    onClickDeleteEntry: (categoryEntry: Category) => void;
    onClickUpdateEntry: (categoryEntry: Category) => void;
}) => {
    return (
        <TableContainer>
            <Table variant="simple">
                <Thead>
                    <Tr>
                        <Th>Category</Th>
                        <Th>Action</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {data.map((entry) => {
                        return (
                            <Tr>
                                <Td>{entry.name}</Td>
                                <Td>
                                    <IconButton
                                        aria-label={"Delete Category"}
                                        icon={<DeleteIcon />}
                                        onClick={() => onClickDeleteEntry(entry)}
                                    />{" "}
                                    <IconButton
                                        aria-label={"Edit Category"}
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
