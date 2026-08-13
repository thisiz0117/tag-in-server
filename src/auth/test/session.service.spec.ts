import { SessionService } from '../session.service'
import { type Request, type Response } from 'express'
import { type Repository } from 'typeorm'
import { Users } from '../../user/database/user.schema'

describe('SessionService', () => {
  let sessionService: SessionService

  const mockUsersRepository = {
    findOne: jest.fn(),
  } as unknown as Repository<Users>

  const mockRedis = {
    set: jest.fn(),
    exists: jest.fn(),
    del: jest.fn(),
  }

  const mockConfigService = {
    get: jest.fn((key: string) => {
      switch (key) {
        case 'IS_PRODUCTION':
          return false
        case 'ACCESS_TOKEN_SECRET':
          return 'access-secret'
        case 'REFRESH_TOKEN_SECRET':
          return 'refresh-secret'
        default:
          return undefined
      }
    }),
  }

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  }

  const mockResponse = {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  } as unknown as Response

  beforeEach(() => {
    jest.clearAllMocks()

    sessionService = new SessionService(
      mockUsersRepository,
      mockRedis as any,
      mockConfigService as any,
      mockJwtService as any,
    )
  })

  describe('sign', () => {
    it('should create access and refresh cookies and persist refresh key in redis', async () => {
      mockJwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token')

      const reqUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Tester',
        profile: 'https://example.com/avatar.png',
        role: 'USER',
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      await sessionService.sign(mockResponse, reqUser as any)

      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2)
      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          email: 'test@example.com',
          name: 'Tester',
        }),
        expect.objectContaining({
          secret: 'access-secret',
          expiresIn: 60 * 15,
        }),
      )
      expect(mockJwtService.signAsync).toHaveBeenLastCalledWith(
        expect.objectContaining({
          id: 1,
          jti: expect.any(String),
        }),
        expect.objectContaining({
          secret: 'refresh-secret',
          expiresIn: 60 * 60 * 24 * 30,
        }),
      )
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        '__Host-ACS',
        'access-token',
        expect.objectContaining({
          httpOnly: true,
          secure: true,
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 15 * 1000,
        }),
      )
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        '__Host-REF',
        'refresh-token',
        expect.objectContaining({
          httpOnly: true,
          secure: true,
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 30 * 1000,
        }),
      )
      expect(mockRedis.set).toHaveBeenCalledWith(
        expect.stringMatching(/^refresh:1:[\w-]+$/),
        '',
        'EX',
        60 * 60 * 24 * 30,
      )
    })
  })

  describe('refresh', () => {
    it('should verify refresh token, validate redis session, and set new cookies', async () => {
      const refreshPayload = { id: 1, jti: 'token-jti' }
      mockJwtService.verifyAsync.mockResolvedValue(refreshPayload)
      mockRedis.exists.mockResolvedValue(1)
      mockUsersRepository.findOne = jest.fn().mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        name: 'Tester',
        profile: 'https://example.com/avatar.png',
        role: 'USER',
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      mockJwtService.signAsync
        .mockResolvedValueOnce('new-access-token')
        .mockResolvedValueOnce('new-refresh-token')

      const req = { cookies: { '__HOST-REF': 'refresh-cookie' } } as unknown as Request

      await sessionService.refresh(req, mockResponse)

      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith('refresh-cookie', {
        secret: 'refresh-secret',
      })
      expect(mockRedis.exists).toHaveBeenCalledWith('refresh:1:token-jti')
      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } })
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        '__HOST-ACS',
        'new-access-token',
        expect.objectContaining({ path: '/', httpOnly: true }),
      )
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        '__HOST-REF',
        'new-refresh-token',
        expect.objectContaining({ path: '/', httpOnly: true }),
      )
    })
  })

  describe('revoke', () => {
    it('should clear cookies and delete the refresh key from redis', async () => {
      mockJwtService.verifyAsync.mockResolvedValue({ id: 1, jti: 'token-jti' })
      mockRedis.del.mockResolvedValue(1)

      const req = {
        cookies: { '__HOST-ACS': 'access-cookie', '__HOST-REF': 'refresh-cookie' },
      } as unknown as Request

      await sessionService.revoke(req, mockResponse)

      expect(mockResponse.clearCookie).toHaveBeenCalledWith('__HOST-ACS')
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('__HOST-REF')
      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith('refresh-cookie', {
        secret: 'refresh-secret',
      })
      expect(mockRedis.del).toHaveBeenCalledWith('refresh:1:token-jti')
    })
  })
})
