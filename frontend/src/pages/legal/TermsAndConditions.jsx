import React, { useEffect, useState } from "react";
import Header from "../../main-components/header/header";
import Footer from "../../main-components/footer";
import CallToActions from "../../main-components/common/CallToActions";

const Section = ({ id, title, children }) => (
    <section id={id} className="legal-section">
        <h2>{title}</h2>
        <div>{children}</div>
    </section>
);

export default function TermsAndConditions() {
    const updated = "10 Aug 2025";
    const [showAuth, setShowAuth] = useState(false);

    return (
        <>
            <Header setShowAuth={setShowAuth} />
            <section id="banner" className="about">
                <div className="css-zixqbe e7svxqc1"></div>
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12 col-md-12  col-12">
                            <div className="inner_banner">
                                <h1>Terms & Conditions</h1>
                                {/* <p className="text-white">Last updated: {updated}</p> */}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <main className="legal-page container">

                {/* <nav className="legal-toc">
                    <strong>On this page</strong>
                    <ul>
                        <li><a href="#use-of-site">Use of the site</a></li>
                        <li><a href="#bookings">Bookings & payments</a></li>
                        <li><a href="#cancellations">Cancellations & refunds</a></li>
                        <li><a href="#pricing">Pricing & inclusions</a></li>
                        <li><a href="#liability">Liability</a></li>
                        <li><a href="#ip">Intellectual property</a></li>
                        <li><a href="#governing-law">Governing law</a></li>
                        <li><a href="#contact">Contact</a></li>
                    </ul>
                </nav> */}

                <Section id="use-of-site" title="Use of the site">
                    <p>
                        By accessing thepilgrimbeez.com you agree to these Terms. You must be at least 18 or have
                        parental consent. Don’t misuse the site (e.g., scraping, probing, interfering with security).
                        We may update these Terms and will post the new date above.
                    </p>
                </Section>

                <Section id="bookings" title="Bookings & payments">
                    <ul>
                        <li>When you place a booking request, you authorize us to arrange services with suppliers on your behalf.</li>
                        <li>Payments are processed securely via our payment provider. You are responsible for providing accurate traveler information.</li>
                        <li>A booking is confirmed only after you receive a written confirmation/itinerary.</li>
                    </ul>
                </Section>

                <Section id="cancellations" title="Cancellations & refunds">
                    <p>
                        Cancellation policies vary by supplier (airlines, hotels, tour operators). We will display or communicate the
                        applicable policy at checkout or in your itinerary. Fees, non-refundable components, and timelines are determined
                        by the supplier. Service charges or gateway fees may be non-refundable unless required by law.
                    </p>
                </Section>

                <Section id="pricing" title="Pricing & inclusions">
                    <p>
                        Prices are quoted in INR unless stated otherwise and are subject to change due to supplier updates, taxes,
                        or currency fluctuations. What’s included/excluded is shown on each package page and/or itinerary.
                    </p>
                </Section>

                <Section id="liability" title="Liability">
                    <p>
                        We act as an agent for third-party suppliers. To the fullest extent permitted by law, Pilgrim Beez is not liable
                        for acts/omissions of suppliers or for events outside our reasonable control (e.g., weather, strikes, government actions).
                        Your remedies lie with the relevant supplier, though we’ll assist where we can.
                    </p>
                </Section>

                <Section id="ip" title="Intellectual property">
                    <p>
                        All content (text, graphics, logos, images, code) is owned by Pilgrim Beez or its licensors and is protected by law.
                        You may not copy, distribute, or create derivative works without prior written permission.
                    </p>
                </Section>

                <Section id="governing-law" title="Governing law">
                    <p>
                        These Terms are governed by the laws of India. Courts in Ahmedabad, Gujarat shall have exclusive jurisdiction,
                        unless mandatory consumer law specifies otherwise.
                    </p>
                </Section>

                <Section id="contact" title="Contact">
                    <p>
                        Questions? Email <a href="mailto:info@thepilgrimbeez.com">info@thepilgrimbeez.com</a> or call
                        <a href="tel:+919909448464"> +91 9909448464</a>.
                    </p>
                </Section>
            </main>

            <CallToActions />
            {/* End Call To Actions Section */}

            <Footer />
        </>
    );
}
