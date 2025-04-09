import { Layout, Menu, Button, Typography, Avatar } from "antd";
import { UserOutlined, LockOutlined, PictureOutlined } from "@ant-design/icons";

const { Sider } = Layout;
const { Title, Text } = Typography;

interface SidebarProps {
  userData: {
    email: string;
    phone: string;
  };
  showResetPasswordModal: () => void;
  logout: () => void;
}

export const Sidebar = ({
  userData,
  showResetPasswordModal,
  logout,
}: SidebarProps) => {
  return (
    <Sider
      breakpoint="lg"
      collapsedWidth="0"
      theme="light"
      style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.15)", width: 280 }}
      width={280}
    >
      <div
        className="p-4 flex flex-col items-center justify-center"
        style={{ padding: "24px 16px", borderBottom: "1px solid #f0f0f0" }}
      >
        <Avatar size={64} icon={<UserOutlined />} />
        <Title level={4} style={{ marginTop: 16, marginBottom: 4 }}>
          {userData.email}
        </Title>
        <Text type="secondary">{userData.phone}</Text>
        <Button
          type="primary"
          icon={<LockOutlined />}
          onClick={showResetPasswordModal}
          style={{ marginTop: 16, width: "100%" }}
        >
          Reset Password
        </Button>
        <Button
          type="primary"
          icon={<LockOutlined />}
          onClick={logout}
          style={{ marginTop: 16, width: "100%" }}
        >
          Logout
        </Button>
      </div>
      <Menu
        mode="inline"
        defaultSelectedKeys={["1"]}
        items={[
          {
            key: "1",
            icon: <PictureOutlined />,
            label: "My Images",
          },
        ]}
      />
    </Sider>
  );
};
