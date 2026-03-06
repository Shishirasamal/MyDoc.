import express from "express";
import { sendMessage, getAllMessages, deleteMessage } from "../controller/messageController.js";
import { isAdminAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/send", sendMessage);
router.get("/getall", isAdminAuthenticated, getAllMessages);

/* NEW DELETE ROUTE */
router.delete("/delete/:id", isAdminAuthenticated, deleteMessage);

export default router;