import type { ReactNode } from 'react'

// أي نص إنجليزي يُعرض من اليسار لليمين داخل الواجهة العربية
export function En({ children }: { children: ReactNode }) {
  return (
    <span dir="ltr" lang="en" className="en">
      {children}
    </span>
  )
}
