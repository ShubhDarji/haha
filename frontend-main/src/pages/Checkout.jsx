import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearCart } from "../app/features/cart/cartSlice";
import {
  message,
  Card,
  Typography,
  Button,
  Input,
  Select,
  Divider,
  Row,
  Col,
} from "antd";
import axios from "axios";
import "./checkout.css";

const { Title, Text } = Typography;
const { Option } = Select;

const API_BASE_URL = process.env.REACT_APP_API_URL || "https://etek-nxx9.onrender.com";

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);

  const [selectedProducts, setSelectedProducts] = useState([]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    if (savedUser) {
      setPhoneNumber(savedUser.phone || "");
      setAddress(savedUser.address || "");
    }

    const productsFromState = location?.state?.products || cartItems;
    if (productsFromState?.length > 0) {
      setSelectedProducts(productsFromState);
    } else {
      message.warning("Your cart is empty or data not found!");
      navigate("/");
    }
  }, [location, cartItems, navigate]);

  const totalPrice = selectedProducts.reduce(
    (total, item) => total + item.qty * item.price,
    0
  );
  const platformCharge = 0.01 * totalPrice;
  const deliveryCharge = 0.005 * totalPrice;
  const finalTotal = totalPrice + platformCharge + deliveryCharge;

  const validateInputs = () => {
    if (!phoneNumber.trim() || !address.trim()) {
      message.error("Please provide your phone number and delivery address.");
      return false;
    }
    return true;
  };

  const handleOrder = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = user?.token || localStorage.getItem("token");

    if (!user || !user._id || !token) {
      message.error("User not authenticated. Please log in.");
      navigate("/login");
      return;
    }

    if (!validateInputs()) return;

    const formattedPaymentMethod =
      paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment";

    const orderData = {
      userId: user._id,
      items: selectedProducts.map((item) => ({
        productId: item._id || item.productId,
        sellerId: item.sellerId,
        productName: item.productName,
        price: item.price,
        qty: item.qty,
        image: item.image || item.primaryImage || item.imgUrl,
      })),
      totalAmount: finalTotal,
      phoneNumber,
      address,
      paymentMethod: formattedPaymentMethod,
    };

    try {
      setLoading(true);
      const response = await axios.post(
        `${API_BASE_URL}/api/orders`,
        orderData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      message.success(response.data.message || "Order placed successfully!");
      dispatch(clearCart());
      navigate("/order-success");
    } catch (error) {
      console.error("Order Error:", error);
      message.error(
        error?.response?.data?.message || "Failed to place order."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="checkout-container"
      style={{ padding: "24px", maxWidth: "1000px", margin: "0 auto" }}
    >
      <Title level={2} style={{ marginBottom: 24 }}>
        Checkout
      </Title>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={14}>
          <Card title="Contact Information" bordered={false}>
            <Input
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Phone Number"
              style={{ marginBottom: "16px" }}
            />
            <Input.TextArea
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Delivery Address"
              style={{ marginBottom: "16px" }}
            />
          </Card>

          <Card
            title="Payment Method"
            bordered={false}
            style={{ marginTop: "24px" }}
          >
            <Select
              value={paymentMethod}
              onChange={setPaymentMethod}
              style={{ width: "100%" }}
            >
              <Option value="cod">Cash on Delivery</Option>
              <Option value="online">Online Payment</Option>
            </Select>
          </Card>
        </Col>

        <Col xs={24} md={10}>
          <Card title="Order Summary" bordered={false}>
            {selectedProducts.map((product, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "12px",
                  gap: "12px",
                }}
              >
                <img
                  src={
                    product.image?.startsWith("http")
                      ? product.image
                      : `${API_BASE_URL}/uploads/${
                          product.image ||
                          product.primaryImage ||
                          product.imgUrl
                        }`
                  }
                  alt={product.productName}
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "6px",
                    objectFit: "contain",
                    backgroundColor: "#f9f9f9",
                  
                    border: "1px solid #ddd",
                  }}
                  onError={(e) => {
                    e.target.src = "/default-product.png";
                  }}
                />
                <div style={{ flex: 1 }}>
                  <Text strong>{product.productName}</Text>
                  <br />
                  <Text type="secondary">Qty: {product.qty}</Text>
                </div>
                <Text>₹{(product.price * product.qty).toFixed(2)}</Text>
              </div>
            ))}

            <Divider />
            <p>
              Platform Charge:{" "}
              <Text strong>₹{platformCharge.toFixed(2)}</Text>
            </p>
            <p>
              Delivery Charge:{" "}
              <Text strong>₹{deliveryCharge.toFixed(2)}</Text>
            </p>
            <h3>Total: ₹{finalTotal.toFixed(2)}</h3>

            <Button
              type="primary"
              block
              size="large"
              loading={loading}
              style={{ marginTop: "24px" }}
              onClick={handleOrder}
            >
              {loading ? "Placing Order..." : "Place Order"}
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Checkout;