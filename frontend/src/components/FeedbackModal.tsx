import { useState } from 'react';
import { Modal, Form, Radio, Input, message } from 'antd';
import { submitFeedback } from '../api/feedback';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function FeedbackModal({ open, onClose }: Props) {
  const [loading, setLoading] = useState(false);
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
        message.success(res.message);
        form.resetFields();
        onClose();
      }
    } catch {
      message.error('提交失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="意见反馈"
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={loading}
      okText="提交反馈"
      cancelText="取消"
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item name="type" label="反馈类型" rules={[{ required: true, message: '请选择类型' }]}>
          <Radio.Group>
            <Radio.Button value="bug">Bug反馈</Radio.Button>
            <Radio.Button value="suggestion">功能建议</Radio.Button>
            <Radio.Button value="other">其他</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          name="content"
          label="详细描述"
          rules={[{ required: true, message: '请输入反馈内容' }]}
        >
          <Input.TextArea rows={4} placeholder="请详细描述您遇到的问题或建议..." maxLength={500} showCount />
        </Form.Item>
        <Form.Item name="contact" label="联系方式（选填）">
          <Input placeholder="手机号或邮箱，方便我们联系您" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
