// import { Form, Input, Button } from "antd";
// import { useAppDispatch } from "../hooks";
// import { loginUser } from "./authSlice";

// export default function Login() {
//   const dispatch = useAppDispatch();

//   return (
//     <div className="container mt-5">
//       <Form onFinish={(v) => dispatch(loginUser(v))}>
//         <Form.Item name="email" rules={[{ required: true }]}>
//           <Input placeholder="email" />
//         </Form.Item>

//         <Form.Item name="password" rules={[{ required: true }]}>
//           <Input.Password />
//         </Form.Item>

//         <Button htmlType="submit">Login</Button>
//       </Form>
//     </div>
//   );
// }

import React, { useState } from "react";
import { Form, Input, Checkbox, Button, message } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../hooks";
import { loginUser } from "./authSlice";
// import './AdminLogin.scss';

// TypeScript interfaces for form values
interface LoginValues {
  email?: string;
  password?: string;
  remember?: boolean;
}

const AdminLogin: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm<LoginValues>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  // Handle dynamic form submission
  const onFinish = async (values: LoginValues) => {
    setLoading(true);
    try {
      console.log("Submitted Values:", values);
      // Simulate API verification call
      // await new Promise((resolve) => setTimeout(resolve, 1500));
      if (values?.email === "admin@test.com") {
        dispatch(
          loginUser(
            values as { email: string; password: string; remember: boolean },
          ),
        );
        message.success("Login successful! Redirecting...");
        navigate("/");
      } else {
        message.error("Invalid credentials. Please enter correct details.");
      }
    } catch (error) {
      message.error("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container d-flex flex-column justify-content-center align-items-center min-vh-100 px-3">
      {/* Top Header Logo & Heading Group */}
      <div className="text-center mb-4 header-group">
        <div className="icon-wrapper d-inline-flex align-items-center justify-content-center mb-3">
          <LockOutlined className="lock-icon" />
        </div>
        <h1 className="main-title mb-1">Admin Login</h1>
        <p className="subtitle-text">Sign in to your admin dashboard</p>
      </div>

      {/* Main Form Card Wrapper */}
      <div className="login-card w-100">
        <Form
          form={form}
          name="admin_login"
          layout="vertical"
          requiredMark={false}
          onFinish={onFinish}
          autoComplete="off"
        >
          {/* Email Field Input */}
          <Form.Item
            label={<span className="field-label">Email</span>}
            name="email"
            rules={[
              { required: true, message: "Please input your email address!" },
              { type: "email", message: "Please enter a valid email format!" },
            ]}
          >
            <Input
              placeholder="admin@example.com"
              className="custom-input"
              size="large"
            />
          </Form.Item>

          {/* Password Field Input */}
          <Form.Item
            label={<span className="field-label">Password</span>}
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password
              placeholder="Enter your password"
              className="custom-input password-input"
              size="large"
            />
          </Form.Item>

          {/* Actions: Remember Me & Forgot Password wrapper */}
          <div className="d-flex justify-content-between align-items-center mb-4 action-row">
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox className="remember-me">Remember me</Checkbox>
            </Form.Item>
            <a
              href="#forgot"
              className="forgot-link"
              onClick={(e) => e.preventDefault()}
            >
              Forgot password?
            </a>
          </div>

          {/* Submit Sign In Button */}
          <Form.Item className="mb-0">
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="submit-btn w-100 d-flex align-items-center justify-content-center"
              size="large"
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>
      </div>

      {/* Footer Branding Area */}
      <footer className="footer-copyright mt-4 text-center">
        © 2026 Ethnic Fashion. All rights reserved.
      </footer>
    </div>
  );
};

export default AdminLogin;
