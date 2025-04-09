import { Layout, Typography } from "antd";

const { Header: AntHeader } = Layout;
const { Title } = Typography;

export const Header = () => {
  return (
    <AntHeader
      style={{
        background: "#fff",
        padding: "0 16px",
        borderBottom: "1px solid #f0f0f0",
      }}
    >
      <Title level={3} style={{ margin: 0, lineHeight: "64px" }}>
        Dashboard
      </Title>
    </AntHeader>
  );
};
