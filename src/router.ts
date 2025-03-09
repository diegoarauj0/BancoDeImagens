import { Router } from "express"
import localAuthenticationController from "./controllers/auth/localAuthenticationController"
import googleAuthenticationController from "./controllers/auth/googleAuthenticationController"
import authenticationController from "./controllers/auth/authenticationController"

export default function createRouter(): Router {
  const router = Router()

  router.use("/Authentication", authenticationController.getRouter)
  router.use("/Authentication", localAuthenticationController.getRouter)
  router.use("/Authentication", googleAuthenticationController.getRouter)

  return router
}