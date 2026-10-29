import { isClassAvailable, levels } from '../content'
import { En } from '../components/En'
import { Icon } from '../components/Icon'
import { href } from '../router'

export function LevelMap() {
  return (
    <main className="screen">
      <header>
        <h1>خريطة المستويات</h1>
        <p className="muted">ثمانية مستويات، كل كلاس فيها موقف من الحياة.</p>
        <a className="link-button" href={href({ name: 'welcome' })}>🧭 الجولة الترحيبية: عن الدورة</a>
      </header>

      <ol className="path">
        {levels.map((level, i) => {
          const open = level.classes.some((c) => isClassAvailable(c.id))
          return (
            <li key={level.id} className={`path-level ${open ? 'open' : 'locked'}`}>
              <div className="path-node" aria-hidden>
                {open ? i + 1 : <Icon name="lock" size={18} />}
              </div>
              <div className="path-body">
                <span className="eyebrow">المستوى {i + 1}</span>
                <h2>{level.titleAr}</h2>
                <p className="muted">{level.descriptionAr}</p>
                <ul className="class-list">
                  {level.classes.map((c) => {
                    const available = isClassAvailable(c.id)
                    const body = (
                      <>
                        <span className="class-icon" aria-hidden>{c.icon}</span>
                        <span className="class-titles">
                          <strong>{c.titleAr}</strong>
                          <En>{c.titleEn}</En>
                        </span>
                        <span className="class-end">
                          {available ? <Icon name="chevron" size={20} /> : <Icon name="lock" size={18} />}
                        </span>
                      </>
                    )
                    return (
                      <li key={c.id}>
                        {available ? (
                          <a className="class-row" href={href({ name: 'class', classId: c.id })}>
                            {body}
                          </a>
                        ) : (
                          <div className="class-row disabled" aria-disabled="true">
                            {body}
                          </div>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            </li>
          )
        })}
      </ol>
    </main>
  )
}
