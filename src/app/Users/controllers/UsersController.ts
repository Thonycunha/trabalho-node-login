import { Request, Response } from 'express'

class UsersController {
  async index(_req: Request, res: Response): Promise<Response | undefined> {
    const users = [{ id: '123', email: 'thony@example.com' }]

    return res.json(users)
  }
}

export default new UsersController()
