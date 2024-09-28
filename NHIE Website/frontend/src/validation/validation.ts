import { string } from "yup";
export const emailValidation = string()
    .required()
    .matches(
        /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
        'Invalid email address'
    );

export const passwordValidation = string()
    .required()
    .min(6, 'Password must be at least 6 characters');
