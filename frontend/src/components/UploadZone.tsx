import { useState } from 'react';
import { Upload, message, Typography } from 'antd';
import { CloudUploadOutlined, FileExcelOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';

const { Dragger } = Upload;

interface Props {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}

export default function UploadZone({ onFileSelected, disabled }: Props) {
  const [fileName, setFileName] = useState<string | null>(null);

  const props: UploadProps = {
    name: 'file',
    multiple: false,
    accept: '.xls,.xlsx,.csv',
    maxCount: 1,
    showUploadList: false,
    disabled,
    beforeUpload: (file) => {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!ext || !['xls', 'xlsx', 'csv'].includes(ext)) {
        message.error('仅支持 xls、xlsx、csv 格式文件');
        return false;
      }
      if (file.size > 50 * 1024 * 1024) {
        message.error('文件大小不能超过50MB');
        return false;
      }
      setFileName(file.name);
      onFileSelected(file);
      return false;
    },
  };

  return (
    <Dragger {...props} style={{ padding: '24px 16px' }}>
      <p className="ant-upload-drag-icon">
        {fileName ? (
          <FileExcelOutlined style={{ fontSize: 48, color: '#52c41a' }} />
        ) : (
          <CloudUploadOutlined style={{ fontSize: 48, color: '#1677ff' }} />
        )}
      </p>
      {fileName ? (
        <>
          <Typography.Text strong style={{ fontSize: 16 }}>{fileName}</Typography.Text>
          <br />
          <Typography.Text type="secondary">点击重新选择文件</Typography.Text>
        </>
      ) : (
        <>
          <Typography.Text strong style={{ fontSize: 16 }}>
            点击或拖拽文件到此区域上传
          </Typography.Text>
          <br />
          <Typography.Text type="secondary">
            支持 .xls、.xlsx、.csv 格式，单文件不超过50MB
          </Typography.Text>
        </>
      )}
    </Dragger>
  );
}
