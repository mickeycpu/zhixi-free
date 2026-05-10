import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Typography, Divider, Tag } from 'antd';

interface Props {
  title: string;
  markdown: string;
  structured?: {
    problems?: string[];
    analysis?: string[];
    suggestions?: string[];
  } | null;
  dateStart?: string;
  dateEnd?: string;
}

export default function AIReportViewer({ title, markdown, structured, dateStart, dateEnd }: Props) {
  return (
    <div id="ai-report-content">
      <Typography.Title level={4}>{title}</Typography.Title>
      <Typography.Text type="secondary">
        报告周期：{dateStart} ~ {dateEnd}
      </Typography.Text>

      {structured && (
        <div style={{ marginTop: 20, marginBottom: 20 }}>
          {structured.problems && structured.problems.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <Tag color="error" style={{ fontSize: 14, padding: '2px 12px', marginBottom: 8 }}>
                关键问题
              </Tag>
              <ul style={{ paddingLeft: 20 }}>
                {structured.problems.map((item, i) => (
                  <li key={i} style={{ marginBottom: 4 }}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          {structured.analysis && structured.analysis.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <Tag color="processing" style={{ fontSize: 14, padding: '2px 12px', marginBottom: 8 }}>
                分析发现
              </Tag>
              <ul style={{ paddingLeft: 20 }}>
                {structured.analysis.map((item, i) => (
                  <li key={i} style={{ marginBottom: 4 }}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          {structured.suggestions && structured.suggestions.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <Tag color="success" style={{ fontSize: 14, padding: '2px 12px', marginBottom: 8 }}>
                经营建议
              </Tag>
              <ol style={{ paddingLeft: 20 }}>
                {structured.suggestions.map((item, i) => (
                  <li key={i} style={{ marginBottom: 4 }}>{item}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}

      <Divider />

      <div className="markdown-body" style={{ lineHeight: 1.8, fontSize: 15 }}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {markdown}
        </ReactMarkdown>
      </div>
    </div>
  );
}
