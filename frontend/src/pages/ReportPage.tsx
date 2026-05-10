import { useState, useEffect } from 'react';
import { Typography, Button, Result, Skeleton } from 'antd';
import { ReloadOutlined, ThunderboltOutlined } from '@ant-design/icons';
import AIReportViewer from '../components/AIReportViewer';
import PDFExportButton from '../components/PDFExportButton';
import EmptyState from '../components/EmptyState';
import { getReports, generateReport } from '../api/report';
import type { AIReport } from '../types';

export default function ReportPage() {
  const [reports, setReports] = useState<AIReport[]>([]);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [noData, setNoData] = useState(false);

  const loadReports = async () => {
    setLoading(true);
    const res = await getReports();
    if (res.code === 0) {
      setReports(res.data);
      setNoData(res.data.length === 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await generateReport();
      if (res.code === 0) {
        setReports((prev) => [res.data, ...prev]);
        setNoData(false);
      } else if (res.code === 400) {
        setNoData(true);
      }
    } catch {
      // ignore
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Typography.Title level={4}>AI经营报告</Typography.Title>
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    );
  }

  if (noData && reports.length === 0) {
    return (
      <div>
        <Typography.Title level={4}>AI经营报告</Typography.Title>
        <EmptyState
          type="no-report"
          title="暂无AI经营报告"
          description="上传至少30天的销售历史数据后，AI将自动生成经营分析报告"
          action={
            <Button
              type="primary"
              icon={<ThunderboltOutlined />}
              onClick={handleGenerate}
              loading={generating}
              size="large"
            >
              生成我的第一份报告
            </Button>
          }
        />
      </div>
    );
  }

  const latestReport = reports[0];

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 8,
          marginBottom: 16,
        }}
      >
        <Typography.Title level={4} style={{ margin: 0 }}>AI经营报告</Typography.Title>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleGenerate}
            loading={generating}
          >
            重新生成
          </Button>
          <PDFExportButton />
        </div>
      </div>

      {latestReport ? (
        <AIReportViewer
          title={latestReport.title}
          markdown={latestReport.markdown_content}
          structured={latestReport.structured_json}
          dateStart={latestReport.date_range_start}
          dateEnd={latestReport.date_range_end}
        />
      ) : (
        <Result
          status="warning"
          title="暂无可用报告"
          extra={
            <Button
              type="primary"
              onClick={handleGenerate}
              loading={generating}
              icon={<ThunderboltOutlined />}
            >
              生成AI报告
            </Button>
          }
        />
      )}

      {reports.length > 1 && (
        <div style={{ marginTop: 32 }}>
          <Typography.Text strong style={{ fontSize: 15, display: 'block', marginBottom: 12 }}>
            历史报告
          </Typography.Text>
          {reports.slice(1).map((r) => (
            <div
              key={r.id}
              style={{
                padding: '12px 16px',
                border: '1px solid #f0f0f0',
                borderRadius: 8,
                marginBottom: 8,
                cursor: 'pointer',
              }}
              onClick={() => {
                setReports([r, ...reports.filter((x) => x.id !== r.id)]);
              }}
            >
              <Typography.Text strong>{r.title}</Typography.Text>
              <br />
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {new Date(r.created_at).toLocaleString()}
              </Typography.Text>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
