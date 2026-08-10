import { pct as pctStr, commaDecimal } from '../../lib/format.js'

const COLOR_OPTIMAL = '#16A34A'
const COLOR_SEDANG = '#F59E0B'
const COLOR_BERLEBIH = '#EF4444'

// Batas konsumsi harian per komponen (gram/hari) sesuai pedoman Kemenkes.
// Sumbu-Y tiap batang berskala pada batas hariannya sendiri (ada 3 garis batas).
const DAILY = {
  gula:  { label: 'Gula',    limitG: 50, unit: 'g' },
  garam: { label: 'Garam',   limitG: 5,  unit: 'g' },
  lemak: { label: 'Lemak',   limitG: 67, unit: 'g' },
}

function barColor(p) {
  if (p == null) return COLOR_OPTIMAL
  if (p >= 100) return COLOR_BERLEBIH
  if (p >= 50)  return COLOR_SEDANG
  return COLOR_OPTIMAL
}

// Grafik "Asupan vs Batas Harian":
//   - Sumbu Y = gram, berskala pada batas harian TIAP komponen (3 garis batas: 50 g / 5 g / 67 g).
//   - Tinggi batang = %AKG per sajian (konsumsi bila dihabiskan sekali) -> nilai yg sama spt sebelumnya.
export default function IntakeChart({ calc }) {
  const p = calc.pct_harian_sajian || calc.pct_harian_kemasan
  const rows = [
    ['gula', p.gula],
    ['garam', p.natrium],
    ['lemak', p.lemak],
  ].filter(([, v]) => v != null)

  if (rows.length === 0) return null

  const MAXH = 168          // tinggi area plot (px)
  const CEIL = 120          // langit-langit tampilan = 120% dari batas harian
  const limitY = Math.round((100 / CEIL) * MAXH)   // posisi garis batas 100% (px dari dasar)

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
        Tinggi batang = %AKG per sajian · garis putus-putus = batas konsumsi harian tiap komponen
      </div>

      <div className="ns-intake-plot">
        {rows.map(([key, pctVal]) => {
          const d = DAILY[key]
          const color = barColor(pctVal)
          const capped = Math.min(Math.max(pctVal, 0), CEIL)
          const h = pctVal > 0 ? Math.max(6, Math.round((capped / CEIL) * MAXH)) : 3
          const consumedG = (pctVal / 100) * d.limitG   // gram dikonsumsi per sajian (turunan dari %AKG)
          return (
            <div className="ns-intake-col" key={key}>
              <div className="ns-intake-track" style={{ height: MAXH }}>
                {/* garis batas harian komponen (gram) */}
                <div className="ns-intake-limit" style={{ bottom: limitY }}>
                  <span className="ns-intake-limit-tag">{d.limitG} {d.unit}/hari</span>
                </div>
                {/* dasar 0 g */}
                <div className="ns-intake-base"><span className="ns-intake-base-tag">0 {d.unit}</span></div>
                {/* nilai %AKG di atas batang */}
                <div className="ns-intake-pct" style={{ bottom: h + 6, color }}>
                  {pctStr(pctVal)}
                </div>
                {/* batang */}
                <div className="ns-intake-fill" style={{ height: h, background: color }} />
              </div>
              <div className="ns-intake-label">
                <b>{d.label}</b>
                <small>{commaDecimal(consumedG)} {d.unit} / {d.limitG} {d.unit}</small>
              </div>
            </div>
          )
        })}
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
