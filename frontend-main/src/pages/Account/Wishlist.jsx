import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Typography,
  Row,
  Col,
  Card,
  Button,
  message,
  Empty,
  Divider,
} from "antd";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;
const API_BASE_URL = process.env.REACT_APP_API_URL || "https://etek-nxx9.onrender.com";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Fetch Wishlist Items
  const fetchWishlist = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWishlist(data);
    } catch (err) {
      message.error("Failed to load wishlist");
    }
  };

  // Remove Product from Wishlist
  const handleRemove = async (productId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/wishlist/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success("Removed from wishlist");
      setWishlist((prev) =>
        prev.filter((item) => item.productId._id !== productId)
      );
    } catch (err) {
      message.error("Failed to remove item");
    }
  };

  useEffect(() => {
    if (!token) {
      message.error("Please login to view your wishlist.");
      navigate("/login");
      return;
    }
    fetchWishlist();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <Title level={3} style={{ marginBottom: 24 }}>
        My Wishlist
      </Title>

      {wishlist.length === 0 ? (
        <Empty description="Your wishlist is empty" style={{ marginTop: 50 }} />
      ) : (
        <Row gutter={[24, 24]}>
          {wishlist.map(({ productId }) => (
            <Col xs={24} sm={12} md={8} lg={6} key={productId._id}>
              <Card
                hoverable
                style={{
                  height: 400,
                  borderRadius: 8,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
                cover={
                  <div
                    style={{
                      height: 200,
                      backgroundColor: "#f9f9f9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderTopLeftRadius: 8,
                      borderTopRightRadius: 8,
                    }}
                  >
                    <img
                      alt={productId.productName}
                      src={
                        productId.primaryImage
                          ? `${API_BASE_URL}/uploads/${productId.primaryImage}`
                          : "/assets/default-product.png"
                      }
                      style={{
                        maxHeight: "100%",
                        maxWidth: "100%",
                        objectFit: "contain",
                        padding: 10,
                      }}
                    />
                  </div>
                }
              >
                <div style={{ flexGrow: 1 }}>
                  <Title level={5} ellipsis={{ rows: 1 }}>
                    {productId.productName}
                  </Title>
                  <Text strong style={{ fontSize: "16px" }}>
                    ₹{productId.price}
                  </Text>
                </div>

                <Divider style={{ margin: "12px 0" }} />

                <Row gutter={10}>
                  <Col span={12}>
                    <Button
                      danger
                      block
                      size="small"
                      onClick={() => handleRemove(productId._id)}
                    >
                      Remove
                    </Button>
                  </Col>
                  <Col span={12}>
                    <Button
                      type="primary"
                      block
                      size="small"
                      onClick={() => navigate(`/product/${productId._id}`)}
                    >
                      View
                    </Button>
                  </Col>
                  <Col span={24} style={{ marginTop: 8 }}>
  <Button
    block
    size="small"
    type="dashed"
    onClick={async () => {
      try {
        // Add to cart logic (you can import Redux dispatch instead)
        const cartItem = {
          ...productId,
          qty: 1,
          productId: productId._id,
        };

        const existingCart = JSON.parse(localStorage.getItem("cart")) || [];
        localStorage.setItem("cart", JSON.stringify([...existingCart, cartItem]));

        await axios.delete(`${API_BASE_URL}/api/wishlist/${productId._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        message.success("Moved to cart");
        setWishlist((prev) => prev.filter((item) => item.productId._id !== productId._id));
      } catch (err) {
        message.error("Failed to move item");
      }
    }}
  >
    Move to Cart
  </Button>
</Col>
                </Row>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default Wishlist;