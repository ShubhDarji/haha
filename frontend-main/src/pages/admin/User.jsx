import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Popconfirm,
  Space,
  Layout,
  Typography,
} from "antd";
import axios from "axios";
import Sidebar from "./sidebar"; // Adjust if needed
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

const { Content } = Layout;
const { Title } = Typography;

const User = () => {
  const [users, setUsers] = useState([]);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const adminToken = localStorage.getItem("adminToken");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("http://localhost:5001/api/users", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      setUsers(data);
    } catch (err) {
      message.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5001/api/users/${id}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      message.success("User deleted");
      fetchUsers();
    } catch {
      message.error("Failed to delete user");
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    form.setFieldsValue(user);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (editingUser) {
        await axios.put(`http://localhost:5001/api/users/profile`, values, {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        message.success("User updated");
      } else {
        await axios.post("http://localhost:5001/api/users/signup", values);
        message.success("User created");
      }

      fetchUsers();
      setIsModalOpen(false);
    } catch (err) {
      message.error("Something went wrong");
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      render: (text) => <strong style={{ fontSize: "1rem" }}>{text}</strong>,
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Actions",
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          <Button
            icon={<EditOutlined />}
            type="link"
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this user?"
            onConfirm={() => handleDelete(record._id)}
          >
            <Button icon={<DeleteOutlined />} danger type="link">
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh", background: "#f4f6f8" }}>
      <Sidebar />

      <Layout className="site-layout" style={{ paddingLeft: 200 }}>
        <Content
          style={{
            margin: "24px",
            padding: "24px",
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
            <Title level={3} style={{ margin: 0 }}>
              User Management
            </Title>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              Add User
            </Button>
          </div>

          <Table
            dataSource={users}
            columns={columns}
            rowKey="_id"
            loading={loading}
            bordered
            pagination={{ pageSize: 6 }}
            size="middle"
          />

          <Modal
            title={editingUser ? "Edit User" : "Add New User"}
            open={isModalOpen}
            onCancel={() => setIsModalOpen(false)}
            onOk={handleSubmit}
            okText={editingUser ? "Update" : "Create"}
            destroyOnClose
          >
            <Form
              form={form}
              layout="vertical"
              size="large"
              style={{ marginTop: 12 }}
            >
              <Form.Item
                name="name"
                label="Full Name"
                rules={[{ required: true, message: "Please enter name" }]}
              >
                <Input placeholder="e.g. John Doe" />
              </Form.Item>
              <Form.Item
                name="email"
                label="Email Address"
                rules={[
                  { required: true, message: "Please enter email" },
                  { type: "email", message: "Invalid email" },
                ]}
              >
                <Input placeholder="e.g. john@example.com" />
              </Form.Item>
              {!editingUser && (
                <Form.Item
                  name="password"
                  label="Password"
                  rules={[{ required: true, message: "Please set a password" }]}
                >
                  <Input.Password placeholder="Minimum 6 characters" />
                </Form.Item>
              )}
            </Form>
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default User;
