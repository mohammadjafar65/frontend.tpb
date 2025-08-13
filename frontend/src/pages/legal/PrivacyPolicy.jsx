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

export default function PrivacyPolicy() {
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
                                <h1>Privacy Policy</h1>
                                {/* <p className="text-white">Last updated: {updated}</p> */}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <main className="legal-page container">
                {/* <nav className="legal-toc">
                    <ul>
                        <li><a href="#info-we-collect">Information we collect</a></li>
                        <li><a href="#how-we-use">How we use your information</a></li>
                        <li><a href="#sharing">Sharing & third parties</a></li>
                        <li><a href="#cookies">Cookies & tracking</a></li>
                        <li><a href="#data-security">Data security</a></li>
                        <li><a href="#your-rights">Your rights & choices</a></li>
                        <li><a href="#contact">Contact us</a></li>
                    </ul>
                </nav> */}

                <Section id="info-we-collect" title="Information we collect">
                    <ul>
                        <li><strong>Account & booking data:</strong> name, email, phone, itinerary preferences, traveler details needed to book.</li>
                        <li><strong>Payment data:</strong> handled by our payment providers; we do not store full card numbers.</li>
                        <li><strong>Usage data:</strong> pages visited, device info, rough location, and logs for performance/security.</li>
                        <li><strong>Communications:</strong> messages you send via forms, email, or chat.</li>
                    </ul>
                </Section>

                <Section id="how-we-use" title="How we use your information">
                    <ul>
                        <li>Provide and manage bookings, quotes, and customer support.</li>
                        <li>Improve our site, services, and user experience.</li>
                        <li>Send transactional emails (confirmations, updates). Marketing emails only with your consent; you can unsubscribe anytime.</li>
                        <li>Detect, prevent, and address fraud or technical issues.</li>
                    </ul>
                </Section>

                <Section id="sharing" title="Sharing & third parties">
                    <p>
                        We share data with trusted partners only as needed to deliver our services—e.g., hotels, tour operators,
                        payment gateways, analytics, and hosting providers. These partners must protect your data and use it only
                        for agreed purposes. We may disclose information to comply with law or protect our legal rights.
                    </p>
                </Section>

                <Section id="cookies" title="Cookies & tracking">
                    <p>
                        We use cookies and similar technologies for essential site functions, analytics, and preferences.
                        You can control cookies in your browser settings. Some features may not work without essential cookies.
                    </p>
                </Section>

                <Section id="data-security" title="Data security">
                    <p>
                        We use reasonable administrative, technical, and physical safeguards to protect personal data.
                        No method of transmission or storage is 100% secure, but we work to protect your information.
                    </p>
                </Section>

                <Section id="your-rights" title="Your rights & choices">
                    <ul>
                        <li>Access, correct, or delete your personal information.</li>
                        <li>Opt out of marketing at any time (unsubscribe link in emails).</li>
                        <li>Request a copy of your data or restrict processing where applicable.</li>
                    </ul>
                    <p>Email: <a href="mailto:info@thepilgrimb eez.com">info@thepilgrimbeez.com</a></p>
                </Section>

                <Section id="contact" title="Contact us">
                    <p>
                        Pilgrim Beez • Customer Care: <a href="tel:+919909448464">+91 9909448464</a> •
                        Email: <a href="mailto:info@thepilgrimbeez.com">info@thepilgrimbeez.com</a>
                    </p>
                </Section>
            </main>

            <CallToActions />
            {/* End Call To Actions Section */}

            <Footer />
        </>
    );
}
