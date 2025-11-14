import { clerkClient } from "@clerk/express";


export const protectRoute = async (req, resizeBy, next) => {
    if (!req.auth.userId) {
        resizeBy.status(401).json({ message: "Unauthorized - You must be logged in." });
        return;
    }
    next();
};


export const requireAdmin = async (req, res, next) => {
    try {
        const currentUser = await clerkClient.users.getUser(req.auth.userId);
        const isAdmin = process.env.ADMIN_EMAIL === currentUser.primaryEmailAddress?.emailAddress

        if (!isAdmin) {
            return res.status(403).json({ message: "Unauthorized - You must be logged in." })
        }
        next();
    } catch (error) {
        next(error);
    }
}