import React from 'react';
import { Modal, Switch, Radio, Space, Typography, Alert, Button } from 'antd';
import { BellOutlined, BellFilled } from '@ant-design/icons';
import { useNotifications } from '../../hooks/useNotifications';
import { NotificationPermission } from '../../services/notificationService';

const { Text, Title } = Typography;

interface NotificationSettingsModalProps {
  open: boolean;
  onClose: () => void;
}

const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({ open, onClose }) => {
  const {
    permission,
    settings,
    isSupported,
    requestPermission,
    updateSettings,
  } = useNotifications();

  const handleEnableToggle = (enabled: boolean) => {
    if (enabled && permission !== 'granted') {
      // Solicitar permissão se estiver ativando
      requestPermission().then((perm: NotificationPermission) => {
        if (perm === 'granted') {
          updateSettings({ enabled: true });
        }
      });
    } else {
      updateSettings({ enabled });
    }
  };

  const handleNotificationTypeChange = (e: any) => {
    const value = e.target.value;
    if (value === 'all') {
      updateSettings({
        notifyAllMessages: true,
        notifyMentionsOnly: false,
      });
    } else {
      updateSettings({
        notifyAllMessages: false,
        notifyMentionsOnly: true,
      });
    }
  };

  if (!isSupported) {
    return (
      <Modal
        title="Configurações de Notificações"
        open={open}
        onCancel={onClose}
        footer={[
          <Button key="close" type="primary" onClick={onClose}>
            Fechar
          </Button>,
        ]}
      >
        <Alert
          message="Notificações não suportadas"
          description="Seu navegador não suporta notificações desktop. Tente usar um navegador moderno como Chrome, Firefox ou Edge."
          type="warning"
          showIcon
        />
      </Modal>
    );
  }

  return (
    <Modal
      title={
        <Space>
          <BellOutlined />
          <span>Configurações de Notificações</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="close" type="primary" onClick={onClose}>
          Salvar e Fechar
        </Button>,
      ]}
      width={500}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Status de permissão */}
        {permission === 'denied' && (
          <Alert
            message="Permissão Negada"
            description="Você bloqueou as notificações. Para ativá-las, vá nas configurações do navegador e permita notificações para este site."
            type="error"
            showIcon
          />
        )}
        
        {permission === 'default' && (
          <Alert
            message="Permissão Necessária"
            description="Clique no botão abaixo para permitir notificações."
            type="info"
            showIcon
            action={
              <Button size="small" type="primary" onClick={requestPermission}>
                Permitir Notificações
              </Button>
            }
          />
        )}
        
        {permission === 'granted' && (
          <Alert
            message="Notificações Ativadas"
            description="Você receberá notificações de novas mensagens."
            type="success"
            showIcon
            icon={<BellFilled />}
          />
        )}

        {/* Toggle principal */}
        <div style={{ 
          padding: '16px', 
          background: '#f5f5f5', 
          borderRadius: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <Title level={5} style={{ margin: 0 }}>
              Ativar Notificações
            </Title>
            <Text type="secondary" style={{ fontSize: '13px' }}>
              Receber notificações desktop
            </Text>
          </div>
          <Switch
            checked={settings.enabled && permission === 'granted'}
            onChange={handleEnableToggle}
            disabled={permission === 'denied'}
          />
        </div>

        {/* Tipo de notificações */}
        {settings.enabled && permission === 'granted' && (
          <div style={{ padding: '16px', background: '#f5f5f5', borderRadius: '8px' }}>
            <Title level={5}>Notificar para:</Title>
            <Radio.Group
              value={settings.notifyMentionsOnly ? 'mentions' : 'all'}
              onChange={handleNotificationTypeChange}
            >
              <Space direction="vertical">
                <Radio value="all">
                  <div>
                    <div>Todas as mensagens</div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Notificar para qualquer mensagem em salas ativas
                    </Text>
                  </div>
                </Radio>
                <Radio value="mentions">
                  <div>
                    <div>Apenas menções</div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Notificar apenas quando você for mencionado (@seu_nome)
                    </Text>
                  </div>
                </Radio>
              </Space>
            </Radio.Group>
          </div>
        )}

        {/* Som */}
        {settings.enabled && permission === 'granted' && (
          <div style={{ 
            padding: '16px', 
            background: '#f5f5f5', 
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <Title level={5} style={{ margin: 0 }}>
                Som de Notificação
              </Title>
              <Text type="secondary" style={{ fontSize: '13px' }}>
                Tocar som ao receber notificação
              </Text>
            </div>
            <Switch
              checked={settings.playSound}
              onChange={(playSound) => updateSettings({ playSound })}
            />
          </div>
        )}

        {/* Informação adicional */}
        <Alert
          message="Dica"
          description="As notificações só aparecem quando você não está visualizando a aba do chat."
          type="info"
          showIcon
        />
      </Space>
    </Modal>
  );
};

export default NotificationSettingsModal;
