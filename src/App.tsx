import { BottomNav } from './components/BottomNav'
import { useRoute } from './router'
import { ClassScreen } from './screens/ClassScreen'
import { Dashboard } from './screens/Dashboard'
import { LessonScreen } from './screens/LessonScreen'
import { LevelMap } from './screens/LevelMap'
import { CertificateScreen } from './screens/CertificateScreen'
import { EarScreen } from './screens/EarScreen'
import { PlacementScreen } from './screens/PlacementScreen'
import { ReviewScreen } from './screens/ReviewScreen'
import { WelcomeScreen } from './screens/WelcomeScreen'
import { useStudyTimer } from './storage/useStudyTimer'

export function App() {
  const route = useRoute()
  useStudyTimer(route.name === 'class' || route.name === 'lesson' || route.name === 'review' || route.name === 'ear')

  return (
    <div className="app">
      {route.name === 'home' && <Dashboard />}
      {route.name === 'map' && <LevelMap />}
      {route.name === 'welcome' && <WelcomeScreen />}
      {route.name === 'placement' && <PlacementScreen />}
      {route.name === 'review' && <ReviewScreen />}
      {route.name === 'ear' && <EarScreen />}
      {route.name === 'certificate' && <CertificateScreen levelId={route.levelId} />}
      {route.name === 'class' && <ClassScreen classId={route.classId} />}
      {route.name === 'lesson' && <LessonScreen classId={route.classId} lessonId={route.lessonId} />}
      {route.name !== 'placement' && <BottomNav route={route} />}
    </div>
  )
}
