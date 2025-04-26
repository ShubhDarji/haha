import React, { useEffect, useState } from "react";
import {
  Layout,
  Table,
  Button,
  Input,
  message,
  Popconfirm,
  Select,
  Image,
  Typography,
} from "antd";
import Sidebar from "./sidebar"; // ✅ Ensure this path is correct
import axios from "axios";

const { Content, Sider } = Layout;
const { Option } = Select;
const { Title } = Typography;

const Product = () => {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const adminToken = localStorage.getItem("adminToken");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("https://etek-nxx9.onrender.com/api/products", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      setProducts(data);
      setFiltered(data);
    } catch (err) {
      console.error(err);
      message.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://etek-nxx9.onrender.com/api/products/delete/${id}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      message.success("Product deleted");
      fetchProducts();
    } catch {
      message.error("Deletion failed");
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await axios.put(
        `https://etek-nxx9.onrender.com/api/products/admin/status/${id}`,
        { status },
        {
          headers: { Authorization: `Bearer ${adminToken}` },
        }
      );
      message.success("Status updated");
      fetchProducts();
    } catch {
      message.error("Failed to update status");
    }
  };

  const handleSearch = (value) => {
    setSearch(value);
    const results = products.filter((p) =>
      p.productName.toLowerCase().includes(value.toLowerCase())
    );
    setFiltered(results);
  };

  const columns = [
    {
      title: "Image",
      dataIndex: "primaryImage",
      render: (img) => (
        <Image
          width={60}
          src={`https://etek-nxx9.onrender.com/uploads/${img}`}
          alt="product"
          style={{
            objectFit: "contain",
            border: "1px solid #eee",
            borderRadius: 6,
            backgroundColor: "#f8f8f8",
            padding: 4,
          }}
        />
      ),
    },
    {
      title: "Product",
      dataIndex: "productName",
      render: (text) => <strong style={{ fontSize: "1rem" }}>{text}</strong>,
    },
    {
      title: "Price",
      dataIndex: "price",
      render: (val) => <span style={{ color: "#2a7ae4" }}>₹{val}</span>,
    },
    {
      title: "Stock",
      dataIndex: "stock",
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status, record) => (
        <Select
          defaultValue={status}
          onChange={(value) => handleStatusChange(record._id, value)}
          size="small"
        >
          <Option value="Active">Active</Option>
          <Option value="Inactive">Inactive</Option>
        </Select>
      ),
    },
    {
      title: "Actions",
      render: (_, record) => (
        <Popconfirm
          title="Are you sure to delete this product?"
          onConfirm={() => handleDelete(record._id)}
        >
          <Button danger size="small">
            Delete
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* ✅ Sidebar */}
      <Sider breakpoint="lg" collapsedWidth="0">
        <Sidebar />
      </Sider>

      <Layout style={{ backgroundColor: "#f5f6f8" }}>
        <Content
          style={{
            margin: "24px",
            padding: "24px",
            background: "#ffffff",
            borderRadius: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <Title level={3} style={{ marginBottom: 24 }}>
            Admin - Product Management
          </Title>

          <Input.Search
            placeholder="Search products..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            allowClear
            style={{
              maxWidth: 320,
              marginBottom: 24,
              borderRadius: 6,
              padding: "10px",
            }}
          />

          <Table
            dataSource={filtered}
            columns={columns}
            rowKey="_id"
            loading={loading}
            pagination={{ pageSize: 8 }}
            bordered
            size="middle"
          />
        </Content>
      </Layout>
    </Layout>
  );
};

export default Product;
