import React, { useEffect, useState } from 'react';
import {
  Card,
  Button,
  Select,
  Space,
  Typography,
  Modal,
  Form,
  Input,
  message,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import MainLayout from '../components/layout/MainLayout';
import PageHeader from '../components/layout/PageHeader';
import KanbanBoard from '../components/kanban/KanbanBoard';
import './kanban-responsive.css';
import TaskModal from '../components/kanban/TaskModal';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import {
  fetchBoards,
  fetchBoardById,
  createBoard,
  createColumn,
  updateColumn,
  createTask,
  updateTask,
  deleteColumn,
} from '../redux/slices/kanbanSlice';
import { Column, Task, CreateBoardData, CreateColumnData, CreateTaskData } from '../services/kanbanApi';

const { Text } = Typography;
const { Option } = Select;

const KanbanPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { boards, currentBoard, columns, loading } = useAppSelector(state => state.kanban);

  // Estados locais
  const [boardModalOpen, setBoardModalOpen] = useState(false);
  const [columnModalOpen, setColumnModalOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<Column | null>(null);
  const [currentColumnId, setCurrentColumnId] = useState<string>('');

  useEffect(() => {
    dispatch(fetchBoards());
  }, [dispatch]);

  const handleBoardChange = (boardId: string) => {
    if (boardId) {
      dispatch(fetchBoardById(boardId));
    }
  };

  const handleCreateBoard = async (values: CreateBoardData) => {
    try {
      await dispatch(createBoard(values)).unwrap();
      setBoardModalOpen(false);
      message.success('Board criado com sucesso!');
      dispatch(fetchBoards());
    } catch (error) {
      message.error('Erro ao criar board');
    }
  };

  const handleColumnSubmit = async (values: CreateColumnData) => {
    if (!currentBoard) return;

    try {
      if (selectedColumn) {
        await dispatch(updateColumn({ 
          boardId: currentBoard.id,
          columnId: selectedColumn.id, 
          data: values 
        })).unwrap();
        message.success('Coluna atualizada!');
      } else {
        await dispatch(createColumn({ 
          boardId: currentBoard.id,
          data: values
        })).unwrap();
        message.success('Coluna criada!');
      }
      setColumnModalOpen(false);
      setSelectedColumn(null);
      dispatch(fetchBoardById(currentBoard.id));
    } catch (error) {
      message.error('Erro ao salvar coluna');
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setTaskModalOpen(true);
  };

  const handleEditColumn = (column: Column) => {
    setSelectedColumn(column);
    setColumnModalOpen(true);
  };

  const handleDeleteColumn = async (columnId: string) => {
    if (!currentBoard) return;
    
    try {
      await dispatch(deleteColumn({ 
        boardId: currentBoard.id, 
        columnId 
      })).unwrap();
      message.success('Coluna excluída!');
      dispatch(fetchBoardById(currentBoard.id));
    } catch (error) {
      message.error('Erro ao excluir coluna');
    }
  };

  const handleCreateTask = (columnId: string) => {
    setCurrentColumnId(columnId);
    setSelectedTask(null);
    setTaskModalOpen(true);
  };

  const handleTaskSubmit = async (taskData: CreateTaskData) => {
    if (!currentBoard) return;

    try {
      if (selectedTask) {
        // Find which column the task belongs to
        const taskColumn = columns.find(col => 
          col.tasks.some(task => task.id === selectedTask.id)
        );
        
        if (!taskColumn) {
          message.error('Coluna da task não encontrada');
          return;
        }

        await dispatch(updateTask({
          boardId: currentBoard.id,
          columnId: taskColumn.id,
          taskId: selectedTask.id,
          data: taskData
        })).unwrap();
        message.success('Task atualizada!');
      } else {
        await dispatch(createTask({
          boardId: currentBoard.id,
          columnId: currentColumnId,
          data: taskData
        })).unwrap();
        message.success('Task criada!');
      }
      setTaskModalOpen(false);
      setSelectedTask(null);
      dispatch(fetchBoardById(currentBoard.id));
    } catch (error) {
      message.error('Erro ao salvar task');
    }
  };

  const getBoardStats = () => {
    const allTasks = columns.flatMap(column => column.tasks || []);
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(task => task && task.status === 'completed').length;
    const overdueTasks = allTasks.filter(task => 
      task && task.due_date && new Date(task.due_date) < new Date()
    ).length;

    return { totalTasks, completedTasks, overdueTasks };
  };

  const stats = getBoardStats();

  return (
    <MainLayout>
      <PageHeader
        title="Pipeline Kanban"
        subtitle="Gerencie seus projetos e tarefas visualmente"
        actions={[
          <Button 
            key="refresh"
            icon={<ReloadOutlined />} 
            onClick={() => currentBoard && dispatch(fetchBoardById(currentBoard.id))}
          >
            Atualizar
          </Button>,
          <Button 
            key="new-board"
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setBoardModalOpen(true)}
          >
            Novo Board
          </Button>
        ]}
      />

      {/* Board Selector */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col xs={24} sm={12} lg={8}>
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              <Text strong>Selecionar Board:</Text>
              <Select
                style={{ width: '100%' }}
                placeholder="Escolha um board"
                value={currentBoard?.id}
                onChange={handleBoardChange}
                allowClear
                loading={loading}
              >
                {(boards || []).map(board => (
                  <Option key={board.id} value={board.id}>
                    {board.name}
                  </Option>
                ))}
              </Select>
            </Space>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={() => setColumnModalOpen(true)}
              disabled={!currentBoard}
              style={{ width: '100%' }}
            >
              Nova Coluna
            </Button>
          </Col>
        </Row>

        {/* Stats */}
        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col xs={8}>
            <Statistic title="Total Tasks" value={stats.totalTasks} />
          </Col>
          <Col xs={8}>
            <Statistic
              title="Concluídas"
              value={stats.completedTasks}
              valueStyle={{ color: '#3f8600' }}
            />
          </Col>
          <Col xs={8}>
            <Statistic
              title="Atrasadas"
              value={stats.overdueTasks}
              valueStyle={{ color: '#cf1322' }}
            />
          </Col>
        </Row>
      </Card>

      {/* Kanban Board */}
      {currentBoard && (
        <Card>
          <KanbanBoard
            board={currentBoard}
            columns={columns}
            loading={loading}
            onTaskClick={handleTaskClick}
            onEditColumn={handleEditColumn}
            onDeleteColumn={handleDeleteColumn}
            onAddTask={handleCreateTask}
          />
        </Card>
      )}

      {/* Modals */}
      <Modal
        title="Criar Novo Board"
        open={boardModalOpen}
        onCancel={() => setBoardModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form onFinish={handleCreateBoard} layout="vertical">
          <Form.Item
            label="Nome do Board"
            name="title"
            rules={[{ required: true, message: 'Nome é obrigatório' }]}
          >
            <Input placeholder="Ex: Projeto de Website" />
          </Form.Item>
          <Form.Item label="Descrição" name="description">
            <Input.TextArea placeholder="Descrição do board..." />
          </Form.Item>
          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setBoardModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Criar Board
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      <Modal
        title={selectedColumn ? 'Editar Coluna' : 'Nova Coluna'}
        open={columnModalOpen}
        onCancel={() => {
          setColumnModalOpen(false);
          setSelectedColumn(null);
        }}
        footer={null}
        destroyOnClose
      >
        <Form
          onFinish={handleColumnSubmit}
          layout="vertical"
          initialValues={selectedColumn || {}}
        >
          <Form.Item
            label="Nome da Coluna"
            name="title"
            rules={[{ required: true, message: 'Nome é obrigatório' }]}
          >
            <Input placeholder="Ex: A Fazer" />
          </Form.Item>
          <Form.Item label="Ordem" name="order">
            <Input type="number" placeholder="1" />
          </Form.Item>
          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button
                onClick={() => {
                  setColumnModalOpen(false);
                  setSelectedColumn(null);
                }}
              >
                Cancelar
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {selectedColumn ? 'Atualizar' : 'Criar'} Coluna
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      <TaskModal
        open={taskModalOpen}
        task={selectedTask}
        onCancel={() => setTaskModalOpen(false)}
        onSubmit={handleTaskSubmit}
        loading={loading}
      />
    </MainLayout>
  );
};

export default KanbanPage;
