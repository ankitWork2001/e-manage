import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || "secretKey";

// Generate JWT for a user
export function generateTokenForUser(user) {
    return jwt.sign(
        { _id: user._id },
        JWT_SECRET_KEY,
        { expiresIn: "7d" }
    );
}

// Verify JWT and extract user info
export function getUserByToken(token) {
    if (!token) return null;

    try {
        const decoded = jwt.verify(token, JWT_SECRET_KEY);
        return decoded;
    } catch (error) {
        console.error("JWT verification error:", error.message);
        return null;
    }
}

// Middleware to check if user is authenticated via cookies
export function checkUserAuthentication(cookieKey = "authToken") {
    return (req, res, next) => {
        const token = req.cookies?.[cookieKey];
        if (!token) return next();

        const user = getUserByToken(token);
        if (user) {
            req.user = user;
        }

        return next();
    };
}
