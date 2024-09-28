import bcrypt from 'bcrypt';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';

import { DI } from '../server';

const BCRYPT_SALT = 10;

const JWT_SECRET = 'JWT_SECRET';
const JWT_OPTIONS: SignOptions = {
    expiresIn: 3600, // in seconds
    issuer: 'http://fwe.auth',
};

// password functionality
const hashPassword = (password: string) => bcrypt.hash(password, BCRYPT_SALT);
const comparePasswordWithHash = async (password: string, hash: string) => {
    try {
        return await bcrypt.compare(password, hash);
    } catch {
        return false;
    }
};

// jwt functionality
type JwtUserData = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
};
export type JWTToken = JwtUserData & JwtPayload;

const generateToken = (payload: JwtUserData) => {
    return jwt.sign(payload, JWT_SECRET, JWT_OPTIONS);
};
const verifyToken = (token: string) => {
    return jwt.verify(token, JWT_SECRET) as JWTToken;
};

// middleware
const prepareAuthentication = async (req: Request, _res: Response, next: NextFunction) => {
    const authHeader = req.get('Authorization');
    if (authHeader) {
        try {
            const token = verifyToken(authHeader);
            req.user = await DI.userRepository.findOne(token.id);
            req.token = token;
        } catch (e) {
            console.error(e);
        }
    } else {
        req.user = null;
        req.token = null;
    }
    next();
};

const verifyAccess: RequestHandler = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ errors: [`You don't have access`] });
    }
    next();
};

// exports
export const Auth = {
    comparePasswordWithHash,
    generateToken,
    hashPassword,
    prepareAuthentication,
    verifyAccess,
    verifyToken,
};
