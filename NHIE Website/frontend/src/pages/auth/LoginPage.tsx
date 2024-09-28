import {BaseLayout} from "../../layout/BaseLayout.tsx";
import {AuthCard} from "./components/AuthCard.tsx";
import {Box, Button, Heading, Input, Link, VStack} from "@chakra-ui/react";
import {Link as RouterLink} from "react-router-dom";
import {ErrorMessage, Field, Form, Formik} from "formik";
import {object} from "yup";
import {LoginUserData, useAuth} from "../../providers/AuthProvider.tsx";
import {
  emailValidation,
  passwordValidation,
} from "../../validation/validation.ts";
import "../../index.css";
import {useState} from "react";
import {toast, ToastContainer} from "react-toastify";
//import { useSocket } from "../../providers/SocketProvider.tsx";

export const LoginUserSchema = object({
  email: emailValidation,
  password: passwordValidation,
});

const initialFormValues: LoginUserData = {
  email: "",
  password: "",
};
export const LoginPage = () => {
  const {onLogin} = useAuth();
  const [loginError, setLoginError] = useState("");
  const handleLogin = async (loginData: LoginUserData) => {
    const msg = onLogin(loginData);
    if (msg != null) {
      setLoginError("Login failed. Please check your email and password.");
      toast.error("Login Error")
    } else toast.success("Login successful")
  };
  return (
      <BaseLayout>
        <AuthCard>
          <Heading>Login</Heading>

          <Formik<LoginUserData>
              initialValues={initialFormValues}
              onSubmit={handleLogin}
              validationSchema={LoginUserSchema}
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
                        borderColor={
                          formik.touched.email && formik.errors.email
                              ? "red.500"
                              : "gray.200"
                        }
                        color={
                          formik.touched.email && formik.errors.email
                              ? "red.500"
                              : "inherit"
                        }
                    />
                    <ErrorMessage name="email">
                      {(msg) => <div style={{color: "red"}}>{msg}</div>}
                    </ErrorMessage>
                    <label htmlFor="password">Password</label>
                    <Field
                        as={Input}
                        type="password"
                        id="password"
                        name="password"
                        placeholder="Password"
                        borderColor={
                          formik.touched.password && formik.errors.password
                              ? "red.500"
                              : "gray.200"
                        }
                        color={
                          formik.touched.password && formik.errors.password
                              ? "red.500"
                              : "inherit"
                        }
                    />
                    <ErrorMessage name="password">
                      {(msg) => <div style={{color: "red"}}>{msg}</div>}
                    </ErrorMessage>
                    <Button type={"submit"}>Login</Button>
                    <Box>
                      Keinen Account?{" "}
                      <Link as={RouterLink} to="/auth/register">
                        Register
                      </Link>
                    </Box>
                  </VStack>
                </Form>
            )}
          </Formik>
          {loginError && <div style={{color: "red"}}>{loginError}</div>}
        </AuthCard>
        <ToastContainer/>
      </BaseLayout>
  );
};
