/**
 * User authentication routes
 */
import { Router, type Request, type Response } from 'express'

const router = Router()

interface UserData {
  id: string
  nickname: string
  avatar: string
  currentLevel: number
  completedLevels: number[]
  totalScore: number
  highestScore: number
  totalStars: number
  totalPlays: number
  totalEliminations: number
  coins: number
  diamonds: number
  energy: number
  maxEnergy: number
  powerups: { refresh: number; hammer: number; moves: number }
  settings: { isEyeCareMode: boolean; soundEnabled: boolean; vibrationEnabled: boolean }
  achievements: { id: string; name: string; unlocked: boolean; unlockDate?: number; progress: number; target: number }[]
  ownedSkins: string[]
  activeSkin: string
  createdAt: string
  lastLoginDate: string
  lastActiveTime: string
  energyLastUpdate: string
}

const users: Map<string, UserData> = new Map()
const tokens: Map<string, string> = new Map()

const generateToken = (userId: string): string => {
  return `token_${userId}_${Date.now()}`
}

const createUser = (id: string, nickname: string): UserData => ({
  id,
  nickname,
  avatar: '👤',
  currentLevel: 1,
  completedLevels: [],
  totalScore: 0,
  highestScore: 0,
  totalStars: 0,
  totalPlays: 0,
  totalEliminations: 0,
  coins: 100,
  diamonds: 10,
  energy: 30,
  maxEnergy: 30,
  powerups: { refresh: 1, hammer: 1, moves: 1 },
  settings: { isEyeCareMode: false, soundEnabled: true, vibrationEnabled: true },
  achievements: [
    { id: 'first_win', name: '初次胜利', unlocked: false, progress: 0, target: 1 },
    { id: 'score_1000', name: '千分达人', unlocked: false, progress: 0, target: 1000 },
    { id: 'level_10', name: '初露锋芒', unlocked: false, progress: 0, target: 10 },
    { id: 'combo_5', name: '五连击', unlocked: false, progress: 0, target: 5 },
  ],
  ownedSkins: ['default'],
  activeSkin: 'default',
  createdAt: new Date().toISOString(),
  lastLoginDate: new Date().toISOString(),
  lastActiveTime: new Date().toISOString(),
  energyLastUpdate: new Date().toISOString(),
})

router.post('/wechat-login', async (req: Request, res: Response): Promise<void> => {
  const { code } = req.body
  const userId = `user_${code || Date.now()}`
  
  let user = users.get(userId)
  if (!user) {
    user = createUser(userId, `玩家_${Math.random().toString(36).substr(2, 8)}`)
    users.set(userId, user)
  }
  
  const accessToken = generateToken(userId)
  tokens.set(accessToken, userId)
  
  res.json({ accessToken, user })
})

router.post('/guest-login', async (req: Request, res: Response): Promise<void> => {
  const { deviceId } = req.body
  const userId = `guest_${deviceId || Date.now()}`
  
  let user = users.get(userId)
  if (!user) {
    user = createUser(userId, `游客_${Math.random().toString(36).substr(2, 8)}`)
    users.set(userId, user)
  }
  
  const accessToken = generateToken(userId)
  tokens.set(accessToken, userId)
  
  res.json({ accessToken, user })
})

router.get('/profile', async (req: Request, res: Response): Promise<void> => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: '未授权' })
    return
  }
  
  const token = authHeader.split(' ')[1]
  const userId = tokens.get(token)
  
  if (!userId) {
    res.status(401).json({ success: false, message: '无效token' })
    return
  }
  
  const user = users.get(userId)
  if (!user) {
    res.status(404).json({ success: false, message: '用户不存在' })
    return
  }
  
  res.json(user)
})

router.put('/settings', async (req: Request, res: Response): Promise<void> => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: '未授权' })
    return
  }
  
  const token = authHeader.split(' ')[1]
  const userId = tokens.get(token)
  
  if (!userId) {
    res.status(401).json({ success: false, message: '无效token' })
    return
  }
  
  const user = users.get(userId)
  if (!user) {
    res.status(404).json({ success: false, message: '用户不存在' })
    return
  }
  
  const { isEyeCareMode, soundEnabled, vibrationEnabled } = req.body
  if (isEyeCareMode !== undefined) user.settings.isEyeCareMode = isEyeCareMode
  if (soundEnabled !== undefined) user.settings.soundEnabled = soundEnabled
  if (vibrationEnabled !== undefined) user.settings.vibrationEnabled = vibrationEnabled
  
  users.set(userId, user)
  res.json({ success: true })
})

router.put('/skin', async (req: Request, res: Response): Promise<void> => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: '未授权' })
    return
  }
  
  const token = authHeader.split(' ')[1]
  const userId = tokens.get(token)
  
  if (!userId) {
    res.status(401).json({ success: false, message: '无效token' })
    return
  }
  
  const user = users.get(userId)
  if (!user) {
    res.status(404).json({ success: false, message: '用户不存在' })
    return
  }
  
  const { skinId } = req.body
  if (user.ownedSkins.includes(skinId)) {
    user.activeSkin = skinId
    users.set(userId, user)
    res.json({ success: true, skinId })
  } else {
    res.status(400).json({ success: false, message: '未拥有该皮肤' })
  }
})

router.post('/energy/consume', async (req: Request, res: Response): Promise<void> => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: '未授权' })
    return
  }
  
  const token = authHeader.split(' ')[1]
  const userId = tokens.get(token)
  
  if (!userId) {
    res.status(401).json({ success: false, message: '无效token' })
    return
  }
  
  const user = users.get(userId)
  if (!user) {
    res.status(404).json({ success: false, message: '用户不存在' })
    return
  }
  
  const { amount = 5 } = req.body
  if (user.energy >= amount) {
    user.energy -= amount
    users.set(userId, user)
    res.json({ success: true, energy: user.energy })
  } else {
    res.status(400).json({ success: false, message: '体力不足' })
  }
})

router.post('/energy/recover', async (req: Request, res: Response): Promise<void> => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: '未授权' })
    return
  }
  
  const token = authHeader.split(' ')[1]
  const userId = tokens.get(token)
  
  if (!userId) {
    res.status(401).json({ success: false, message: '无效token' })
    return
  }
  
  const user = users.get(userId)
  if (!user) {
    res.status(404).json({ success: false, message: '用户不存在' })
    return
  }
  
  user.energy = user.maxEnergy
  user.energyLastUpdate = new Date().toISOString()
  users.set(userId, user)
  res.json({ success: true, energy: user.energy })
})

// 清除所有数据的API
router.post('/clear-all-data', async (req: Request, res: Response): Promise<void> => {
  users.clear()
  tokens.clear()
  res.json({ success: true, message: '所有数据已清除' })
})

export default router
