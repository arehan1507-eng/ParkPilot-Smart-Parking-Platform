import { Link } from "react-router-dom";

const features = [
  { number: "01", title: "Live availability", copy: "A real-time view of every zone, slot, and booking status." },
  { number: "02", title: "Effortless booking", copy: "Reserve in a few taps, with every useful detail in one place." },
  { number: "03", title: "Operational clarity", copy: "A refined command center for bookings and performance." },
];

const quickSteps = ["Choose a location", "Select a live slot", "Confirm in seconds"];

const slots = [
  ["A-01", "available"], ["A-02", "occupied"], ["A-03", "available"],
  ["A-04", "booked"], ["A-05", "available"], ["A-06", "available"],
  ["A-07", "occupied"], ["A-08", "available"], ["A-09", "available"],
];

export const HomePage = () => (
  <div className="landing-page">
    <section className="hero page-width">
      <div className="hero-copy premium-hero-copy">
        <div className="hero-kicker"><span className="live-ping"></span>Now live across your city</div>
        <p className="eyebrow">A quieter way to arrive</p>
        <h1>Parking, elevated to a <em>beautiful</em> experience.</h1>
        <p className="hero-text">
          ParkPilot turns everyday parking into a precise, considered journey — from the first search to the moment you pull in.
        </p>
        <div className="button-row">
          <Link to="/auth" className="primary-btn hero-primary-btn">Find your space <span aria-hidden="true">↗</span></Link>
          <a className="ghost-btn hero-text-btn" href="#how-it-works">See how it works <span className="play-disc" aria-hidden="true">▶</span></a>
        </div>
        <div className="hero-trust-row" aria-label="Platform statistics">
          <div><strong>68</strong><span>smart spaces</span></div>
          <div><strong>4.9/5</strong><span>driver rating</span></div>
          <div><strong>&lt; 30s</strong><span>average booking</span></div>
        </div>
      </div>

      <div className="hero-board premium-hero-board" aria-label="Live parking availability preview">
        <div className="board-topline">
          <div><span className="eyebrow">ParkPilot live</span><strong>Main Building</strong></div>
          <span className="board-status"><i></i> 24 spaces free</span>
        </div>
        <div className="parking-map">
          <div className="map-route route-one"></div><div className="map-route route-two"></div>
          <span className="map-label">LEVEL 01</span>
          <div className="slot-preview-grid">
            {slots.map(([label, status], index) => (
              <div key={label} className={`preview-slot ${status}`} style={{ "--slot-index": index }}>
                <span>{label}</span><small>{status === "available" ? "Open" : status === "booked" ? "Held" : "In use"}</small>
              </div>
            ))}
          </div>
          <div className="car-marker" aria-hidden="true"><span></span></div>
        </div>
        <div className="booking-toast">
          <div className="toast-icon">✓</div><div><small>Space held for you</small><strong>A-03 · 2 hours</strong></div><span>09:42</span>
        </div>
      </div>
    </section>

    <section className="marquee-strip" aria-label="ParkPilot benefits">
      <div className="marquee-track">
        <span>LIVE AVAILABILITY</span><i>✦</i><span>SEAMLESS ARRIVALS</span><i>✦</i><span>SMARTER OPERATIONS</span><i>✦</i>
        <span>LIVE AVAILABILITY</span><i>✦</i><span>SEAMLESS ARRIVALS</span><i>✦</i><span>SMARTER OPERATIONS</span><i>✦</i>
      </div>
    </section>

    <section className="feature-section page-width premium-feature-section">
      <div className="feature-intro"><p className="eyebrow">Designed around real life</p><h2>Every detail, exactly where it should be.</h2></div>
      {features.map((feature) => (
        <article key={feature.number} className="feature-card premium-feature-card">
          <span className="feature-number">{feature.number}</span><div className="feature-icon" aria-hidden="true"><span></span></div>
          <h3>{feature.title}</h3><p>{feature.copy}</p><span className="feature-arrow" aria-hidden="true">↗</span>
        </article>
      ))}
    </section>

    <section id="how-it-works" className="page-width journey-section">
      <div className="journey-intro"><p className="eyebrow">The journey</p><h2>Arrive with a plan.</h2><p>From your first tap to your final destination, ParkPilot keeps the whole process calm and clear.</p></div>
      <div className="journey-steps">
        {quickSteps.map((step, index) => (
          <article key={step} className="journey-step">
            <span className="step-index">0{index + 1}</span><div className="step-line"><i></i></div><h3>{step}</h3>
            <p>{index === 0 ? "Choose the place that suits your day." : index === 1 ? "See precisely what is open, held, or occupied." : "Get a booking ID and arrive with confidence."}</p>
          </article>
        ))}
      </div>
    </section>

    <section className="page-width landing-cta">
      <div><p className="eyebrow">A better arrival starts here</p><h2>Make every space feel like yours.</h2></div>
      <Link to="/auth" className="primary-btn hero-primary-btn">Open ParkPilot <span aria-hidden="true">↗</span></Link>
    </section>
  </div>
);
