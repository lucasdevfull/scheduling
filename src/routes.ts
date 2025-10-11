import { authController } from './controllers/auth.controller.ts'
import { serviceController } from './controllers/availabilities.controller.ts'
import { userController } from './controllers/user.controller.ts'

export const routes = [authController, userController, serviceController]
