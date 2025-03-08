import { Router } from "express"
import localAuthenticationController from "./controllers/auth/localAuthenticationController"
import googleAuthenticationController from "./controllers/auth/googleAuthenticationController"
import authenticationController from "./controllers/auth/authenticationController"

export default async function createRouter(): Promise<Router> {
  const router = Router()

  router.use("/Authentication", await authenticationController.router())
  router.use("/Authentication", await localAuthenticationController.router())
  router.use("/Authentication", await googleAuthenticationController.router())

  return router
}