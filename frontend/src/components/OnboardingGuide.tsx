import { Tour } from 'antd';
import type { TourProps } from 'antd';

interface Props {
  open: boolean;
  onClose: () => void;
}

const steps: TourProps['steps'] = [
  {
    title: '上传销售数据',
    description: '点击此处上传您的Excel或CSV销售数据文件，系统将自动识别列名并清洗数据。',
    cover: null,
  },
  {
    title: '查看经营分析',
    description: '上传数据后，系统会自动生成销售看板、客户分析和AI经营报告，帮您全面了解经营状况。',
    cover: null,
  },
  {
    title: '接收经营预警',
    description: '开启预警后，系统会自动检测销售异常、客户流失和库存问题，及时通知您关注风险。',
    cover: null,
  },
];

export default function OnboardingGuide({ open, onClose }: Props) {
  return (
    <Tour
      open={open}
      onClose={onClose}
      steps={steps}
      type="primary"
      indicatorsRender={(current, total) => (
        <span>{current + 1} / {total}</span>
      )}
    />
  );
}
