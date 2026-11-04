// تدريب الأذن: نختار كلمة من زوج متقارب، ونغيّر الصوت كل جولة
export interface EarGroup {
  id: string
  titleAr: string
  tipAr: string
  pairs: [string, string][]
}

export interface EarRound {
  groupId: string
  pair: [string, string]
  answer: 0 | 1
  voice: number
  gender: 'female' | 'male'
}

// rand يمرَّر عشان نقدر نختبرها
export function makeRounds(groups: EarGroup[], count: number, rand: () => number = Math.random): EarRound[] {
  const rounds: EarRound[] = []
  for (let i = 0; i < count; i++) {
    const g = groups[i % groups.length]
    const pair = g.pairs[Math.floor(rand() * g.pairs.length)]
    rounds.push({
      groupId: g.id,
      pair,
      answer: rand() < 0.5 ? 0 : 1,
      voice: i, // كل جولة رقم صوت مختلف
      gender: i % 2 === 0 ? 'female' : 'male', // ونبدّل بين صوت بنت وولد
    })
  }
  return rounds
}
