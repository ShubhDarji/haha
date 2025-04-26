import React, { useState, useEffect } from "react";
import {
  Layout,
  Table,
  Button,
  message,
  Tag,
  Spin,
  Avatar,
  Dropdown,
  Menu,
  Empty,
  Modal,
  Descriptions,
  Input
} from "antd";
import { DownOutlined } from "@ant-design/icons";
import axios from "axios";
import SellerSidebar from "../../components/seller/SellerSidebar";
import "./ManageOrder.css";

const { Content } = Layout;
const API_BASE_URL = process.env.REACT_APP_API_URL || "https://etek-nxx9.onrender.com";

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const sellerId = localStorage.getItem("sellerId");

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((order) => {
    const lowerSearch = searchTerm.toLowerCase();
    const matchesOrderId = order._id?.toLowerCase().includes(lowerSearch);
    const matchesUser = order.user?.name?.toLowerCase().includes(lowerSearch);
    const matchesEmail = order.user?.email?.toLowerCase().includes(lowerSearch);
    const matchesPhone = order.user?.phone?.toLowerCase().includes(lowerSearch);
    const matchesStatus = order.status?.toLowerCase().includes(lowerSearch);
    const matchesAnyProduct = order.items?.some((item) =>
      item.productName?.toLowerCase().includes(lowerSearch)
    );

    return (
      matchesOrderId ||
      matchesUser ||
      matchesEmail ||
      matchesPhone ||
      matchesStatus ||
      matchesAnyProduct
    );
  });

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("sellerToken");
      if (!token) {
        message.error("Unauthorized! No token found.");
        return;
      }
      const { data } = await axios.get(
        `${API_BASE_URL}/api/ordersseller/seller/${sellerId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders(data);
    } catch (error) {
      console.error("❌ Error fetching orders:", error);
      message.error(error.response?.data?.message || "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  const updateProductStatus = async (orderId, productId, newStatus) => {
    try {
      const token = localStorage.getItem("sellerToken");
      if (!token) {
        message.error("Unauthorized! No token found.");
        return;
      }

      await axios.put(
        `${API_BASE_URL}/api/ordersseller/${orderId}/product/${productId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      message.success("Product status updated!");
      fetchOrders();
    } catch (error) {
      console.error("❌ Error updating product status:", error);
      message.error(error.response?.data?.message || "Failed to update status.");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "green";
      case "Shipped":
        return "blue";
      case "Processing":
        return "orange";
      case "Pending":
        return "volcano";
      default:
        return "gray";
    }
  };

  const getDropdownMenu = (orderId, item) => (
    <Menu>
      {item.status === "Pending" && (
        <Menu.Item onClick={() => updateProductStatus(orderId, item.productId, "Processing")}>
          Mark as Processing
        </Menu.Item>
      )}
      {item.status === "Processing" && (
        <Menu.Item onClick={() => updateProductStatus(orderId, item.productId, "Shipped")}>
          Mark as Shipped
        </Menu.Item>
      )}
      {item.status === "Shipped" && (
        <Menu.Item onClick={() => updateProductStatus(orderId, item.productId, "Delivered")}>
          Mark as Delivered
        </Menu.Item>
      )}
    </Menu>
  );

  const columns = [
    { title: "Order ID", dataIndex: "_id", key: "_id" },
    {
      title: "Product Details",
      dataIndex: "items",
      key: "items",
      render: (items) => (
        <div>
          {items.map((item) => (
            <div
              key={item.productId}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "12px",
                flexWrap: "wrap",
              }}
            >
              <Avatar src={item.image} shape="square" size={64} />
              <div>
                <strong>{item.productName}</strong>
                <div>Qty: {item.qty}</div>
                <Tag color={getStatusColor(item.status)}>{item.status}</Tag>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "Total Price (₹)",
      dataIndex: "items",
      key: "totalPrice",
      render: (items) =>
        items.map((item) => (
          <div key={item.productId}>₹{item.price * item.qty}</div>
        )),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div>
          {record.items.map((item) => (
            <div
              key={item.productId}
              style={{ marginBottom: 10 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Dropdown
                overlay={getDropdownMenu(record._id, item)}
                trigger={["click"]}
              >
                <Button
                  size="small"
                  onClick={(e) => e.stopPropagation()}
                  disabled={item.status === "Delivered"}
                >
                  Update {item.productName} <DownOutlined />
                </Button>
              </Dropdown>
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <SellerSidebar />
      <Content style={{ padding: "20px", backgroundColor: "#f4f6f8" }}>
        <h2>Manage Orders</h2>
        <Input.Search
          placeholder="Search orders by Order ID, Product, User, Email, Phone, Status"
          allowClear
          enterButton="Search"
          style={{ margin: "16px 0", maxWidth: "100%", width: "500px" }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {loading ? (
          <Spin size="large" />
        ) : orders.length === 0 ? (
          <Empty description="No orders found." />
        ) : (
          <Table
            columns={columns}
            dataSource={filteredOrders}
            rowKey="_id"
            onRow={(record) => ({
              onClick: () => {
                setSelectedOrder(record);
                setModalVisible(true);
              },
            })}
            scroll={{ x: true }}
          />
        )}

        <Modal
          title={
            <div>
              <strong>Order Details</strong> — <span style={{ fontSize: "14px" }}>{selectedOrder?._id || ""}</span>
            </div>
          }
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
        >
          {selectedOrder ? (
            <div style={{ padding: "8px 0" }}>
              <Descriptions
                bordered
                column={1}
                size="middle"
                labelStyle={{ fontWeight: "bold", width: "30%" }}
              >
                <Descriptions.Item label="Customer Name">
                  {selectedOrder.user?.name || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  {selectedOrder.user?.email || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Phone Number">
                  {selectedOrder.shippingAddress?.phone || selectedOrder.user?.phone || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Shipping Address">
                  {selectedOrder.shippingAddress?.address
                    ? selectedOrder.shippingAddress?.address
                    : selectedOrder.user?.address || "N/A"}
                </Descriptions.Item>
              </Descriptions>

              <div style={{ marginTop: "24px" }}>
                <h4>Ordered Products:</h4>
                {selectedOrder.items?.map((item) => (
                  <div
                    key={item.productId}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "16px",
                      border: "1px solid #eee",
                      padding: "10px",
                      borderRadius: "8px",
                      backgroundColor: "#fafafa",
                      flexWrap: "wrap",
                    }}
                  >
                    <Avatar src={item.image} size={64} shape="square" />
                    <div style={{ marginLeft: "16px" }}>
                      <strong>{item.productName}</strong>
                      <div>Qty: {item.qty}</div>
                      <div>Price: ₹{item.price}</div>
                      <Tag color={getStatusColor(item.status)}>{item.status}</Tag>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p>No order details available.</p>
          )}
        </Modal>
      </Content>
    </Layout>
  );
};

export default ManageOrders;