import React from 'react';
import Header from "../main-components/header/header";
import Footer from "../main-components/footer";
import "./about.css";

function AboutPage() {
    return (
        <>
            <Header />
            <section id="banner" className="about">
                <div className="css-zixqbe e7svxqc1"></div>
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12 col-md-12  col-12">
                            <div className="inner_banner">
                                <h1>About Us</h1>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* Main About */}
            <section id="about_us" className="about bg-light-2">
                <div className="container">
                    {/* What we do / Why we started */}
                    <div className="about-grid">
                        <div className="about-card">
                            <h2 className="about-h2">What we do</h2>
                            <p className="about-p">
                                We design and deliver worry-free travel across India and beyond
                                pilgrimages, weekend resets, and bespoke experiences. Every
                                plan is crafted with verified local partners, crystal-clear
                                pricing, and support that’s awake when you are.
                            </p>
                        </div>

                        <div className="about-card">
                            <h2 className="about-h2">Why we started</h2>
                            <p className="about-p">
                                Great trips shouldn’t demand 20 tabs, four agents, and
                                guesswork. We built The Pilgrim Beez to remove friction so you
                                see the right options, book with confidence, and enjoy the
                                journey.
                            </p>
                        </div>
                    </div>

                    {/* How we’re different */}
                    <div className="about-block">
                        <h3 className="about-h3">How we’re different</h3>

                        <ul className="feature-list">
                            <li>
                                <span className="fi" aria-hidden>✓</span>
                                <div className="fi-content">
                                    <h4>Locals, not guesswork.</h4>
                                    <p>Handpicked guides, drivers, and stays <br />vetted on the ground.</p>
                                </div>
                            </li>

                            <li>
                                <span className="fi" aria-hidden>✓</span>
                                <div className="fi-content">
                                    <h4>Clarity by design.</h4>
                                    <p>Upfront pricing, no hidden fees, live availability, <br />instant vouchers.</p>
                                </div>
                            </li>

                            <li>
                                <span className="fi" aria-hidden>✓</span>
                                <div className="fi-content">
                                    <h4>Support that shows up.</h4>
                                    <p>24/7 WhatsApp & calls, proactive updates <br />when plans change.</p>
                                </div>
                            </li>

                            <li>
                                <span className="fi" aria-hidden>✓</span>
                                <div className="fi-content">
                                    <h4>Safe & seamless.</h4>
                                    <p>Secure payments, verified partners, <br />reliable logistics.</p>
                                </div>
                            </li>

                            <li>
                                <span className="fi" aria-hidden>✓</span>
                                <div className="fi-content">
                                    <h4>Built for you.</h4>
                                    <p>Pilgrimages, family trips, honeymoons, corporate <br />offsites tailored, not templated.</p>
                                </div>
                            </li>
                        </ul>
                    </div>


                    {/* Numbers */}
                    {/* <div className="stat-grid">
                        <div className="stat-card">
                            <div className="stat-number">25,000+</div>
                            <div className="stat-label">Travellers served</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number">1,500+</div>
                            <div className="stat-label">Trusted local partners</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number">28</div>
                            <div className="stat-label">States & UTs covered</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number">4.9/5</div>
                            <div className="stat-label">Average trip rating</div>
                        </div>
                    </div> */}

                    {/* Sustainability + Promise */}
                    <div className="about-grid about-grid--two">
                        <div className="about-card">
                            <h3 className="about-h3">Sustainability & community</h3>
                            <p className="about-p">
                                We prioritise local operators, fair pay, and low-impact routes.
                                Your booking supports neighbourhood businesses and preserves the
                                places you love visiting.
                            </p>
                        </div>
                        <div className="about-card">
                            <h3 className="about-h3">Our promise</h3>
                            <p className="about-p">
                                Plans change. Weather shifts. Life happens. We stay with you
                                reworking routes, fixing hiccups, and keeping your trip
                                beautifully on track.
                            </p>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="cta-card">
                        <h3 className="cta-title">Ready when you are.</h3>
                        <p className="cta-sub">
                            Plan a pilgrimage, a weekend reset, or a once in a lifetime
                            journey <strong style={{ color: "#eca651" }}>your way, without the hassle.</strong>
                        </p>
                        <div className="cta-actions">
                            <a href="/contact" className="talk">Talk to a travel expert</a>
                            <a href="/" className="btn-ghost">Start planning</a>
                        </div>
                    </div>
                </div>
            </section>

            {/* <Footer /> */}
        </>
    );
}

export default AboutPage;
