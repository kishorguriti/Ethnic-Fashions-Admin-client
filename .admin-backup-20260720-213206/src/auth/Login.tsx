import React, { useState } from "react";
import { Form, Input, Checkbox, Button, Alert, Steps, message } from "antd";
import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks";
import { loginUser, verifyOtp, resendOtp, resetOtpStep } from "./authSlice";

interface LoginValues {
  email?: string;
  password?: string;
  remember?: boolean;
}

interface OtpValues {
  otp: string;
}

const AdminLogin: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [otpLoading, setOtpLoading] = useState<boolean>(false);
  const [resendLoading, setResendLoading] = useState<boolean>(false);
  const [form] = Form.useForm<LoginValues>();
  const [otpForm] = Form.useForm<OtpValues>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const otpStep = useAppSelector((state) => state.auth.otpStep);

  // Step 1: validate credentials, triggers an OTP send
  const onFinish = async (values: LoginValues) => {
    setLoading(true);
    try {
      await dispatch(
        loginUser({
          email: values.email as string,
          password: values.password as string,
        }),
      ).unwrap();
    } catch (error) {
      message.error(
        typeof error === "string" ? error : "Invalid credentials. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 2: verify OTP and complete login
  const onVerifyOtp = async (values: OtpValues) => {
    setOtpLoading(true);
    try {
      await dispatch(
        verifyOtp({ email: otpStep!.email, otp: values.otp }),
      ).unwrap();
      navigate("/");
    } catch (error) {
      message.error(typeof error === "string" ? error : "Invalid OTP. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResendLoading(true);
    try {
      await dispatch(resendOtp(otpStep!.email)).unwrap();
      message.success("OTP resent successfully");
    } catch (error) {
      message.error(typeof error === "string" ? error : "Failed to resend OTP");
    } finally {
      setResendLoading(false);
    }
  };

  const handleChangeAccount = () => {
    otpForm.resetFields();
    dispatch(resetOtpStep());
  };

  const step = otpStep ? 1 : 0;

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
        <Steps
          current={step}
          size="small"
          className="mb-4"
          items={[{ title: "Credentials" }, { title: "Verify OTP" }]}
        />

        {/* ── Step 1: Email & Password ── */}
        {step === 0 && (
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
              <Link to="/forgot-password" className="forgot-link">
                Forgot password?
              </Link>
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
                Continue
              </Button>
            </Form.Item>
          </Form>
        )}

        {/* ── Step 2: OTP Verification ── */}
        {step === 1 && otpStep && (
          <Form
            form={otpForm}
            name="admin_otp"
            layout="vertical"
            requiredMark={false}
            onFinish={onVerifyOtp}
            autoComplete="off"
          >
            <p className="text-muted small mb-3">
              OTP sent to <strong>{otpStep.email}</strong>.{" "}
              <a onClick={handleChangeAccount} style={{ cursor: "pointer" }}>
                Change
              </a>
            </p>

            {otpStep.devOtp && (
              <Alert
                type="warning"
                showIcon
                className="mb-3"
                message={
                  <span>
                    Dev mode — your OTP is{" "}
                    <strong style={{ letterSpacing: 2 }}>{otpStep.devOtp}</strong>
                  </span>
                }
              />
            )}

            <Form.Item
              label={<span className="field-label">OTP</span>}
              name="otp"
              rules={[
                { required: true, message: "Please enter the OTP!" },
                { len: 6, message: "OTP must be 6 digits" },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="6-digit OTP"
                className="custom-input"
                size="large"
                maxLength={6}
              />
            </Form.Item>

            <Form.Item className="mb-3">
              <Button
                type="primary"
                htmlType="submit"
                loading={otpLoading}
                className="submit-btn w-100 d-flex align-items-center justify-content-center"
                size="large"
              >
                Verify & Sign In
              </Button>
            </Form.Item>

            <div className="text-center">
              <a
                onClick={handleResendOtp}
                style={{ cursor: resendLoading ? "default" : "pointer" }}
                className="forgot-link"
              >
                {resendLoading ? "Resending..." : "Resend OTP"}
              </a>
            </div>
          </Form>
        )}
      </div>

      {/* Footer Branding Area */}
      <footer className="footer-copyright mt-4 text-center">
        © 2026 Ethnic Fashion. All rights reserved.
      </footer>
    </div>
  );
};

export default AdminLogin;
