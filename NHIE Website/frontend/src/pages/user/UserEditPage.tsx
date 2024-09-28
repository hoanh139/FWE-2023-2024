// UserEditPage.tsx
import React, {useState} from "react";
import {useAuth} from "../../providers/AuthProvider";
import {Button, FormControl, FormLabel, Heading, Input, VStack} from "@chakra-ui/react";
import {useNavigate} from "react-router-dom";
import {BaseLayout} from "../../layout/BaseLayout";
import {Form, Formik, Field, ErrorMessage} from "formik";
import {RegisterUserSchema} from "../auth/RegisterPage";
import {AuthCard} from "../auth/components/AuthCard.tsx";

const UserEditPage: React.FC = () => {
    const {user, accessToken} = useAuth();
    const navigate = useNavigate();

    const [editedUser] = useState({
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        email: user?.email || "",
        password: "",
    });

    const handleSaveChanges = async (values: any) => {
        try {
            const response = await fetch(`/api/auth/${user?.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(values),
            });

            if (response.ok) {
                navigate("/auth/login");
            } else {
                const data = await response.json();
                console.error("Error updating user:", data);
            }
        } catch (error) {
            console.error("Error updating user:", error);
        }
    };

    const handleCancel = () => {
        navigate("/user/overview");
    };

    return (
        <BaseLayout>
            <AuthCard>
                <Heading>Edit User Info</Heading>
                <VStack spacing={8} align="start">
                    <Formik
                        initialValues={editedUser}
                        validationSchema={RegisterUserSchema}
                        onSubmit={handleSaveChanges}
                    >
                        {({isSubmitting}) => (
                            <Form>
                                <FormControl>
                                    <FormLabel>First Name</FormLabel>
                                    <Field as={Input} type="text" name="firstName"/>
                                    <ErrorMessage name="firstName" component="div"/>
                                    <ErrorMessage name="firstName">{msg => <div
                                        style={{color: 'red'}}>{msg}</div>}</ErrorMessage>
                                </FormControl>

                                <FormControl>
                                    <FormLabel>Last Name</FormLabel>
                                    <Field as={Input} type="text" name="lastName"/>
                                    <ErrorMessage name="lastName" component="div"/>
                                    <ErrorMessage name="lastName">{msg => <div
                                        style={{color: 'red'}}>{msg}</div>}</ErrorMessage>
                                </FormControl>

                                <FormControl>
                                    <FormLabel>Email</FormLabel>
                                    <Field as={Input} type="email" name="email"/>
                                    <ErrorMessage name="email">{msg => <div
                                        style={{color: 'red'}}>{msg}</div>}</ErrorMessage>
                                </FormControl>

                                <FormControl>
                                    <FormLabel>New Password</FormLabel>
                                    <Field as={Input} type="password" name="password"/>
                                    <ErrorMessage name="password">{msg => <div
                                        style={{color: 'red'}}>{msg}</div>}</ErrorMessage>
                                </FormControl>

                                <div className="md:flex-1 px-4 mb-8 md:mb-0 mt-8 space-x-2">
                                    <Button type="submit" isLoading={isSubmitting} colorScheme="teal">
                                        Save Changes
                                    </Button>
                                    <Button onClick={handleCancel}>Cancel</Button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </VStack>
            </AuthCard>
        </BaseLayout>
    );
};

export default UserEditPage;
