import React, { useState } from "react";
import { Form, Input, Button, Alert, Steps, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { MailOutlined, LockOutlined, SafetyOutlined } from "@ant-design/icons";
import { forgotPasswordAPI, resetPasswordAPI } from "./authAPI";

/**
 * Two-step reset: request a code by email, then set a new password with it.
 *
 * The request step never reveals whether an address is registered — the server
 * returns the same response either way, and this screen mirrors that wording so
 * the UI doesn't leak what the API deliberately withholds.
 */
const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<0 | 1>(0);
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const requestCode = async (values: { email: string }) => {
    setLoading(true);
    setError("");
    try {
      await forgotPasswordAPI(values.email);
      setEmail(values.email);
      setStep(1);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Could not send the reset code. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const submitReset = async (values: { otp: string; newPassword: string; confirm: string }) => {
    setLoading(true);
    setError("");
    try {
      await resetPasswordAPI({ email, otp: values.otp, newPassword: values.newPassword });
      message.success("Password reset. Please sign in.");
      navigate("/login");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Could not reset the password. Check the code and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-page d-flex align-items-center justify-content-center min-vh-100">
      <div className="forgot-card">
        <div className="forgot-card-header text-center mb-4">
          <h2 className="forgot-title mb-1">Reset your password</h2>
          <p className="text-muted mb-0">
            {step === 0
              ? "We'll email you a verification code"
              : `Enter the code sent to ${email}`}
          </p>
        </div>

        <Steps
          size="small"
          current={step}
          className="mb-4"
          items={[{ title: "Your email" }, { title: "New password" }]}
        />

        {error && <Alert message={error} type="error" showIcon className="mb-3" />}

        {step === 0 ? (
          <Form layout="vertical" onFinish={requestCode} requiredMark={false}>
            <Form.Item
              name="email"
              label="Email address"
              rules={[
                { required: true, message: "Enter your email address" },
                { type: "email", message: "Enter a valid email address" },
              ]}
            >
              <Input
                size="large"
                prefix={<MailOutlined className="text-muted" />}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </Form.Item>

            <Button type="primary" htmlType="submit" size="large" block loading={loading}>
              Send reset code
            </Button>
          </Form>
        ) : (
          <Form layout="vertical" onFinish={submitReset} requiredMark={false}>
            <Form.Item
              name="otp"
              label="Verification code"
              rules={[{ required: true, message: "Enter the code from your email" }]}
            >
              <Input
                size="large"
                prefix={<SafetyOutlined className="text-muted" />}
                placeholder="6-digit code"
                maxLength={6}
                autoComplete="one-time-code"
              />
            </Form.Item>

            <Form.Item
              name="newPassword"
              label="New password"
              rules={[
                { required: true, message: "Choose a new password" },
                { min: 8, message: "Use at least 8 characters" },
              ]}
            >
              <Input.Password
                size="large"
                prefix={<LockOutlined className="text-muted" />}
                placeholder="At least 8 characters"
                autoComplete="new-password"
              />
            </Form.Item>

            <Form.Item
              name="confirm"
              label="Confirm new password"
              dependencies={["newPassword"]}
              rules={[
                { required: true, message: "Re-enter the password" },
                ({ getFieldValue }) => ({
                  validator: (_, value) =>
                    !value || getFieldValue("newPassword") === value
                      ? Promise.resolve()
                      : Promise.reject(new Error("The two passwords do not match")),
                }),
              ]}
            >
              <Input.Password
                size="large"
                prefix={<LockOutlined className="text-muted" />}
                placeholder="Re-enter the password"
                autoComplete="new-password"
              />
            </Form.Item>

            <Button type="primary" htmlType="submit" size="large" block loading={loading}>
              Reset password
            </Button>

            <Button type="link" block className="mt-2" onClick={() => { setStep(0); setError(""); }}>
              Use a different email
            </Button>
          </Form>
        )}

        <div className="text-center mt-3">
          <Link to="/login" className="back-to-login">← Back to sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
