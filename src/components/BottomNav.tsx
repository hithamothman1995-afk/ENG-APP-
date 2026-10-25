import type { Route } from '../router'

export function BottomNav({ route }: { route: Route }) {
  const onMap = route.name !== 'home'
  return (
    <nav className="bottom-nav" aria-label="التنقل الرئيسي">
      <a href="#/" className={!onMap ? 'active' : ''} aria-current={!onMap ? 'page' : undefined}>
        <span aria-hidden>🏠</span>
        الرئيسية
      </a>
      <a href="#/map" className={onMap ? 'active' : ''} aria-current={onMap ? 'page' : undefined}>
        <span aria-hidden>🗺️</span>
        المستويات
      </a>
    </nav>
  )
}
