import React, { useState, useEffect } from "react";
import {
  Layout,
  Table,
  Button,
  Select,
  Modal,
  message,
  Input,
  Form,
  InputNumber,
  Upload,
  Image,
  Space,
  Switch,
} from "antd";
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";
import SellerSidebar from "../../components/seller/SellerSidebar";
import axios from "axios";

const { Content } = Layout;
const { Option } = Select;
const { TextArea } = Input;

const STATUS_OPTIONS = ["Active", "Inactive"];
const API_BASE_URL = "http://localhost:5001/api/products";

const ManageProducts = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [productData, setProductData] = useState({
    primaryImage: null,
    primaryImagePreview: "",
    secondaryImages: [],
    secondaryImagePreviews: [],
  });

  const [form] = Form.useForm();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("sellerToken");
      const { data } = await axios.get(`${API_BASE_URL}/seller`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      console.error("Fetch Error:", error);
      message.error("Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    const filtered = products.filter(
      (product) =>
        product.productName.toLowerCase().includes(value.toLowerCase()) ||
        product.category.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  const handleStatusToggle = async (productId, isActive) => {
    try {
      const token = localStorage.getItem("sellerToken");
      await axios.put(
        `${API_BASE_URL}/status/${productId}`,
        { status: isActive ? "Active" : "Inactive" },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      message.success("Product status updated!");
      fetchProducts();
    } catch (error) {
      console.error("Status Toggle Error:", error);
      message.error("Failed to update status.");
    }
  };

  const showModal = async (product = null) => {
    setModalVisible(true);
    form.resetFields();

    if (product) {
      setEditingProductId(product._id);
      try {
        const token = localStorage.getItem("sellerToken");
        const { data } = await axios.get(`${API_BASE_URL}/${product._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        form.setFieldsValue(data);
        setProductData({
          primaryImagePreview: data.primaryImage,
          secondaryImagePreviews: data.secondaryImages || [],
          primaryImage: null,
          secondaryImages: [],
        });
      } catch (error) {
        message.error("Failed to fetch product data.");
      }
    } else {
      setEditingProductId(null);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    form.resetFields();
    setProductData({
      primaryImage: null,
      primaryImagePreview: "",
      secondaryImages: [],
      secondaryImagePreviews: [],
    });
  };

  const validateFile = (file) => {
    const isImage = file.type === "image/jpeg" || file.type === "image/png";
    const isLt2M = file.size / 1024 / 1024 < 2;

    if (!isImage) message.error("Only JPG/PNG images are allowed!");
    if (!isLt2M) message.error("Image must be smaller than 2MB!");

    return isImage && isLt2M;
  };

  const handlePrimaryImageUpload = ({ file }) => {
    if (validateFile(file)) {
      setProductData((prev) => ({
        ...prev,
        primaryImage: file,
        primaryImagePreview: URL.createObjectURL(file),
      }));
    }
  };

  const handleSecondaryImageUpload = ({ file }) => {
    if (validateFile(file)) {
      setProductData((prev) => ({
        ...prev,
        secondaryImages: [...prev.secondaryImages, file],
        secondaryImagePreviews: [
          ...prev.secondaryImagePreviews,
          URL.createObjectURL(file),
        ],
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const sellerId = localStorage.getItem("sellerId");
      const token = localStorage.getItem("sellerToken");

      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        formData.append(key, value);
      });

      if (productData.primaryImage) {
        formData.append("primaryImage", productData.primaryImage);
      }

      (productData.secondaryImages || []).forEach((file) =>
        formData.append("secondaryImages", file)
      );

      formData.append("sellerId", sellerId);

      const url = editingProductId
        ? `${API_BASE_URL}/update/${editingProductId}`
        : `${API_BASE_URL}/add`;

      const method = editingProductId ? "put" : "post";

      await axios[method](url, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      message.success(editingProductId ? "Product updated!" : "Product added!");
      fetchProducts();
      closeModal();
    } catch (error) {
      message.error("Failed to submit.");
    }
  };

  const handleDelete = async (productId) => {
    try {
      const token = localStorage.getItem("sellerToken");
      await axios.delete(`${API_BASE_URL}/delete/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      message.success("Product deleted successfully!");
      fetchProducts();
    } catch (error) {
      message.error("Failed to delete product.");
    }
  };

  const columns = [
    { title: "Name", dataIndex: "productName", key: "productName" },
    { title: "Category", dataIndex: "category", key: "category" },
    { title: "Company", dataIndex: "companyName", key: "companyName" },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: "Stock",
      dataIndex: "stock",
      key: "stock",
      sorter: (a, b) => a.stock - b.stock,
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      filters: [
        { text: "Active", value: "Active" },
        { text: "Inactive", value: "Inactive" },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status, record) => (
        <Switch
          checked={status === "Active"}
          onChange={(checked) => handleStatusToggle(record._id, checked)}
        />
      ),
    },
    {
      title: "Actions",
      render: (_, record) => (
        <Space>
          <Button onClick={() => showModal(record)}>Edit</Button>
          <Button danger onClick={() => handleDelete(record._id)}>Delete</Button>
        </Space>
      ),
    },
  ];

  return (
    <Layout>
      <SellerSidebar />
      <Content style={{ padding: 24 }}>
        <Space style={{ marginBottom: 16 }}>
          <Input.Search
            placeholder="Search by name or category"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
            Add Product
          </Button>
        </Space>

        <Table
          dataSource={filteredProducts}
          columns={columns}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />

        <Modal
          open={modalVisible}
          title={editingProductId ? "Edit Product" : "Add Product"}
          onCancel={closeModal}
          onOk={handleSubmit}
        >
          <Form form={form} layout="vertical">
            <Form.Item label="Product Name" name="productName" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item label="Category" name="category" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item label="Company Name" name="companyName">
              <Input />
            </Form.Item>
            <Form.Item label="Original Price" name="originalPrice">
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item label="Price" name="price">
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item label="Stock" name="stock">
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item label="Specifications" name="specifications">
              <TextArea rows={3} />
            </Form.Item>
            <Form.Item label="Shipping Policy" name="shippingPolicy">
              <TextArea rows={2} />
            </Form.Item>
            <Form.Item label="Return Policy" name="returnPolicy">
              <TextArea rows={2} />
            </Form.Item>
            <Form.Item label="Status" name="status">
              <Select>
                {STATUS_OPTIONS.map((status) => (
                  <Option key={status} value={status}>{status}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label="Primary Image">
              <Upload showUploadList={false} customRequest={handlePrimaryImageUpload}>
                <Button icon={<UploadOutlined />}>Upload</Button>
              </Upload>
              {productData.primaryImagePreview && (
                <Image src={productData.primaryImagePreview} width={120} style={{ marginTop: 10 }} />
              )}
            </Form.Item>
            <Form.Item label="Secondary Images">
              <Upload showUploadList={false} customRequest={handleSecondaryImageUpload}>
                <Button icon={<UploadOutlined />}>Upload</Button>
              </Upload>
              <Space>
                {productData.secondaryImagePreviews.map((src, index) => (
                  <Image key={index} src={src} width={80} />
                ))}
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </Content>
    </Layout>
  );
};

export default ManageProducts;