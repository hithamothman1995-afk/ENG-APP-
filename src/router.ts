import { useEffect, useState } from 'react'

// تنقل بسيط عبر رابط الصفحة (#/map مثلًا) بدون مكتبة إضافية
export type Route =
  | { name: 'home' }
  | { name: 'map' }
  | { name: 'class'; classId: string }
  | { name: 'lesson'; classId: string; lessonId: string }

export function parseRoute(hash: string): Route {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean)
  if (parts[0] === 'map') return { name: 'map' }
  if (parts[0] === 'class' && parts[1]) {
    if (parts[2]) return { name: 'lesson', classId: parts[1], lessonId: parts[2] }
    return { name: 'class', classId: parts[1] }
  }
  return { name: 'home' }
}

export function href(route: Route): string {
  switch (route.name) {
    case 'home':
      return '#/'
    case 'map':
      return '#/map'
    case 'class':
      return `#/class/${route.classId}`
    case 'lesson':
      return `#/class/${route.classId}/${route.lessonId}`
  }
}

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parseRoute(window.location.hash))
  useEffect(() => {
    const onChange = () => {
      setRoute(parseRoute(window.location.hash))
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}
