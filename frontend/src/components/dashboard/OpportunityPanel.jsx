function score(opportunity) {
  return Math.round(Math.max(0, Math.min(1, opportunity.opportunity_score || 0)) * 100);
}

function OpportunityRow({ opportunity, index }) {
  const titles = opportunity.suggested_titles || [];
  const reasons = opportunity.reasons || [];
  const video = opportunity.top_videos?.[0];
  const value = score(opportunity);
  return (
    <article className="dash-opportunity-row">
      <span className="dash-opportunity-rank">{String(index + 1).padStart(2, '0')}</span>
      <div className="dash-opportunity-thumb">
        {video?.thumbnail_url && <img src={video.thumbnail_url} alt="" onError={(event) => { event.currentTarget.style.display = 'none'; }} />}
        <span aria-hidden="true">✦</span>
      </div>
      <div className="dash-opportunity-copy">
        <h3>{opportunity.trend}</h3>
        <p>{titles[0] || 'Content angle ready for review'}</p>
        <div className="dash-opportunity-tags">
          {reasons.slice(0, 2).map((reason) => <span key={reason}>{reason}</span>)}
        </div>
      </div>
      <div className="dash-opportunity-score" style={{ '--score': value }} aria-label={`${value} percent opportunity score`}>
        <strong>{value}</strong>
      </div>
    </article>
  );
}

export default function OpportunityPanel({ opportunities, loading }) {
  return (
    <section className="dash-panel dash-opportunity-panel">
      <div className="dash-panel-heading">
        <h2><span aria-hidden="true">🏆</span> Top Content Opportunities</h2>
        <button className="dash-see-all" type="button">See all <span aria-hidden="true">↗</span></button>
      </div>
      <div className="dash-opportunity-list">
        {loading ? [0, 1, 2, 3].map((item) => <span className="dash-skeleton-row" key={item} />) :
          opportunities.length > 0 ? opportunities.slice(0, 6).map((opportunity, index) => (
            <OpportunityRow key={`${opportunity.trend}-${index}`} opportunity={opportunity} index={index} />
          )) : (
            <div className="dash-empty-panel"><span aria-hidden="true">💡</span><strong>No opportunities found yet</strong><p>More content is needed to identify high-potential topics.</p></div>
          )}
      </div>
    </section>
  );
}
