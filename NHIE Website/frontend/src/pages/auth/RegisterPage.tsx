import { BaseLayout } from "../../layout/BaseLayout.tsx";
import { AuthCard } from "./components/AuthCard.tsx";
import { Box, Button, Heading, Link, VStack } from "@chakra-ui/react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { Form, Formik, Field, ErrorMessage } from "formik";
import { Input } from "@chakra-ui/react";
import { object, string } from "yup";
import {emailValidation, passwordValidation} from "../../validation/validation.ts";
import {toast, ToastContainer} from "react-toastify";

export type RegisterUserData = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

export const RegisterUserSchema = object({
  email: emailValidation,
  password: passwordValidation,
  firstName: string().required(),
  lastName: string().required(),
});

const initialFormValues: RegisterUserData = {
  email: "",
  password: "",
  firstName: "",
  lastName: "",
};

export const RegisterPage = () => {
  const navigate = useNavigate();

  const onSubmitRegisterForm = async (values: RegisterUserData) => {
    const body = {
      email: values.email,
      password: values.password,
      firstName: values.firstName,
      lastName: values.lastName,
    };
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const resBody = await res.json();

    if (res.ok) {
      toast.success("Registration successful");
      navigate('/auth/login'); // Redirect to login page
    } else {
      toast.error("Registration failed: " + resBody.errors.join(", "));
    }
  };

  return (
      <BaseLayout>
        <AuthCard>
          <Heading>Register</Heading>
          <Formik<RegisterUserData>
              initialValues={initialFormValues}
              onSubmit={onSubmitRegisterForm}
              validationSchema={RegisterUserSchema}
          >
            {(formik) => (
                <Form onSubmit={formik.handleSubmit}>
                  <VStack alignItems={"flex-start"}>
                    <label htmlFor="email">E-mail</label>
                    <Field
                        as={Input}
                        type="email"
                        id="email"
                        name="email"
                        placeholder="Email"
                        borderColor={formik.touched.email && formik.errors.email ? 'red.500' : 'gray.200'}
                        color={formik.touched.email && formik.errors.email ? 'red.500' : 'inherit'}
                    />
                    <ErrorMessage name="email">{ msg => <div style={{ color: 'red' }}>{msg}</div> }</ErrorMessage>

                    <label htmlFor="password">Password</label>
                    <Field
                        as={Input}
                        type="password"
                        id="password"
                        name="password"
                        placeholder="Password"
                        borderColor={formik.touched.password && formik.errors.password ? 'red.500' : 'gray.200'}
                        color={formik.touched.password && formik.errors.password ? 'red.500' : 'inherit'}
                    />
                    <ErrorMessage name="password">{ msg => <div style={{ color: 'red' }}>{msg}</div> }</ErrorMessage>

                    <label htmlFor="firstName">First Name</label>
                    <Field
                        as={Input}
                        type="text"
                        id="firstName"
                        name="firstName"
                        placeholder="Firstname"
                    />
                    <ErrorMessage name="firstName" component="div"/>

                    <label htmlFor="lastName">Last Name</label>
                    <Field
                        as={Input}
                        type="text"
                        id="lastName"
                        name="lastName"
                        placeholder="Lastname"
                    />
                    <ErrorMessage name="lastName" component="div"/>

                    <Button type="submit" isDisabled={!formik.isValid}>
                      Register
                    </Button>
                    <Box>
                      Schon einen Account?{" "}
                      <Link as={RouterLink} to="/auth/login">
                        Login
                      </Link>
                    </Box>
                  </VStack>
                </Form>
            )}
          </Formik>
        </AuthCard>
        <ToastContainer />
      </BaseLayout>
  );
};
