import express from "express";
import MyUserController from"../controllers/MyUserController";
import { jwtCheck, jwtParse } from "../middleware/auth";
import { validationMyUserRequest } from "../middleware/validation";
// import { validateMyUserRequest } from "../middleware/validation";

const router = express.Router();

// /api/my/user
router.get("/", jwtCheck, jwtParse, MyUserController.getCurrentUser);
router.post("/", jwtCheck, MyUserController.createCurrentUser);
router.put(
    "/",
    jwtCheck,
    jwtParse,
    validationMyUserRequest,
    MyUserController.updateCurrentUser);

export default router;