import { pct as pctStr } from '../../lib/format.js'

const COLOR_OPTIMAL = '#16A34A'
const COLOR_SEDANG = '#F59E0B'
const COLOR_BERLEBIH = '#EF4444'

// Batas konsumsi harian per komponen (dipindah dari kartu Nutri-Level ke chart ini
// sebagai legenda). Ditampilkan di bawah tiap batang + baris legenda.
const DAILY_LIMIT = { Gula: '50 g', Natrium: '5 g', Lemak: '67 g' }

function barColor(pct) {
  if (pct == null) return COLOR_OPTIMAL
  if (pct >= 100) return COLOR_BERLEBIH
  if (pct >= 50)  return COLOR_SEDANG
  return COLOR_OPTIMAL
}

// Grafik batang: %AKG per SAJIAN terhadap batas harian.
// Garis 100% = batas konsumsi harian (user tahu di mana batasnya).
export default function IntakeChart({ calc }) {
  const p = calc.pct_harian_sajian || calc.pct_harian_kemasan
  const bars = [
    ['Gula',    p.gula,    barColor(p.gula)],
    ['Natrium', p.natrium, barColor(p.natrium)],
    ['Lemak',   p.lemak,   barColor(p.lemak)],
  ].filter(([, v]) => v != null)

  if (bars.length === 0) return null

  const MAXH = 150
  const CEIL = 120
  const guide = Math.round((100 / CEIL) * MAXH)

  return (
    <div className="ns-chart-card">
      <div className="ns-chart-head">
        <div className="ns-chart-title">Asupan vs Batas Harian</div>
        <div className="ns-chart-legend">
          <Legend color={COLOR_OPTIMAL} label="Optimal" />
          <Legend color={COLOR_SEDANG}  label="Sedang" />
          <Legend color={COLOR_BERLEBIH} label="Berlebih" />
        </div>
      </div>
      <div className="ns-chart-sub">
        %AKG per sajian terhadap batas konsumsi harian
      </div>

      <div className="ns-chart-plot">
        <div className="ns-chart-yaxis">% Batas Harian</div>
        <div className="ns-chart-grid">
          {/* garis 100% = BATAS konsumsi harian */}
          <div className="ns-guide ns-guide-100" style={{ bottom: guide + 40 }}>
            <span className="ns-guide-tag ns-guide-limit">Batas harian · 100%</span>
          </div>
          <div className="ns-guide ns-guide-0" style={{ bottom: 40 }}>
            <span className="ns-guide-tag">0%</span>
          </div>

          <div className="ns-bars" style={{ height: MAXH + 40 }}>
            {bars.map(([name, val, color]) => {
              const capped = Math.min(Math.max(val, 0), CEIL)
              const h = val > 0 ? Math.max(6, Math.round((capped / CEIL) * MAXH)) : 3
              return (
                <div className="ns-bar-col" key={name}>
                  <div className="ns-bar-track" style={{ height: MAXH }}>
                    <div className="ns-bar-pct" style={{ bottom: h + 6, color }}>
                      {pctStr(val)}
                    </div>
                    <div className="ns-bar-fill" style={{ height: h, background: color }} />
                  </div>
                  <div className="ns-bar-label">
                    <b>{name}</b>
                    <small>batas {DAILY_LIMIT[name]}/hari</small>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Legenda batas konsumsi harian (dipindah dari kartu Nutri-Level) */}
      <div className="ns-chart-limits">
        <span className="ns-chart-limits-title">Batas konsumsi harian</span>
        <span className="ns-chart-limit-item">Gula <b>50 g</b>/hari</span>
        <span className="ns-chart-limit-item">Garam <b>5 g</b>/hari</span>
        <span className="ns-chart-limit-item">Lemak <b>67 g</b>/hari</span>
      </div>
    </div>
  )
}

function Legend({ color, label }) {
  return (
    <div className="ns-legend-item">
      <span className="ns-legend-dot" style={{ background: color }} />
      {label}
    </div>
  )
}
