import { Alert, Button, Modal, Space, Typography } from "antd";
import { useLocation, useNavigate } from "react-router-dom";

const { Paragraph } = Typography;

export function usePortalNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  return { navigate, location };
}

export function PremiumGate({ title, description, returnTo }) {
  const navigate = useNavigate();

  return (
    <Alert
      type="warning"
      showIcon
      message={title}
      description={
        <Space direction="vertical" size="middle">
          <span>{description}</span>
          <Button type="primary" onClick={() => navigate(`/app/subscription?returnTo=${encodeURIComponent(returnTo)}`)}>
            View Plans
          </Button>
        </Space>
      }
    />
  );
}

export function UnlockRedirectModal({ open, title, itemLabel, description, onCancel, onConfirm }) {
  return (
    <Modal open={open} onCancel={onCancel} footer={null} centered title={title}>
      <Space direction="vertical" size="large" className="!w-full">
        <Paragraph className="!mb-0">
          {description} {itemLabel ? <strong>{itemLabel}</strong> : null}
        </Paragraph>
        <div className="flex flex-wrap justify-end gap-3">
          <Button onClick={onConfirm}>View Plans</Button>
          <Button type="primary" onClick={onConfirm}>Unlock Now</Button>
        </div>
      </Space>
    </Modal>
  );
}
