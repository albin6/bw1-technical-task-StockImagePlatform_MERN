import { useState, useEffect } from "react";
import { Layout, Modal, Form, Input, message, Button } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { Header } from "../components/Header";
import { Sidebar } from "../components/Sidebar";
import { MainContent } from "../components/MainContent";
import { imageService, ImageData } from "../api/image-service";

interface UserData {
  email: string;
  phone: string;
}

export default function Dashboard() {
  // Mock user data - would come from API in real app
  const [userData] = useState<UserData>({
    email: "user@example.com",
    phone: "+1234567890",
  });

  // State for password reset modal
  const [resetPasswordVisible, setResetPasswordVisible] = useState(false);
  const [resetPasswordStep, setResetPasswordStep] = useState(1);
  const [resetPasswordForm] = Form.useForm();
  const [newPasswordForm] = Form.useForm();
  const [resetLoading, setResetLoading] = useState(false);

  // State for image management
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(false);
  const [editImageVisible, setEditImageVisible] = useState(false);
  const [currentImage, setCurrentImage] = useState<ImageData | null>(null);
  const [editImageForm] = Form.useForm();

  // Fetch images on component mount
  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        const data = await imageService.getImages();
        setImages(data);
      } catch (error) {
        message.error("Failed to fetch images");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  // Password reset handlers
  const showResetPasswordModal = () => {
    setResetPasswordVisible(true);
    setResetPasswordStep(1);
    resetPasswordForm.resetFields();
    newPasswordForm.resetFields();
  };

  const handleResetPasswordCancel = () => {
    setResetPasswordVisible(false);
  };

  const verifyCurrentPassword = async (values: any) => {
    try {
      setResetLoading(true);
      // Simulate API call to verify current password
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Move to next step if password is correct
      setResetPasswordStep(2);
    } catch (error) {
      message.error("Failed to verify password");
    } finally {
      setResetLoading(false);
    }
  };

  const submitNewPassword = async (values: any) => {
    try {
      setResetLoading(true);
      // Simulate API call to update password
      await new Promise((resolve) => setTimeout(resolve, 1000));

      message.success("Password updated successfully");
      setResetPasswordVisible(false);
    } catch (error) {
      message.error("Failed to update password");
    } finally {
      setResetLoading(false);
    }
  };

  // Image edit handlers
  const showEditImageModal = (image: ImageData) => {
    setCurrentImage(image);
    editImageForm.setFieldsValue({
      title: image.title,
    });
    setEditImageVisible(true);
  };

  const handleEditImageCancel = () => {
    setEditImageVisible(false);
    setCurrentImage(null);
  };

  const submitImageEdit = async (values: any) => {
    if (!currentImage) return;

    try {
      setLoading(true);
      await imageService.updateImage(currentImage._id, values.title);

      // Update image in state
      const updatedImages = images.map((img) =>
        img._id === currentImage._id ? { ...img, title: values.title } : img
      );

      setImages(updatedImages);
      message.success("Image updated successfully");
      setEditImageVisible(false);
      setCurrentImage(null);
    } catch (error) {
      message.error("Failed to update image");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sidebar Component */}
      <Sidebar
        logout={() => {}}
        userData={userData}
        showResetPasswordModal={showResetPasswordModal}
      />

      {/* Main Layout */}
      <Layout>
        {/* Header Component */}
        <Header />

        {/* Main Content Component */}
        <MainContent
          images={images}
          setImages={setImages}
          showEditImageModal={showEditImageModal}
          loading={loading}
          setLoading={setLoading}
        />
      </Layout>

      {/* Password Reset Modal */}
      <Modal
        title="Reset Password"
        open={resetPasswordVisible}
        onCancel={handleResetPasswordCancel}
        footer={null}
      >
        {resetPasswordStep === 1 ? (
          <Form
            form={resetPasswordForm}
            layout="vertical"
            onFinish={verifyCurrentPassword}
          >
            <Form.Item
              name="currentPassword"
              label="Current Password"
              rules={[
                {
                  required: true,
                  message: "Please enter your current password",
                },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Enter your current password"
              />
            </Form.Item>
            <Form.Item
              name="confirmCurrentPassword"
              label="Confirm Current Password"
              dependencies={["currentPassword"]}
              rules={[
                {
                  required: true,
                  message: "Please confirm your current password",
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("currentPassword") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("The two passwords do not match")
                    );
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Confirm your current password"
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={resetLoading}
                block
              >
                Verify Password
              </Button>
            </Form.Item>
          </Form>
        ) : (
          <Form
            form={newPasswordForm}
            layout="vertical"
            onFinish={submitNewPassword}
          >
            <Form.Item
              name="newPassword"
              label="New Password"
              rules={[
                { required: true, message: "Please enter your new password" },
                { min: 8, message: "Password must be at least 8 characters" },
                {
                  pattern:
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                  message:
                    "Password must contain uppercase, lowercase, number and special character",
                },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Enter your new password"
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={resetLoading}
                block
              >
                Update Password
              </Button>
            </Form.Item>
          </Form>
        )}
      </Modal>

      {/* Edit Image Modal */}
      <Modal
        title="Edit Image"
        open={editImageVisible}
        onCancel={handleEditImageCancel}
        footer={null}
      >
        {currentImage && (
          <Form
            form={editImageForm}
            layout="vertical"
            onFinish={submitImageEdit}
          >
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <img
                src={currentImage.url || "/placeholder.svg"}
                alt={currentImage.title}
                style={{ maxWidth: "100%", maxHeight: 200 }}
              />
            </div>
            <Form.Item
              name="title"
              label="Image Title"
              rules={[{ required: true, message: "Please enter image title" }]}
            >
              <Input placeholder="Enter image title" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Update Image
              </Button>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </Layout>
  );
}
