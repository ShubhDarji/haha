import { useState, useEffect, Fragment } from "react";
import Wrapper from "../components/wrapper/Wrapper";
import Section from "../components/Section";
import HeroSection from "../components/Herosection/Herosection";
import useWindowScrollToTop from "../hooks/useWindowScrollToTop";
import axios from "axios";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5001";

const Home = () => {
  const [homeProducts, setHomeProducts] = useState({
    bigDiscount: [],
    newArrivals: [],
    bestSales: [],
  });
  const [promoVideo, setPromoVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useWindowScrollToTop();

  // Fetch promotional video and products
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productRes, promoRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/products/home/products`),
          axios.get(`${API_BASE_URL}/api/promotions/latest`),
        ]);

        const formatProduct = (product) => ({
          ...product,
          primaryImageUrl: product.primaryImage
            ? `${API_BASE_URL}/uploads/${product.primaryImage}`
            : "/assets/default-product.png",
        });

        setHomeProducts({
          bigDiscount: productRes.data.bigDiscount.map(formatProduct),
          newArrivals: productRes.data.newArrivals.map(formatProduct),
          bestSales: productRes.data.bestSales.map(formatProduct),
        });

        if (promoRes.data?.videoUrl) {
          setPromoVideo({
            ...promoRes.data,
            videoUrl: `${API_BASE_URL}/uploads/promotions/${promoRes.data.videoUrl}`,
          });
        }

      } catch (err) {
        console.error(err);
        setError("Failed to load homepage content.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    gsap.from(".section-title", {
      opacity: 0,
      y: 20,
      duration: 1,
      scrollTrigger: ".section-title",
    });
    gsap.to(".product-card", { opacity: 1, duration: 0.5 });
  }, []);

  if (loading) return <div className="text-center py-5">Loading homepage...</div>;
  if (error) return <div className="text-center py-5">{error}</div>;

  return (
    <Fragment>
      <HeroSection />
      <Wrapper />

      {/* ✅ Promo Video Section */}
     

      <Section title="Big Discount" productItems={homeProducts.bigDiscount} maxItems={4} />
      {promoVideo && (
  <div className="promo-video-container" style={{ textAlign: "center", marginBottom: 40 }}>
    <h2>{promoVideo.title}</h2>
    <p>{promoVideo.description}</p>
    <video
      ref={(video) => {
        if (video) {
          const observer = new IntersectionObserver(
            ([entry]) => {
              if (entry.isIntersecting) {
                video.play();
              } else {
                video.pause();
              }
            },
            { threshold: 0.5 } // Play when 50% visible
          );
          observer.observe(video);
        }
      }}
      src={promoVideo.videoUrl}
      muted
      loop
      playsInline
      style={{
        width: "98vw",
        maxHeight: "800px",
        objectFit: "cover",
        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
      }}
    />
  </div>
)}
      <Section title="New Arrivals" productItems={homeProducts.newArrivals} maxItems={4} />
      <Section title="Best Sale" productItems={homeProducts.bestSales} maxItems={4} />
    </Fragment>
  );
};

export default Home;