import jwt from 'jsonwebtoken'

import { getValue, setValue } from '@/lib/redis'

import AuthError from '@app/Auth/exceptions/AuthError'

import config from '@/config'

export default class AuthService {
  async signIn(
    email: string,
    password: string,
  ): Promise<{ user: object; token: string }> {
    const user = {
      id: '123',
      email: 'admin@admin.com',
      password: 'secret',
      fullName: 'Admin',
    }

    if (email !== user.email || password !== user.password) {
      throw new AuthError('User or password not found')
    }

    const { id, fullName } = user

    return {
      user: {
        id,
        email,
        fullName,
      },
      token: jwt.sign({ id }, config.auth.secret, {
        expiresIn: config.auth.expiresIn,
      }),
    }
  }

  async signOut(token: string) {
    await this.blacklistToken(token)
  }

  async validateToken(token: string): Promise<string> {
    try {
      if (await this.isTokenBlacklisted(token))
        throw new AuthError('Token was blacklisted.')

      const userDecoded = jwt.verify(token, config.auth.secret) as {
        id: string
      }

      return userDecoded.id
    } catch (error) {
      console.error(error)
      throw new AuthError('Invalid token.')
    }
  }

  private async isTokenBlacklisted(token: string): Promise<boolean> {
    const blacklistedToken = await getValue(`tokens:invalidated:${token}`)

    return !!blacklistedToken
  }

  private async blacklistToken(token: string): Promise<void> {
    await setValue(`tokens:invalidated:${token}`, true)
  }
}
