import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { addToCart } from "../../app/features/cart/cartSlice";
import { Star, Heart } from "lucide-react";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import "./product-card.css";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5001";

const StarRating = ({ rating }) => (
  <div className="product-rating">
    {[...Array(5)].map((_, index) => (
      <Star
        key={index}
        className={`star-icon ${index < rating ? "active-star" : "inactive-star"}`}
      />
    ))}
  </div>
);

const ProductCard = ({ productItem }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [imageSrc, setImageSrc] = useState("");
  const [rating, setRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [isWished, setIsWished] = useState(false);

  const productId = productItem._id || productItem.id;
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (productItem?.primaryImage) {
      setImageSrc(`${API_BASE_URL}/uploads/${productItem.primaryImage}`);
    } else if (productItem?.imgUrl) {
      setImageSrc(productItem.imgUrl);
    } else {
      setImageSrc("/assets/default-product.png");
    }
  }, [productItem]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/reviews/${productId}`);
        if (Array.isArray(data)) {
          setReviewCount(data.length);
          const avg =
            data.reduce((sum, r) => sum + (r.rating || 0), 0) / (data.length || 1);
          setRating(Math.round(avg));
        }
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
      }
    };

    if (productId) fetchReviews();
  }, [productId]);

  useEffect(() => {
    const checkWishlist = async () => {
      if (!token || !productId) return;

      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/wishlist`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const wished = data.some((entry) => entry.productId?._id === productId);
        setIsWished(wished);
      } catch (err) {
        console.error("Wishlist check failed:", err);
      }
    };

    checkWishlist();
  }, [productId, token]);

  const handleToggleWishlist = async () => {
    if (!token) {
      toast.error("Please login to manage your wishlist.");
      navigate("/login");
      return;
    }

    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/api/wishlist`,
        { productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setIsWished(data.wished);
      toast.success(data.message);
    } catch (err) {
      console.error("Wishlist update failed:", err);
      toast.error("Failed to update wishlist.");
    }
  };

  const discount =
    productItem.originalPrice > productItem.price
      ? Math.round(((productItem.originalPrice - productItem.price) / productItem.originalPrice) * 100)
      : 0;

  const handleQuantityChange = (amount) => {
    setQuantity((prev) => Math.max(1, prev + amount));
  };

  const handleAddToCart = () => {
    dispatch(addToCart({ ...productItem, qty: quantity }));
    toast.success(`${productItem.productName} added to cart!`);
    setQuantity(1);
  };

  const handleBuyNow = () => {
    const user = JSON.parse(localStorage.getItem("user"));
  
    if (!user || !user.token) {
      // Save product for redirect after login
      localStorage.setItem("buyNowProduct", JSON.stringify({ ...productItem, qty: quantity }));
      localStorage.setItem("lastVisitedPage", "/checkout"); // Optional but helpful
      toast.info("Please login to continue checkout.");
      navigate("/login");
      return;
    }
  
    navigate("/checkout", {
      state: { products: [{ ...productItem, qty: quantity }] },
    });
  };

  if (!productItem) return <p className="error-message">Product data is missing.</p>;

  return (
    <div className="product-card">
      <Heart
        className={`wishlist-icon ${isWished ? "active" : ""}`}
        onClick={handleToggleWishlist}
      />

      {discount > 0 && <span className="discount-badge">{discount}% OFF</span>}

      <div
        className="product-image"
        onClick={() => navigate(`/product/${productId}`)}
      >
        <img
          loading="lazy"
          src={imageSrc}
          alt={productItem.productName}
          className="product-img"
          onError={() => setImageSrc("/assets/default-product.png")}
        />
      </div>

      <div className="product-details">
        <h3
          className="product-title"
          onClick={() => navigate(`/product/${productId}`)}
        >
          {productItem.productName}
        </h3>

        <StarRating rating={rating} />
        <span className="rating-value">({reviewCount} Reviews)</span>

        <p className="shipping-info">Ships in 3-4 days</p>

        <div className="product-price">
          <h4 className="current-price">₹{productItem.price}</h4>
          {productItem.originalPrice && (
            <span className="original-price">₹{productItem.originalPrice}</span>
          )}
        </div>

        <div className="product-actions">
          <div className="quantity-container">
            <button className="quantity-btn" onClick={() => handleQuantityChange(-1)}>-</button>
            <span className="quantity-value">{quantity}</span>
            <button className="quantity-btn" onClick={() => handleQuantityChange(1)}>+</button>
          </div>
          <button className="buy-btn" onClick={handleBuyNow}>Buy Now</button>
        </div>

        <button className="add-to-cart-btn" onClick={handleAddToCart}>
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;