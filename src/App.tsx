import { BottomNav } from './components/BottomNav'
import { useRoute } from './router'
import { ClassScreen } from './screens/ClassScreen'
import { Dashboard } from './screens/Dashboard'
import { LessonScreen } from './screens/LessonScreen'
import { LevelMap } from './screens/LevelMap'
import { WelcomeScreen } from './screens/WelcomeScreen'
import { useStudyTimer } from './storage/useStudyTimer'

export function App() {
  const route = useRoute()
  useStudyTimer(route.name === 'class' || route.name === 'lesson')

  return (
    <div className="app">
      {route.name === 'home' && <Dashboard />}
      {route.name === 'map' && <LevelMap />}
      {route.name === 'welcome' && <WelcomeScreen />}
      {route.name === 'class' && <ClassScreen classId={route.classId} />}
      {route.name === 'lesson' && <LessonScreen classId={route.classId} lessonId={route.lessonId} />}
      <BottomNav route={route} />
    </div>
  )
}
