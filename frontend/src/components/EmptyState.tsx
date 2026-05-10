import { Result, Button } from 'antd';
import { CloudUploadOutlined, FileTextOutlined, InboxOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

interface Props {
  type: 'no-data' | 'no-report' | 'no-alerts';
  title: string;
  description: string;
  action?: React.ReactNode;
}

const iconMap = {
  'no-data': <CloudUploadOutlined />,
  'no-report': <FileTextOutlined />,
  'no-alerts': <InboxOutlined />,
};

export default function EmptyState({ type, title, description, action }: Props) {
  const navigate = useNavigate();

  return (
    <Result
      icon={
        <span style={{ fontSize: 72, color: '#bfbfbf' }}>
          {iconMap[type]}
        </span>
      }
      title={title}
      subTitle={description}
      extra={
        action || (
          type === 'no-data' ? (
            <Button type="primary" onClick={() => navigate('/upload')}>
              上传数据
            </Button>
          ) : undefined
        )
      }
    />
  );
}
