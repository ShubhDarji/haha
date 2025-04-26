// src/components/seller/SellerSidebar.jsx

import React, { useEffect, useState } from "react";
import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  ShoppingOutlined,
  OrderedListOutlined,
  DollarOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import "./SellerSidebar.css";

const { Sider } = Layout;

const SellerSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedKey, setSelectedKey] = useState("1");

  useEffect(() => {
    switch (location.pathname) {
      case "/seller/dashboard":
        setSelectedKey("1");
        break;
      case "/seller/products":
        setSelectedKey("2");
        break;
      case "/seller/orders":
        setSelectedKey("3");
        break;
      case "/seller/earnings":
        setSelectedKey("4");
        break;
      default:
        setSelectedKey("1");
    }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("sellerToken");
    navigate("/seller/login");
  };

  return (
    <Sider collapsible className="seller-sidebar">
      <Menu theme="dark" mode="vertical" selectedKeys={[selectedKey]}>
        <Menu.Item key="1" icon={<DashboardOutlined />} onClick={() => navigate("/seller/dashboard")}>
          Dashboard
        </Menu.Item>
        <Menu.Item key="2" icon={<ShoppingOutlined />} onClick={() => navigate("/seller/products")}>
          Manage Products
        </Menu.Item>
        <Menu.Item key="3" icon={<OrderedListOutlined />} onClick={() => navigate("/seller/orders")}>
          Manage Orders
        </Menu.Item>
        <Menu.Item key="4" icon={<DollarOutlined />} onClick={() => navigate("/seller/earnings")}>
          Earnings
        </Menu.Item>
        <Menu.Item key="5" icon={<LogoutOutlined />} onClick={handleLogout}>
          Logout
        </Menu.Item>
      </Menu>
    </Sider>
  );
};

export default SellerSidebar;