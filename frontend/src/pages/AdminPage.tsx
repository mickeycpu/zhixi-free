import { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Col,
  Input,
  Modal,
  Row,
  Skeleton,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  BarChartOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  LockOutlined,
  StopOutlined,
  TeamOutlined,
  UnlockOutlined,
  UserSwitchOutlined,
} from '@ant-design/icons';
import { getAdminOverview, getAdminUsers, setUserBan, setUserRole } from '../api/admin';
import { useAuthStore } from '../stores/authStore';
import type { AdminOverview, AdminUser } from '../types';

const roleLabels = {
  user: { color: 'default', text: '用户' },
  admin: { color: 'processing', text: '管理员' },
  super_admin: { color: 'success', text: '最高管理员' },
} as const;

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === 'object' && error !== null) {
    const maybeResponse = error as { response?: { data?: { detail?: string } }; message?: string };
    return maybeResponse.response?.data?.detail || maybeResponse.message || fallback;
  }
  return fallback;
}

export default function AdminPage() {
  const currentUser = useAuthStore((s) => s.user);
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [banUser, setBanUser] = useState<AdminUser | null>(null);
  const [banReason, setBanReason] = useState('');

  const isSuperAdmin = currentUser?.role === 'super_admin';
  const isAdmin = currentUser?.role === 'admin' || isSuperAdmin;

  if (!isAdmin) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <Typography.Title level={4}>无访问权限</Typography.Title>
        <Typography.Text type="secondary">此页面仅限管理员访问</Typography.Text>
      </div>
    );
  }

  const loadData = async () => {
    setLoading(true);
    try {
      const [overviewResp, usersResp] = await Promise.all([getAdminOverview(), getAdminUsers()]);
      if (overviewResp.code === 0) setOverview(overviewResp.data);
      if (usersResp.code === 0) setUsers(usersResp.data);
    } catch (err) {
      message.error(getErrorMessage(err, '管理员数据加载失败'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadData();
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const updateRole = async (record: AdminUser, role: 'user' | 'admin') => {
    setActionLoading(`role-${record.user_id}`);
    try {
      await setUserRole(record.user_id, role);
      message.success(role === 'admin' ? '已设为管理员' : '已取消管理员权限');
      await loadData();
    } catch (err) {
      message.error(getErrorMessage(err, '权限更新失败'));
    } finally {
      setActionLoading(null);
    }
  };

  const updateBan = async (record: AdminUser, isBanned: boolean, reason?: string) => {
    setActionLoading(`ban-${record.user_id}`);
    try {
      await setUserBan(record.user_id, isBanned, reason);
      message.success(isBanned ? '账号已封禁' : '账号已解封');
      setBanUser(null);
      setBanReason('');
      await loadData();
    } catch (err) {
      message.error(getErrorMessage(err, '账号状态更新失败'));
    } finally {
      setActionLoading(null);
    }
  };

  const columns: ColumnsType<AdminUser> = [
    {
      title: '账号',
      dataIndex: 'email',
      key: 'email',
      render: (_value, record) => (
        <Space direction="vertical" size={0}>
          <Typography.Text strong>{record.email || record.phone || '未绑定账号'}</Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {record.user_id.slice(0, 8)}...
          </Typography.Text>
        </Space>
      ),
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 110,
      render: (role: AdminUser['role']) => (
        <Tag color={roleLabels[role].color}>{roleLabels[role].text}</Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'is_banned',
      key: 'is_banned',
      width: 100,
      render: (isBanned: boolean) => (
        <Tag color={isBanned ? 'error' : 'success'}>{isBanned ? '已封禁' : '正常'}</Tag>
      ),
    },
    {
      title: '业务数据',
      key: 'data',
      render: (_value, record) => (
        <Space size={12} wrap>
          <Typography.Text type="secondary">上传 {record.total_uploads}</Typography.Text>
          <Typography.Text type="secondary">数据 {record.total_sales}</Typography.Text>
          <Typography.Text type="secondary">报告 {record.total_reports}</Typography.Text>
        </Space>
      ),
    },
    {
      title: 'Token',
      dataIndex: 'total_tokens',
      key: 'total_tokens',
      width: 120,
      render: (value: number) => value.toLocaleString(),
    },
    {
      title: '操作',
      key: 'actions',
      width: 260,
      render: (_value, record) => {
        const isSelf = record.user_id === currentUser?.user_id;
        const isProtected = record.role === 'super_admin';
        return (
          <Space wrap>
            {isSuperAdmin && record.role !== 'super_admin' && (
              <Button
                size="small"
                icon={<UserSwitchOutlined />}
                loading={actionLoading === `role-${record.user_id}`}
                onClick={() => updateRole(record, record.role === 'admin' ? 'user' : 'admin')}
              >
                {record.role === 'admin' ? '取消管理员' : '设为管理员'}
              </Button>
            )}
            <Button
              size="small"
              danger={!record.is_banned}
              icon={record.is_banned ? <UnlockOutlined /> : <StopOutlined />}
              disabled={isSelf || isProtected}
              loading={actionLoading === `ban-${record.user_id}`}
              onClick={() => {
                if (record.is_banned) {
                  updateBan(record, false);
                } else {
                  setBanUser(record);
                  setBanReason('');
                }
              }}
            >
              {record.is_banned ? '解封' : '封禁'}
            </Button>
          </Space>
        );
      },
    },
  ];

  if (loading && !overview) return <Skeleton active paragraph={{ rows: 6 }} />;

  return (
    <div>
      <div className="page-title">管理员系统</div>

      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={12} lg={6}>
          <Card>
            <Statistic title="账号数量" value={overview?.account_count || 0} prefix={<TeamOutlined />} />
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card>
            <Statistic title="消耗总 Token" value={overview?.total_tokens || 0} prefix={<BarChartOutlined />} />
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card>
            <Statistic title="销售数据" value={overview?.sales_count || 0} prefix={<DatabaseOutlined />} />
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card>
            <Statistic title="AI 报告" value={overview?.report_count || 0} prefix={<FileTextOutlined />} />
          </Card>
        </Col>
      </Row>

      <Card
        title="账号管理"
        extra={
          <Button icon={<LockOutlined />} onClick={loadData} loading={loading}>
            刷新
          </Button>
        }
      >
        <Table
          rowKey="user_id"
          columns={columns}
          dataSource={users}
          loading={loading}
          scroll={{ x: 920 }}
          pagination={{ pageSize: 10, showSizeChanger: false }}
        />
      </Card>

      <Modal
        title="封禁账号"
        open={!!banUser}
        okText="确认封禁"
        okButtonProps={{ danger: true, loading: banUser ? actionLoading === `ban-${banUser.user_id}` : false }}
        onOk={() => banUser && updateBan(banUser, true, banReason || '管理员封禁')}
        onCancel={() => {
          setBanUser(null);
          setBanReason('');
        }}
      >
        <Typography.Paragraph type="secondary">
          被封禁账号将无法继续访问用户系统和接口。
        </Typography.Paragraph>
        <Input.TextArea
          rows={3}
          value={banReason}
          onChange={(event) => setBanReason(event.target.value)}
          placeholder="封禁原因"
          maxLength={120}
          showCount
        />
      </Modal>
    </div>
  );
}
