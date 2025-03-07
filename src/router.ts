import express from "express"
import AuthenticationController from "./controllers/authenticationController"

const router = express.Router()

router.use("/auth", new AuthenticationController().router)

export default router