import React from 'react';
import { Card, Button, Badge, Dropdown, Typography, Space } from 'antd';
import { PlusOutlined, MoreOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Column, Task } from '../../services/kanbanApi';
import TaskCard from './TaskCard';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

const { Title, Text } = Typography;

interface KanbanColumnProps {
  column: Column;
  onAddTask: (columnId: string) => void;
  onEditColumn: (column: Column) => void;
  onDeleteColumn: (columnId: string) => void;
  onTaskClick: (task: Task) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  column,
  onAddTask,
  onEditColumn,
  onDeleteColumn,
  onTaskClick,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const menuItems = [
    {
      key: 'edit',
      label: 'Editar Coluna',
      icon: <EditOutlined />,
      onClick: () => onEditColumn(column),
    },
    {
      key: 'delete',
      label: 'Excluir Coluna',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => onDeleteColumn(column.id),
    },
  ];

  const taskIds = column.tasks.map(task => task.id);

  return (
    <div
      className="kanban-column-responsive"
      style={{
        minWidth: 300,
        maxWidth: 340,
        flex: '0 0 auto',
        marginRight: 0,
        width: '100%',
      }}
    >
      <Card
        size="small"
        style={{
          height: '100%',
          backgroundColor: isOver ? '#f0f0f0' : '#fafafa',
          border: isOver ? '2px dashed #1890ff' : '1px solid #d9d9d9',
        }}
        bodyStyle={{ padding: '12px' }}
      >
        {/* Header da Coluna */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 16
        }}>
          <Space>
            <div 
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: column.color
              }}
            />
            <Title level={5} style={{ margin: 0 }}>
              {column.name}
            </Title>
            <Badge count={column.task_count} showZero />
          </Space>
          
          <Dropdown menu={{ items: menuItems }} trigger={['click']}>
            <Button type="text" icon={<MoreOutlined />} size="small" />
          </Dropdown>
        </div>

        {/* Limite de tasks */}
        {column.max_tasks && (
          <div style={{ marginBottom: 12 }}>
            <Text type="secondary" style={{ fontSize: '11px' }}>
              Limite: {column.task_count}/{column.max_tasks}
              {column.task_count >= column.max_tasks && (
                <Text type="warning"> (Limite atingido)</Text>
              )}
            </Text>
          </div>
        )}

        {/* Área das Tasks */}
        <div
          ref={setNodeRef}
          style={{
            minHeight: 400,
            maxHeight: 600,
            overflowY: 'auto',
            padding: '8px 0'
          }}
        >
          <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
            {column.tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={onTaskClick}
              />
            ))}
          </SortableContext>
        </div>

        {/* Botão Adicionar Task */}
        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={() => onAddTask(column.id)}
          style={{ width: '100%', marginTop: 8 }}
          disabled={column.max_tasks ? column.task_count >= column.max_tasks : false}
        >
          Adicionar Task
        </Button>
      </Card>
    </div>
  );
};

export default KanbanColumn;
