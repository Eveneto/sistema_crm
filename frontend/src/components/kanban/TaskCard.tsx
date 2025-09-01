import React from 'react';
import { Card, Avatar, Tag, Tooltip, Typography } from 'antd';
import { 
  ClockCircleOutlined, 
  UserOutlined, 
  MessageOutlined, 
  PaperClipOutlined,
  FlagOutlined
} from '@ant-design/icons';
import { Task } from '../../services/kanbanApi';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const { Text, Paragraph } = Typography;

interface TaskCardProps {
  task: Task;
  onClick: (task: Task) => void;
}

const priorityColors = {
  low: 'green',
  medium: 'orange', 
  high: 'red',
  urgent: 'purple'
};

const priorityLabels = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta', 
  urgent: 'Urgente'
};

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isOverdue = task.due_date && new Date(task.due_date) < new Date();

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card
        size="small"
        hoverable
        onClick={() => onClick(task)}
        style={{ 
          marginBottom: 8,
          cursor: 'pointer',
          borderLeft: `4px solid ${priorityColors[task.priority]}`,
          ...(isOverdue && { borderColor: '#ff4d4f' })
        }}
        bodyStyle={{ padding: '12px' }}
      >
        {/* Header com prioridade */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <Tag 
            color={priorityColors[task.priority]} 
            icon={<FlagOutlined />}
          >
            {priorityLabels[task.priority]}
          </Tag>
          {task.assigned_to && (
            <Tooltip title={`${task.assigned_to.first_name} ${task.assigned_to.last_name}`}>
              <Avatar 
                size="small" 
                icon={<UserOutlined />}
                style={{ backgroundColor: '#87d068' }}
              >
                {task.assigned_to.first_name?.charAt(0) || task.assigned_to.email.charAt(0)}
              </Avatar>
            </Tooltip>
          )}
        </div>

        {/* Título */}
        <Text strong style={{ display: 'block', marginBottom: 4 }}>
          {task.title}
        </Text>

        {/* Descrição */}
        {task.description && (
          <Paragraph
            ellipsis={{ rows: 2 }}
            style={{ fontSize: '12px', color: '#666', margin: '4px 0' }}
          >
            {task.description}
          </Paragraph>
        )}

        {/* Labels */}
        {task.labels && task.labels.length > 0 && (
          <div style={{ marginBottom: 8 }}>
            {task.labels.map((label, index) => (
              <Tag key={index} style={{ fontSize: '10px' }}>
                {label}
              </Tag>
            ))}
          </div>
        )}

        {/* Footer com metadata */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          fontSize: '11px',
          color: '#999'
        }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {task.due_date && (
              <Tooltip title="Data de vencimento">
                <span style={{ color: isOverdue ? '#ff4d4f' : '#999' }}>
                  <ClockCircleOutlined /> {new Date(task.due_date).toLocaleDateString('pt-BR')}
                </span>
              </Tooltip>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: 8 }}>
            {task.comments_count > 0 && (
              <Tooltip title={`${task.comments_count} comentários`}>
                <span>
                  <MessageOutlined /> {task.comments_count}
                </span>
              </Tooltip>
            )}
            {task.attachments_count > 0 && (
              <Tooltip title={`${task.attachments_count} anexos`}>
                <span>
                  <PaperClipOutlined /> {task.attachments_count}
                </span>
              </Tooltip>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TaskCard;
