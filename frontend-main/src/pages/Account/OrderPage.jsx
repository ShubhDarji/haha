import React, { useState, useEffect } from "react";
import {
  Card,
  Tag,
  Button,
  message,
  Spin,
  Row,
  Col,
  Typography,
  Divider,
  Modal,
  Input,
  Upload,
  Rate,
} from "antd";
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;
const { TextArea } = Input;
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5001";

const OrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [reviewItem, setReviewItem] = useState(null);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(0);
  const [reviewImages, setReviewImages] = useState([]);
  const [reviewVideo, setReviewVideo] = useState(null);
  const userToken = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (!userToken) {
      message.error("Please login to view your orders.");
      setLoading(false);
      return;
    }
    fetchOrders();
  }, [userToken]);

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/orders/user`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      setOrders(data);
    } catch (error) {
      message.error("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId) => {
    setCancelling(orderId);
    try {
      await axios.put(`${API_BASE_URL}/api/orders/${orderId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      message.success("Order cancelled successfully.");
      fetchOrders();
    } catch {
      message.error("Failed to cancel order.");
    } finally {
      setCancelling(null);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewItem || !reviewText || !rating) {
      return message.warning("Please fill required fields.");
    }
  
    const formData = new FormData();
    formData.append("rating", rating);
    formData.append("comment", reviewText);
    reviewImages.forEach((file) => formData.append("images", file));
    if (reviewVideo) formData.append("video", reviewVideo);
  
    // Fix: Ensure productId is extracted as string
    const productId =
      typeof reviewItem.productId === "object"
        ? reviewItem.productId._id
        : reviewItem.productId;
  
    try {
      await axios.post(`${API_BASE_URL}/api/reviews/${productId}`, formData, {
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "multipart/form-data",
        },
      });
  
      message.success("Review submitted!");
      setReviewModalVisible(false);
      setReviewText("");
      setRating(0);
      setReviewImages([]);
      setReviewVideo(null);
    } catch (error) {
      message.error("Failed to submit review.");
      console.error("Review submission error:", error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending": return "gold";
      case "Shipped": return "blue";
      case "Delivered": return "green";
      case "Cancelled": return "red";
      default: return "default";
    }
  };

  const getPaymentColor = (status) =>
    status === "Completed" ? "green" : "red";

  if (loading) {
    return <div style={{ display: "flex", justifyContent: "center", padding: 50 }}><Spin size="large" /></div>;
  }

  return (
    <div style={{ padding: "10px 0" }}>
      <Title level={4}>My Orders</Title>
      <Row gutter={[16, 16]}>
        {orders.map((order) => (
          <Col xs={24} sm={12} lg={8} key={order._id}>
            <Card
              hoverable
              onClick={() => {
                setSelectedOrder(order);
                setModalVisible(true);
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Text strong>Order #{order._id.slice(-5)}</Text>
                <Tag color={getStatusColor(order.overallStatus)}>{order.overallStatus}</Tag>
              </div>

              <Divider />
              {order.items.map((item, index) => (
                <div key={index} style={{ display: "flex", marginBottom: 10, gap: 10 }}>
                  <img
  src={`${API_BASE_URL}/uploads/${item.image}`}
  alt={item.productName}
  style={{
    width: 50,
    height: 50,
    borderRadius: 4,
    objectFit: "contain",
    backgroundColor: "#f9f9f9",
    border: "1px solid #eee",
    padding: 2
  }}
/>
                  <div style={{ flex: 1 }}>{item.productName}</div>
                  <Text>₹{item.price}</Text>
                </div>
              ))}

              <Divider />
              <Text>Total: ₹{order.totalAmount}</Text><br />
              <Text>Payment: </Text>
              <Tag color={getPaymentColor(order.paymentStatus)}>
                {order.paymentStatus === "Completed" ? "Paid" : "Unpaid"}
              </Tag><br />
              <Text>Date: {new Date(order.createdAt).toLocaleDateString()}</Text>

              {order.overallStatus === "Pending" && (
                <Button
                  danger block type="primary" loading={cancelling === order._id}
                  style={{ marginTop: 10 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    cancelOrder(order._id);
                  }}
                >
                  Cancel Order
                </Button>
              )}
            </Card>
          </Col>
        ))}
      </Row>

      {/* Order Modal */}
      <Modal
        title={`Order #${selectedOrder?._id?.slice(-5)}`}
        open={modalVisible}
        footer={null}
        onCancel={() => setModalVisible(false)}
        width={700}
      >
        {selectedOrder?.items.map((item, idx) => {
          const isDelivered = selectedOrder.overallStatus === "Delivered" && item.status === "Delivered";
          return (
            <div key={idx} style={{ display: "flex", marginBottom: 20, gap: 15 }}>
              <img
                src={`${API_BASE_URL}/uploads/${item.image}`}
                alt={item.productName}
                style={{ width: 80, height: 80, borderRadius: 6 }}
              />
              <div style={{ flex: 1 }}>
                <Title level={5}>{item.productName}</Title>
                <Text>Status: </Text>
                <Tag color={getStatusColor(item.status)}>{item.status}</Tag><br />
                {item.sellerId && (
                  <>
                    <Text type="secondary">Sold by: {item.sellerId.businessName}</Text><br />
                    <Text type="secondary">Email: {item.sellerId.email}</Text>
                  </>
                )}
                {isDelivered && (
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => {
                      setReviewItem(item);
                      setReviewModalVisible(true);
                    }}
                    style={{ marginTop: 8 }}
                  >
                    Add Review
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </Modal>

      {/* Review Modal */}
      <Modal
        title="Write a Review"
        open={reviewModalVisible}
        onCancel={() => {
          setReviewModalVisible(false);
          setReviewText(""); setRating(0); setReviewImages([]); setReviewVideo(null);
        }}
        onOk={handleSubmitReview}
      >
        <Text>Rating:</Text><br />
        <Rate value={rating} onChange={setRating} /><br /><br />
        <Text>Review:</Text>
        <TextArea
          rows={4}
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Write your feedback"
        />
        <Divider />
        <Upload
          beforeUpload={(file) => {
            setReviewImages((prev) => [...prev, file]);
            return false;
          }}
          fileList={[]}
          maxCount={3}
        >
          <Button icon={<UploadOutlined />}>Upload Images (Max 3)</Button>
        </Upload>
        <Upload
          beforeUpload={(file) => {
            setReviewVideo(file);
            return false;
          }}
          fileList={reviewVideo ? [reviewVideo] : []}
          maxCount={1}
        >
          <Button icon={<UploadOutlined />} style={{ marginTop: 10 }}>Upload Video</Button>
        </Upload>
      </Modal>
    </div>
  );
};

export default OrderPage;