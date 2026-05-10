import { useState } from 'react';
import { Typography, Form, Radio, Input, Button, message, Card, Result } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import { submitFeedback } from '../api/feedback';

export default function FeedbackPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form] = Form.useForm();

  const handleSubmit = async (values: { type: string; content: string; contact?: string }) => {
    setLoading(true);
    try {
      const res = await submitFeedback({
        type: values.type as 'bug' | 'suggestion' | 'other',
        content: values.content,
        contact: values.contact,
      });
      if (res.code === 0) {
        setSubmitted(true);
        form.resetFields();
      }
    } catch {
      message.error('提交失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Result
        status="success"
        icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
        title="感谢您的反馈！"
        subTitle="我们会认真对待每一条建议，持续改进智析免费版"
        extra={
          <Button
            type="primary"
            onClick={() => setSubmitted(false)}
          >
            继续反馈
          </Button>
        }
      />
    );
  }

  return (
    <div>
      <Typography.Title level={4}>意见反馈</Typography.Title>
      <Typography.Paragraph type="secondary">
        您的反馈将帮助我们不断改进智析免费版。遇到bug、有功能建议或使用问题，都可以在这里告诉我们。
      </Typography.Paragraph>

      <Card style={{ maxWidth: 600 }}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="type"
            label="反馈类型"
            rules={[{ required: true, message: '请选择反馈类型' }]}
          >
            <Radio.Group buttonStyle="solid" size="large">
              <Radio.Button value="bug">Bug反馈</Radio.Button>
              <Radio.Button value="suggestion">功能建议</Radio.Button>
              <Radio.Button value="other">其他</Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="content"
            label="详细描述"
            rules={[
              { required: true, message: '请输入反馈内容' },
              { min: 10, message: '请至少输入10个字' },
            ]}
          >
            <Input.TextArea
              rows={5}
              placeholder="请详细描述您遇到的问题或建议，包括操作步骤、预期结果和实际结果..."
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Form.Item name="contact" label="联系方式（选填）">
            <Input placeholder="手机号或邮箱，方便我们与您进一步沟通" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} size="large">
              提交反馈
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
