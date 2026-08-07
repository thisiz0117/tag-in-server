import { Test, TestingModule } from '@nestjs/testing'
import { AuthController } from '../auth.controller'
import { SessionService } from '../session.service'
import { type Request, type Response } from 'express'

describe('AuthController', () => {
  let authController: AuthController
  let sessionService: SessionService

  const mockSessionService = {
    sign: jest.fn(),
    refresh: jest.fn(),
    revoke: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: SessionService,
          useValue: mockSessionService,
        },
      ],
    }).compile()

    authController = module.get<AuthController>(AuthController)
    sessionService = module.get<SessionService>(SessionService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(authController).toBeDefined()
  })

  describe('googleEntry', () => {
    it('should be defined', () => {
      expect(authController.googleEntry).toBeDefined()
    })
  })

  describe('googleCallback', () => {
    it('should call sessionService.sign and redirect', async () => {
      const req = { user: { id: 1, email: 'test@example.com', name: 'Test User' } } as unknown as Request
      const res = { redirect: jest.fn(), cookie: jest.fn() } as unknown as Response

      await authController.googleCallback(req, res)

      // @ts-ignore
      expect(mockSessionService.sign).toHaveBeenCalledWith(res, req.user)
      expect(res.redirect).toHaveBeenCalledWith('http://localhost:3000/')
    })
  })

  describe('refreshSession', () => {
    it('should call sessionService.refresh with request and response', async () => {
      const req = { cookies: {} } as unknown as Request
      const res = { cookie: jest.fn(), clearCookie: jest.fn() } as unknown as Response
      mockSessionService.refresh.mockResolvedValue('refreshed')

      const result = await authController.refreshSession(req, res)

      expect(mockSessionService.refresh).toHaveBeenCalledWith(req, res)
      expect(result).toBe('refreshed')
    })
  })

  describe('revokeSession', () => {
    it('should call sessionService.revoke with request and response', async () => {
      const req = { cookies: {} } as unknown as Request
      const res = { cookie: jest.fn(), clearCookie: jest.fn() } as unknown as Response
      mockSessionService.revoke.mockResolvedValue(undefined)

      const result = await authController.revokeSession(req, res)

      expect(mockSessionService.revoke).toHaveBeenCalledWith(req, res)
      expect(result).toBeUndefined()
    })
  })
})
