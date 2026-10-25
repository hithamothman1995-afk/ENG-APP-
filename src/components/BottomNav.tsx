import type { Route } from '../router'
import { Icon } from './Icon'

export function BottomNav({ route }: { route: Route }) {
  const onHome = route.name === 'home'
  return (
    <nav className="bottom-nav" aria-label="التنقل الرئيسي">
      <a href="#/" className={onHome ? 'active' : ''} aria-current={onHome ? 'page' : undefined}>
        <Icon name="home" />
        الرئيسية
      </a>
      <a href="#/map" className={!onHome ? 'active' : ''} aria-current={!onHome ? 'page' : undefined}>
        <Icon name="map" />
        المستويات
      </a>
    </nav>
  )
}
