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
import KanbanBoard from '../components/kanban/KanbanBoard';
import TaskModal from '../components/kanban/TaskModal';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import {
  fetchBoards,
  fetchBoardById,
  createBoard,
  createColumn,
  createTask,
  updateTask,
  deleteColumn,
} from '../redux/slices/kanbanSlice';
import { Column, Task, CreateBoardData, CreateColumnData, CreateTaskData } from '../services/kanbanApi';

const { Title, Text } = Typography;
const { Option } = Select;

const KanbanPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { boards, currentBoard, columns, loading } = useAppSelector(state => state.kanban);

  // Estados locais
  const [boardModalOpen, setBoardModalOpen] = useState(false);
  const [columnModalOpen, setColumnModalOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [currentColumnId, setCurrentColumnId] = useState<string>('');

  // Forms
  const [boardForm] = Form.useForm();
  const [columnForm] = Form.useForm();

  useEffect(() => {
    dispatch(fetchBoards());
  }, [dispatch]);

  useEffect(() => {
    if ((boards || []).length > 0 && !currentBoard) {
      dispatch(fetchBoardById(boards[0].id));
    }
  }, [boards, currentBoard, dispatch]);

  // Handlers
  const handleBoardChange = (boardId: string) => {
    dispatch(fetchBoardById(boardId));
  };

  const handleCreateBoard = async (values: CreateBoardData) => {
    try {
      await dispatch(createBoard(values)).unwrap();
      message.success('Board criado com sucesso!');
      setBoardModalOpen(false);
      boardForm.resetFields();
      dispatch(fetchBoards());
    } catch (error) {
      message.error('Erro ao criar board');
      console.error(error);
    }
  };

  const handleCreateColumn = async (values: CreateColumnData) => {
    if (!currentBoard) return;
    
    try {
      await dispatch(createColumn({ 
        boardId: currentBoard.id, 
        data: values 
      })).unwrap();
      message.success('Coluna criada com sucesso!');
      setColumnModalOpen(false);
      columnForm.resetFields();
      // Recarregar o board atual
      dispatch(fetchBoardById(currentBoard.id));
    } catch (error) {
      message.error('Erro ao criar coluna');
      console.error(error);
    }
  };

  const handleAddTask = (columnId: string) => {
    setCurrentColumnId(columnId);
    setSelectedTask(null);
    setTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setTaskModalOpen(true);
  };

  const handleTaskSubmit = async (data: CreateTaskData) => {
    if (!currentBoard) return;
    
    try {
      if (selectedTask) {
        // Editar task - precisa encontrar columnId da task
        const column = columns.find(col => col.tasks.some(task => task.id === selectedTask.id));
        if (!column) throw new Error('Column not found for task');
        
        await dispatch(updateTask({ 
          boardId: currentBoard.id,
          columnId: column.id,
          taskId: selectedTask.id, 
          data 
        })).unwrap();
        message.success('Task atualizada com sucesso!');
      } else {
        // Criar nova task
        await dispatch(createTask({ 
          boardId: currentBoard.id,
          columnId: currentColumnId, 
          data 
        })).unwrap();
        message.success('Task criada com sucesso!');
      }
      setTaskModalOpen(false);
      setSelectedTask(null);
      setCurrentColumnId('');
      
      // Recarregar board para mostrar mudanças
      dispatch(fetchBoardById(currentBoard.id));
    } catch (error) {
      message.error(selectedTask ? 'Erro ao atualizar task' : 'Erro ao criar task');
      console.error(error);
    }
  };

  const handleEditColumn = (column: Column) => {
    // Implementar edição de coluna
    console.log('Edit column:', column);
  };

  const handleDeleteColumn = async (columnId: string) => {
    if (!currentBoard) return;
    
    try {
      await dispatch(deleteColumn({ 
        boardId: currentBoard.id, 
        columnId 
      })).unwrap();
      message.success('Coluna excluída com sucesso!');
      if (currentBoard) {
        dispatch(fetchBoardById(currentBoard.id));
      }
    } catch (error) {
      message.error('Erro ao excluir coluna');
      console.error(error);
    }
  };

  // Estatísticas do board atual
  const getBoardStats = () => {
    if (!columns) return { totalTasks: 0, completedTasks: 0, overdueTasks: 0 };

    const allTasks = columns.flatMap(col => col.tasks);
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(task => task.status === 'completed').length;
    const overdueTasks = allTasks.filter(task => 
      task.due_date && new Date(task.due_date) < new Date()
    ).length;

    return { totalTasks, completedTasks, overdueTasks };
  };

  const stats = getBoardStats();

  return (
    <MainLayout>
      <div style={{ padding: '24px' }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Title level={2} style={{ margin: 0 }}>
              📋 Pipeline Kanban
            </Title>
            <Space>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={() => currentBoard && dispatch(fetchBoardById(currentBoard.id))}
              >
                Atualizar
              </Button>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => setBoardModalOpen(true)}
              >
                Novo Board
              </Button>
            </Space>
          </div>

          {/* Seletor de Board e Estatísticas */}
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={12}>
              <Card size="small">
                <Space>
                  <Text>Board atual:</Text>
                  <Select
                    value={currentBoard?.id}
                    onChange={handleBoardChange}
                    style={{ minWidth: 200 }}
                    loading={loading}
                    placeholder="Selecione um board"
                  >
                    {(boards || []).map(board => (
                      <Option key={board.id} value={board.id}>
                        {board.name}
                      </Option>
                    ))}
                  </Select>
                  <Button 
                    type="dashed" 
                    icon={<PlusOutlined />}
                    onClick={() => setColumnModalOpen(true)}
                    disabled={!currentBoard}
                  >
                    Nova Coluna
                  </Button>
                </Space>
              </Card>
            </Col>
            <Col span={12}>
              <Card size="small">
                <Row gutter={16}>
                  <Col span={8}>
                    <Statistic title="Total Tasks" value={stats.totalTasks} />
                  </Col>
                  <Col span={8}>
                    <Statistic 
                      title="Concluídas" 
                      value={stats.completedTasks} 
                      valueStyle={{ color: '#3f8600' }}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic 
                      title="Atrasadas" 
                      value={stats.overdueTasks}
                      valueStyle={{ color: '#cf1322' }}
                    />
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </div>

        {/* Board atual */}
        {currentBoard && (
          <Card 
            title={
              <Space>
                <Title level={4} style={{ margin: 0 }}>{currentBoard.name}</Title>
                {currentBoard.description && (
                  <Text type="secondary">- {currentBoard.description}</Text>
                )}
              </Space>
            }
            style={{ marginBottom: 16 }}
            size="small"
          />
        )}

        {/* Kanban Board */}
        <KanbanBoard
          board={currentBoard}
          columns={columns}
          loading={loading}
          onAddTask={handleAddTask}
          onEditColumn={handleEditColumn}
          onDeleteColumn={handleDeleteColumn}
          onTaskClick={handleEditTask}
        />

        {/* Modals */}
        <Modal
          title="Criar Novo Board"
          open={boardModalOpen}
          onCancel={() => setBoardModalOpen(false)}
          footer={null}
          destroyOnClose
        >
          <Form form={boardForm} onFinish={handleCreateBoard} layout="vertical">
            <Form.Item
              name="name"
              label="Nome do Board"
              rules={[{ required: true, message: 'Nome é obrigatório' }]}
            >
              <Input placeholder="Digite o nome do board" />
            </Form.Item>
            <Form.Item name="description" label="Descrição">
              <Input.TextArea rows={3} placeholder="Descrição opcional" />
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
          title="Criar Nova Coluna"
          open={columnModalOpen}
          onCancel={() => setColumnModalOpen(false)}
          footer={null}
          destroyOnClose
        >
          <Form form={columnForm} onFinish={handleCreateColumn} layout="vertical">
            <Form.Item
              name="name"
              label="Nome da Coluna"
              rules={[{ required: true, message: 'Nome é obrigatório' }]}
            >
              <Input placeholder="Ex: A Fazer, Em Progresso, Concluído" />
            </Form.Item>
            <Form.Item
              name="color"
              label="Cor"
              initialValue="#1890ff"
            >
              <Input type="color" />
            </Form.Item>
            <Form.Item name="max_tasks" label="Limite de Tasks (opcional)">
              <Input type="number" placeholder="Ex: 5" />
            </Form.Item>
            <div style={{ textAlign: 'right' }}>
              <Space>
                <Button onClick={() => setColumnModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Criar Coluna
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
      </div>
    </MainLayout>
  );
};

export default KanbanPage;
