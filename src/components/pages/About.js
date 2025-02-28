import React from 'react';
import './About.css';

// Import team member images
import sarahImage from '../../assets/team/amrit.jpg';
import michaelImage from '../../assets/team/charles.jpg';
import emilyImage from '../../assets/team/charly.jpg';
import davidImage from '../../assets/team/dan.jpg';

const About = () => {
    return (
        <div className="about-container">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">Empowering Your Financial Journey</h1>
                    <p className="hero-subtitle">
                        We're on a mission to help millions of people take control of their finances,
                        making financial management simple, intuitive, and effective for everyone.
                    </p>
                </div>
            </section>

            {/* Mission Section */}
            <section className="mission-section">
                <div className="mission-content">
                    <div className="mission-card">
                        <div className="mission-icon">💰</div>
                        <h3 className="mission-title">Smart Savings</h3>
                        <p className="mission-text">
                            We help you identify opportunities to save money and build a stronger financial future.
                        </p>
                    </div>
                    <div className="mission-card">
                        <div className="mission-icon">🔒</div>
                        <h3 className="mission-title">Secure & Private</h3>
                        <p className="mission-text">
                            Your financial security is our top priority. We use bank-level encryption to keep your data safe.
                        </p>
                    </div>
                    <div className="mission-card">
                        <div className="mission-icon">📈</div>
                        <h3 className="mission-title">Growth Focus</h3>
                        <p className="mission-text">
                            Track your progress and watch your savings grow with our intuitive tracking tools.
                        </p>
                    </div>
                </div>
            </section>

            {/* Impact Section */}
            <section className="impact-section">
                <div className="impact-content">
                    <h2 className="impact-title">Our Impact</h2>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-number">500K+</div>
                            <div className="stat-label">Active Users</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number">$2.5M</div>
                            <div className="stat-label">Money Saved</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number">98%</div>
                            <div className="stat-label">Customer Satisfaction</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="team-section">
                <div className="team-content">
                    <h2 className="team-title">Meet Our Team</h2>
                    <p className="team-description">
                        We're a passionate team of finance experts and technologists dedicated to making
                        financial management accessible to everyone.
                    </p>
                    <div className="team-grid">
                        <div className="team-member">
                            <div className="member-image">
                                <img src={sarahImage} alt="Amrit Sohal" />
                            </div>
                            <h3 className="member-name">Amrit Sohal</h3>
                            <p className="member-role">Front End Developerr</p>
                        </div>
                        <div className="team-member">
                            <div className="member-image">
                                <img src={michaelImage} alt="Charles Cetta" />
                            </div>
                            <h3 className="member-name">Charles Cetta</h3>
                            <p className="member-role">Head of Technology</p>
                        </div>
                        <div className="team-member">
                            <div className="member-image">
                                <img src={emilyImage} alt="Charly Verno" />
                            </div>
                            <h3 className="member-name">Charly Verno</h3>
                            <p className="member-role">Front End Developer</p>
                        </div>
                        <div className="team-member">
                            <div className="member-image">
                                <img src={davidImage} alt="Daniel Lordelo" />
                            </div>
                            <h3 className="member-name">Daniel Lordelo</h3>
                            <p className="member-role">Server Engineer</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;