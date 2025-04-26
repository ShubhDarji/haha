import React, { useEffect, useState } from "react";
import { Layout, Table, Tag, Select, message } from "antd";
import Sidebar from "./sidebar";
import axios from "axios";

const { Content } = Layout;
const API_BASE_URL = process.env.REACT_APP_API_URL || "https://etek-nxx9.onrender.com";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const adminToken = localStorage.getItem("adminToken");

  useEffect(() => {
    if (!adminToken) {
      message.error("Unauthorized. Please log in as admin.");
      return;
    }
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/orders/admin`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      message.error(error.response?.data?.message || "Failed to fetch orders");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(
        `${API_BASE_URL}/api/orders/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      message.success("Order status updated successfully!");
      fetchOrders(); // refresh list
    } catch (error) {
      console.error("Error updating status:", error);
      message.error(error.response?.data?.message || "Failed to update status");
    }
  };

  return (
    <Layout style={{ minHeight: "100vh", backgroundColor: "#f5f6f8" }}>
      <Sidebar />
      <Layout className="site-layout" style={{ paddingLeft: 200 }}>
        <Content style={{ margin: "24px", padding: "24px", background: "#fff", borderRadius: 10 }}>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 600, marginBottom: 24 }}>Admin Orders</h2>

          <Table
            dataSource={orders}
            rowKey="_id"
            pagination={{ pageSize: 8 }}
            bordered
            columns={[
              {
                title: "Order ID",
                dataIndex: "_id",
                render: (id) => <strong>{id.slice(-6).toUpperCase()}</strong>,
              },
              {
                title: "Customer",
                dataIndex: "userId",
                render: (user) => user?.name || "Unknown",
              },
              {
                title: "Total",
                dataIndex: "totalAmount",
                render: (amount) => <strong>₹{amount}</strong>,
              },
              {
                title: "Items",
                dataIndex: "items",
                render: (items) => (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {items.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          width: "50px",
                          height: "50px",
                          borderRadius: 6,
                          overflow: "hidden",
                          background: "#f9f9f9",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          border: "1px solid #eee",
                        }}
                      >
                        <img
                          src={`${API_BASE_URL}/uploads/${item.image}`}
                          alt={item.productName}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                          }}
                        />
                      </div>
                    ))}
                  </div>
                ),
              },
              {
                title: "Status",
                dataIndex: "overallStatus",
                render: (status, record) => (
                  <Select
                    value={status}
                    onChange={(value) => updateStatus(record._id, value)}
                    style={{ width: 130 }}
                  >
                    <Select.Option value="Pending">Pending</Select.Option>
                    <Select.Option value="Shipped">Shipped</Select.Option>
                    <Select.Option value="Delivered">Delivered</Select.Option>
                    <Select.Option value="Cancelled">Cancelled</Select.Option>
                  </Select>
                ),
              },
              {
                title: "Payment",
                dataIndex: "paymentStatus",
                render: (status) =>
                  status === "Completed" ? (
                    <Tag color="green">Paid</Tag>
                  ) : (
                    <Tag color="red">Pending</Tag>
                  ),
              },
            ]}
          />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminOrders;
