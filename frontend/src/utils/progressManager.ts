// Progress Manager for handling level completion and unlocking
export interface LevelProgress {
  levelId: number
  isCompleted: boolean
  score: number
  total: number
  percentage: number
  xpEarned: number
  completedAt: string
}

export interface UserProgress {
  totalXP: number
  completedLevels: number[]
  currentStreak: number
  hearts: number
  highestUnlockedLevel: number
}

class ProgressManager {
  private static instance: ProgressManager
  private progress: Map<number, LevelProgress> = new Map()
  private userProgress: UserProgress = {
    totalXP: 0,
    completedLevels: [],
    currentStreak: 0,
    hearts: 5,
    highestUnlockedLevel: 1
  }
  private currentUserId: number | null = null

  private constructor() {
    this.loadFromLocalStorage()
  }

  public static getInstance(): ProgressManager {
    if (!ProgressManager.instance) {
      ProgressManager.instance = new ProgressManager()
    }
    return ProgressManager.instance
  }

  // Set current user
  public setCurrentUser(userId: number) {
    this.currentUserId = userId
    this.loadFromLocalStorage()
  }

  // Load progress from localStorage
  private loadFromLocalStorage() {
    try {
      const userId = this.currentUserId
      if (!userId) return

      const savedProgress = localStorage.getItem(`lingo_progress_${userId}`)
      if (savedProgress) {
        const data = JSON.parse(savedProgress)
        this.progress = new Map(data.progress || [])
        this.userProgress = data.userProgress || this.userProgress
      }
    } catch (error) {
      console.error('Error loading progress from localStorage:', error)
    }
  }

  // Save progress to localStorage
  private saveToLocalStorage() {
    try {
      const userId = this.currentUserId
      if (!userId) return

      const data = {
        progress: Array.from(this.progress.entries()),
        userProgress: this.userProgress
      }
      localStorage.setItem(`lingo_progress_${userId}`, JSON.stringify(data))
    } catch (error) {
      console.error('Error saving progress to localStorage:', error)
    }
  }

  // Complete a level
  public async completeLevel(levelNumber: number, score: number, total: number, xpEarned: number): Promise<LevelProgress> {
    console.log(`DEBUG - completeLevel called:`, { levelNumber, score, total, xpEarned })
    
    const percentage = Math.round((score / total) * 100)
    const passed = percentage >= 80

    console.log(`DEBUG - Level completion:`, { percentage, passed })

    const levelProgress: LevelProgress = {
      levelId: levelNumber,
      isCompleted: passed,
      score,
      total,
      percentage,
      xpEarned: passed ? xpEarned : 0,
      completedAt: new Date().toISOString()
    }

    this.progress.set(levelNumber, levelProgress)

    if (passed) {
      // Update user progress
      this.userProgress.totalXP += xpEarned
      if (!this.userProgress.completedLevels.includes(levelNumber)) {
        this.userProgress.completedLevels.push(levelNumber)
      }
      
      // Unlock next level (unlock the next level after current one)
      if (levelNumber >= this.userProgress.highestUnlockedLevel) {
        const oldHighest = this.userProgress.highestUnlockedLevel
        this.userProgress.highestUnlockedLevel = levelNumber + 1
        console.log(`DEBUG - Level unlocked:`, {
          completedLevelNumber: levelNumber,
          oldHighestUnlocked: oldHighest,
          newHighestUnlocked: this.userProgress.highestUnlockedLevel
        })
      }

      // Update streak (simplified - just increment for now)
      this.userProgress.currentStreak += 1
    } else {
      // Lose a heart on failure
      this.userProgress.hearts = Math.max(0, this.userProgress.hearts - 1)
    }

    // Save to backend
    await this.saveProgressToBackend(levelNumber, score, total, xpEarned, passed)

    this.saveToLocalStorage()
    return levelProgress
  }

  // Save progress to backend
  private async saveProgressToBackend(levelNumber: number, score: number, total: number, xpEarned: number, passed: boolean): Promise<void> {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        console.log('No auth token found, skipping backend save')
        return
      }

      // First, get the level ID from level number
      const levelResponse = await fetch(`http://localhost:8000/api/levels/levels/?level_number=${levelNumber}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!levelResponse.ok) {
        console.error('Failed to get level ID from level number')
        return
      }

      const levelData = await levelResponse.json()
      const levelId = levelData.results?.[0]?.id || levelData[0]?.id

      if (!levelId) {
        console.error('Level ID not found for level number:', levelNumber)
        return
      }

      const response = await fetch('http://localhost:8000/api/progress/save/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          level_id: levelId,
          score: score,
          total: total,
          xp_earned: xpEarned,
          passed: passed,
          time_spent: 0 // TODO: Calculate actual time spent
        })
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Progress saved to backend:', data)
      } else {
        console.error('Failed to save progress to backend:', response.status)
      }
    } catch (error) {
      console.error('Error saving progress to backend:', error)
    }
  }

  // Get level progress
  public getLevelProgress(levelNumber: number): LevelProgress | null {
    return this.progress.get(levelNumber) || null
  }

  // Get user progress
  public getUserProgress(): UserProgress {
    return { ...this.userProgress }
  }

  // Check if level is unlocked
  public isLevelUnlocked(levelNumber: number): boolean {
    const isUnlocked = levelNumber <= this.userProgress.highestUnlockedLevel
    console.log(`DEBUG - Level ${levelNumber} unlock check:`, {
      levelNumber,
      highestUnlockedLevel: this.userProgress.highestUnlockedLevel,
      isUnlocked
    })
    return isUnlocked
  }

  // Check if level is completed
  public isLevelCompleted(levelNumber: number): boolean {
    const progress = this.progress.get(levelNumber)
    return progress ? progress.isCompleted : false
  }

  // Get completion percentage for a level
  public getLevelCompletionPercentage(levelNumber: number): number {
    const progress = this.progress.get(levelNumber)
    return progress ? progress.percentage : 0
  }

  // Regenerate hearts (simplified - regenerate after 1 hour)
  public regenerateHearts() {
    const lastRegen = localStorage.getItem('lingo_last_heart_regen')
    const now = Date.now()
    const oneHour = 60 * 60 * 1000

    if (!lastRegen || now - parseInt(lastRegen) > oneHour) {
      this.userProgress.hearts = Math.min(5, this.userProgress.hearts + 1)
      localStorage.setItem('lingo_last_heart_regen', now.toString())
      this.saveToLocalStorage()
    }
  }

  // Reset all progress (for testing)
  public resetProgress() {
    this.progress.clear()
    this.userProgress = {
      totalXP: 0,
      completedLevels: [],
      currentStreak: 0,
      hearts: 5,
      highestUnlockedLevel: 1
    }
    this.saveToLocalStorage()
  }
}

export default ProgressManager
