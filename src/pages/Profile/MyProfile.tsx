import React, { useEffect, useState } from "react";
import { Form, Input, Button, Avatar, Tag, Skeleton, message, Divider } from "antd";
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from "@ant-design/icons";
import {
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
  type AdminProfile,
} from "../../services/adminApi";

const ROLE_LABEL: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  partner: "Partner",
};

const fmtDate = (d?: string) =>
  d ? new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

const MyProfile: React.FC = () => {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [pwSaving, setPwSaving] = useState<boolean>(false);

  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  const load = async () => {
    setLoading(true);
    try {
      const res = await getAdminProfile();
      const p = res.data.data.admin;
      setProfile(p);
      profileForm.setFieldsValue({ name: p.name, phone: p.phone ?? "" });
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Failed to load your profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const saveProfile = async (values: { name: string; phone?: string }) => {
    setSaving(true);
    try {
      const res = await updateAdminProfile({ name: values.name, phone: values.phone });
      setProfile(res.data.data.admin);
      message.success("Profile updated.");
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Failed to update your profile.");
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async (values: { currentPassword: string; newPassword: string }) => {
    setPwSaving(true);
    try {
      await changeAdminPassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      message.success("Password changed.");
      passwordForm.resetFields();
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Failed to change your password.");
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div className="my-profile-page container-fluid p-4">
      <div className="section-header-block mb-4">
        <h1 className="main-section-title mb-1">My Profile</h1>
        <p className="sub-section-desc text-muted mb-0">Manage your account details and password</p>
      </div>

      {loading ? (
        <div className="profile-surface-card p-4 bg-white border rounded-3">
          <Skeleton active avatar paragraph={{ rows: 6 }} />
        </div>
      ) : (
        <div className="row g-4">
          {/* Identity summary */}
          <div className="col-12 col-xl-4">
            <div className="profile-surface-card p-4 bg-white border rounded-3 h-100 text-center">
              <Avatar
                size={96}
                src={profile?.avatarUrl || undefined}
                icon={<UserOutlined />}
                className="profile-avatar mb-3"
              />
              <h4 className="profile-name mb-1">{profile?.name || "—"}</h4>
              <div className="text-muted mb-2">{profile?.email}</div>
              <Tag className="profile-role-pill">{ROLE_LABEL[profile?.role ?? ""] || profile?.role}</Tag>

              <Divider className="my-3" />

              <div className="profile-meta text-start small">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Last signed in</span>
                  <span>{fmtDate(profile?.lastLoginAt)}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Account created</span>
                  <span>{fmtDate(profile?.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Editable details */}
          <div className="col-12 col-xl-8">
            <div className="profile-surface-card p-4 bg-white border rounded-3 mb-4">
              <h5 className="profile-block-title mb-3">Account details</h5>
              <Form form={profileForm} layout="vertical" onFinish={saveProfile} requiredMark={false}>
                <div className="row">
                  <div className="col-12 col-md-6">
                    <Form.Item
                      name="name"
                      label="Full name"
                      rules={[{ required: true, message: "Enter your name" }, { min: 2, message: "At least 2 characters" }]}
                    >
                      <Input size="large" prefix={<UserOutlined className="text-muted" />} placeholder="Your name" />
                    </Form.Item>
                  </div>
                  <div className="col-12 col-md-6">
                    <Form.Item name="phone" label="Phone">
                      <Input size="large" prefix={<PhoneOutlined className="text-muted" />} placeholder="Optional" />
                    </Form.Item>
                  </div>
                </div>

                <Form.Item label="Email">
                  {/* Email identifies the account and keys the login OTP, so it is
                      not editable here — a super admin must change it. */}
                  <Input
                    size="large"
                    prefix={<MailOutlined className="text-muted" />}
                    value={profile?.email}
                    disabled
                  />
                </Form.Item>

                <Button type="primary" htmlType="submit" loading={saving}>
                  Save changes
                </Button>
              </Form>
            </div>

            <div className="profile-surface-card p-4 bg-white border rounded-3">
              <h5 className="profile-block-title mb-3">Change password</h5>
              <Form form={passwordForm} layout="vertical" onFinish={savePassword} requiredMark={false}>
                <Form.Item
                  name="currentPassword"
                  label="Current password"
                  rules={[{ required: true, message: "Enter your current password" }]}
                >
                  <Input.Password size="large" prefix={<LockOutlined className="text-muted" />} autoComplete="current-password" />
                </Form.Item>

                <div className="row">
                  <div className="col-12 col-md-6">
                    <Form.Item
                      name="newPassword"
                      label="New password"
                      rules={[
                        { required: true, message: "Choose a new password" },
                        { min: 8, message: "Use at least 8 characters" },
                      ]}
                    >
                      <Input.Password size="large" prefix={<LockOutlined className="text-muted" />} autoComplete="new-password" />
                    </Form.Item>
                  </div>
                  <div className="col-12 col-md-6">
                    <Form.Item
                      name="confirm"
                      label="Confirm new password"
                      dependencies={["newPassword"]}
                      rules={[
                        { required: true, message: "Re-enter the new password" },
                        ({ getFieldValue }) => ({
                          validator: (_, value) =>
                            !value || getFieldValue("newPassword") === value
                              ? Promise.resolve()
                              : Promise.reject(new Error("The two passwords do not match")),
                        }),
                      ]}
                    >
                      <Input.Password size="large" prefix={<LockOutlined className="text-muted" />} autoComplete="new-password" />
                    </Form.Item>
                  </div>
                </div>

                <Button type="primary" htmlType="submit" loading={pwSaving}>
                  Change password
                </Button>
              </Form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProfile;
