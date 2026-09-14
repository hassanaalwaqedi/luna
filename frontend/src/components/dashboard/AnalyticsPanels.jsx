import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import PlatformIcon from '../PlatformIcon';

const COLORS = ['var(--luna-purple)', 'var(--luna-cyan)', 'var(--luna-pink)', 'var(--luna-orange)', 'var(--luna-blue)', 'var(--luna-green)'];
const PLATFORM_COLORS = {
  youtube: 'var(--luna-pink)',
  tiktok: 'var(--luna-cyan)',
  instagram: 'var(--luna-purple)',
  reddit: 'var(--luna-orange)',
};

const tooltipStyle = {
  background: 'var(--luna-surface-2)', border: '1px solid var(--luna-border)', borderRadius: 10, color: 'var(--luna-text)', fontSize: 12,
};

export function TrendDistributionPanel({ data }) {
  return (
    <section className="dash-panel dash-chart-panel">
      <div className="dash-panel-heading"><h2><span aria-hidden="true">▥</span> Trend Distribution</h2></div>
      {data.length > 0 ? (
        <div className="dash-bar-chart">
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={data.slice(0, 5)} layout="vertical" margin={{ top: 1, right: 24, bottom: 0, left: 2 }} barSize={16}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={106} tick={{ fill: '#91a0be', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} labelFormatter={(value, payload) => payload?.[0]?.payload?.fullName || value} />
              <Bar dataKey="videos" fill="#4f8cff" radius={[3, 3, 3, 3]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : <div className="dash-chart-empty">No trend distribution yet</div>}
    </section>
  );
}

export function NicheDistributionPanel({ data }) {
  const total = data.reduce((sum, item) => sum + item.videos, 0) || 1;
  return (
    <section className="dash-panel dash-chart-panel dash-niche-panel">
      <div className="dash-panel-heading"><h2><span aria-hidden="true">◉</span> Niche Distribution</h2></div>
      {data.length > 0 ? (
        <div className="dash-niche-body">
          <ResponsiveContainer width="48%" height={164}>
            <PieChart>
              <Pie data={data} dataKey="videos" nameKey="fullName" cx="50%" cy="50%" innerRadius={42} outerRadius={66} paddingAngle={3} stroke="none">
                {data.map((item, index) => <Cell key={item.fullName} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="dash-niche-legend">
            {data.slice(0, 4).map((item, index) => (
              <div key={item.fullName}>
                <span style={{ background: COLORS[index % COLORS.length] }} />
                <label title={item.fullName}>{item.name}</label>
                <strong>{Math.round((item.videos / total) * 100)}%</strong>
              </div>
            ))}
          </div>
        </div>
      ) : <div className="dash-chart-empty">No niche distribution yet</div>}
    </section>
  );
}

export function PlatformDistributionPanel({ data }) {
  const entries = Object.entries(data).filter(([, value]) => Number(value) > 0).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((sum, [, value]) => sum + Number(value), 0) || 1;
  const chartData = entries.map(([platform, videos]) => ({ platform, videos }));

  return (
    <section className="dash-panel dash-chart-panel dash-platform-panel">
      <div className="dash-panel-heading"><h2><span aria-hidden="true">◌</span> Platform Distribution</h2></div>
      {entries.length > 0 ? (
        <div className="dash-platform-body">
          <ResponsiveContainer width="48%" height={180}>
            <PieChart>
              <Pie data={chartData} dataKey="videos" nameKey="platform" cx="50%" cy="50%" innerRadius={45} outerRadius={71} paddingAngle={3} stroke="none">
                {chartData.map((item) => <Cell key={item.platform} fill={PLATFORM_COLORS[item.platform] || 'var(--luna-blue)'} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${value} items`, 'Content']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="dash-platform-legend">
            {entries.map(([platform, videos]) => (
              <div key={platform}>
                <PlatformIcon platform={platform} size={16} />
                <span>{platform}</span>
                <strong>{Math.round((videos / total) * 100)}%</strong>
              </div>
            ))}
          </div>
        </div>
      ) : <div className="dash-chart-empty">No platform distribution yet</div>}
    </section>
  );
}

export function ViralHeatmapPanel() {
  return (
    <section className="dash-panel dash-heatmap-panel">
      <div className="dash-panel-heading"><h2><span aria-hidden="true">✧</span> Viral Heatmap</h2><span className="dash-panel-note">Coming soon</span></div>
      <div className="dash-heatmap-empty">
        <div className="dash-heatmap-orbit" aria-hidden="true"><span /><span /><span /></div>
        <strong>Geographic signals are not indexed yet</strong>
        <p>Luna will light up regional momentum when source-region analytics are available.</p>
      </div>
    </section>
  );
}
