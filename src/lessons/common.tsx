import type { ReactNode } from 'react'
import { Icon } from '../components/Icon'

export type Finish = (stars: number) => void

export function Stars({ count, size = 28 }: { count: number; size?: number }) {
  return (
    <span className="stars" aria-label={`${count} من 3 نجوم`}>
      {[0, 1, 2].map((i) => (
        <Icon key={i} name="star" size={size} filled={i < count} />
      ))}
    </span>
  )
}

export function StepBar({ done, total }: { done: number; total: number }) {
  return (
    <div className="step-bar">
      <div className="bar">
        <div className="bar-fill" style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
      </div>
      <span className="muted small">{done} / {total}</span>
    </div>
  )
}

export function Notice({ children }: { children: ReactNode }) {
  return <p className="notice">{children}</p>
}

export function PrimaryButton({ children, onClick, disabled }: { children: ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" className="primary-button" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}
