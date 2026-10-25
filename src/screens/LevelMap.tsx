import { isClassAvailable, levels } from '../content'
import { En } from '../components/En'
import { href } from '../router'

export function LevelMap() {
  return (
    <main className="screen">
      <header className="screen-header">
        <div>
          <h1>خريطة المستويات</h1>
          <p className="muted">كل مستوى فيه كلاسات، وكل كلاس موقف من الحياة.</p>
        </div>
      </header>

      <ol className="level-list">
        {levels.map((level, i) => {
          const open = level.classes.some((c) => isClassAvailable(c.id))
          return (
            <li key={level.id} className={`level ${open ? 'open' : 'locked'}`}>
              <div className="level-head">
                <span className="level-number">{i + 1}</span>
                <div>
                  <h2>{level.titleAr}</h2>
                  <p className="muted">{level.descriptionAr}</p>
                </div>
                {!open && <span className="lock" aria-label="مقفل">🔒</span>}
              </div>
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
                      <span aria-hidden>{available ? '←' : '🔒'}</span>
                    </>
                  )
                  return (
                    <li key={c.id}>
                      {available ? (
                        <a className="class-row" href={href({ name: 'class', classId: c.id })}>
                          {body}
                        </a>
                      ) : (
                        <div className="class-row disabled" aria-disabled="true" title="سيُفتح لاحقًا">
                          {body}
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            </li>
          )
        })}
      </ol>
    </main>
  )
}
