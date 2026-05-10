import type { ApiResponse } from '../types';

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

export async function submitFeedback(_data: {
  type: 'bug' | 'suggestion' | 'other';
  content: string;
  contact?: string;
}): Promise<ApiResponse<null>> {
  await delay();
  return { code: 0, data: null, message: '反馈已提交，感谢您的建议！' };
}
