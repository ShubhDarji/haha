import React, { useState } from "react";
import VoltrixScene from "../components/VoltrixScene"; // Replace with VoltrixScene if needed
import "./about.css";

const conceptImages = [
  "/concepts/voltrix-lobby.png",
  "/concepts/storefront-prototype.jpg",
  "/concepts/avatar-customization.jpg"
];

const About = () => {
  const [email, setEmail] = useState("");

  const handleSignup = () => {
    if (!email || !email.includes("@")) {
      alert("Please enter a valid email.");
      return;
    }

    console.log("Early access email submitted:", email);
    alert("Thanks for signing up! Updates will be sent soon.");
    setEmail("");
  };

  return (
    <div className="about-page">
      <section className="hero">
        <h1>Voltrix 3EN: A New Digital Dimension</h1>
        <p>
          Voltrix 3EN is not just another marketplace. It's an interactive, immersive web platform where users can walk, explore, and connect in a spatial 3D world.
        </p>
      </section>

      <section className="concept-art">
        <h2>Early Concept Art</h2>
        <p className="subtext">Sneak peek into the visual direction of the 3D world:</p>
        <div className="image-grid">
          {conceptImages.map((img, idx) => (
            <img key={idx} src={img} alt={`concept-${idx}`} className="concept-img" />
          ))}
        </div>
      </section>

      <section className="teaser-3d">
        <h2>3D Teaser</h2>
        <p className="subtext">This early visual demo shows the market zone in development.</p>
        <div className="teaser-canvas">
          <VoltrixScene />
        </div>
      </section>

      <section className="signup-section">
        <h2>Sign Up for Early Access</h2>
        <p>Join to get updates, dev logs & early previews. Be part of the build!</p>
        <div className="signup-form">
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button onClick={handleSignup}>Subscribe</button>
        </div>
        <p className="note">No spam. Just innovation.</p>
      </section>

      <div className="cta-button">
        <button onClick={() => window.scrollTo(0, 0)}>Explore the Vision</button>
      </div>
    </div>
  );
};

export default About;