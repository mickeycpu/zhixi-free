import { useState, useEffect } from 'react';
import { Typography, Button, Steps, message, Space, Table, Tag } from 'antd';
import { UploadOutlined, CheckOutlined } from '@ant-design/icons';
import UploadZone from '../components/UploadZone';
import { uploadFile, getUploadHistory } from '../api/data';
import type { UploadRecord } from '../types';

const statusMap: Record<string, { color: string; text: string }> = {
  done: { color: 'success', text: '完成' },
  error: { color: 'error', text: '失败' },
  processing: { color: 'processing', text: '处理中' },
  pending: { color: 'default', text: '等待中' },
};

export default function UploadPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ row_count: number; columns: string[] } | null>(null);
  const [history, setHistory] = useState<UploadRecord[]>([]);

  useEffect(() => {
    getUploadHistory()
      .then((res) => { if (res.code === 0) setHistory(res.data); })
      .catch(() => {});
  }, []);

  const handleFileSelected = (file: File) => {
    setSelectedFile(file);
    setResult(null);
    setCurrentStep(0);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    try {
      const res = await uploadFile(selectedFile);
      if (res.code === 0) {
        setResult({ row_count: res.data.row_count, columns: res.data.columns });
        setCurrentStep(1);
        message.success(`上传成功！共导入 ${res.data.row_count} 条数据`);

        // 刷新历史记录
        getUploadHistory()
          .then((h) => { if (h.code === 0) setHistory(h.data); })
          .catch(() => {});
      } else {
        message.error(res.message || '上传失败');
      }
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || '上传失败，请重试';
      message.error(typeof msg === 'string' ? msg : '上传失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setSelectedFile(null);
    setResult(null);
  };

  return (
    <div>
      <Typography.Title level={4} style={{ marginBottom: 24 }}>
        数据上传
      </Typography.Title>

      <Steps
        current={currentStep}
        items={[
          { title: '选择文件', icon: <UploadOutlined /> },
          { title: '完成上传', icon: <CheckOutlined /> },
        ]}
        style={{ marginBottom: 32, maxWidth: 400 }}
      />

      {currentStep === 0 && (
        <section>
          <UploadZone onFileSelected={handleFileSelected} disabled={uploading} />

          {selectedFile && (
            <Space style={{ marginTop: 24 }}>
              <Button size="large" type="primary" onClick={handleUpload} loading={uploading}>
                确认上传
              </Button>
              <Button size="large" onClick={handleReset}>重新选择</Button>
            </Space>
          )}

          {history.length > 0 && (
            <div style={{ marginTop: 32 }}>
              <Typography.Text strong style={{ fontSize: 15, display: 'block', marginBottom: 12 }}>
                上传历史
              </Typography.Text>
              <Table
                dataSource={history}
                rowKey="id"
                size="small"
                pagination={false}
                columns={[
                  { title: '文件名', dataIndex: 'filename', key: 'filename', ellipsis: true },
                  { title: '数据量', dataIndex: 'row_count', key: 'row_count', render: (v: number) => `${v} 条` },
                  {
                    title: '状态', dataIndex: 'status', key: 'status',
                    render: (s: string) => {
                      const cfg = statusMap[s] || { color: 'default', text: s };
                      return <Tag color={cfg.color}>{cfg.text}</Tag>;
                    },
                  },
                  {
                    title: '上传时间', dataIndex: 'created_at', key: 'created_at',
                    render: (v: string) => new Date(v).toLocaleString(),
                  },
                ]}
                scroll={{ x: 'max-content' }}
              />
            </div>
          )}
        </section>
      )}

      {currentStep === 1 && result && (
        <section style={{ textAlign: 'center', paddingTop: 40 }}>
          <CheckOutlined style={{ fontSize: 64, color: '#52c41a', marginBottom: 16, display: 'block' }} />
          <Typography.Title level={4}>上传成功！</Typography.Title>
          <Typography.Paragraph type="secondary">
            共导入 <strong>{result.row_count}</strong> 条数据，识别到 <strong>{result.columns.length}</strong> 个字段。
            系统正在自动清洗和分析，稍后即可查看结果。
          </Typography.Paragraph>
          <Space>
            <Button onClick={handleReset}>继续上传</Button>
            <Button type="primary" onClick={() => (window.location.href = '/dashboard')}>
              前往看板
            </Button>
          </Space>
        </section>
      )}
    </div>
  );
}
