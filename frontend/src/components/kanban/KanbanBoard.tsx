import React from 'react';
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { Card, Empty, Spin } from 'antd';
import { Board, Column, Task } from '../../services/kanbanApi';
import KanbanColumn from './KanbanColumn';
import { useAppDispatch } from '../../hooks/redux';
import { moveTaskLocal } from '../../redux/slices/kanbanSlice';

interface KanbanBoardProps {
  board: Board | null;
  columns: Column[];
  loading: boolean;
  onAddTask: (columnId: string) => void;
  onEditColumn: (column: Column) => void;
  onDeleteColumn: (columnId: string) => void;
  onTaskClick: (task: Task) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  board,
  columns,
  loading,
  onAddTask,
  onEditColumn,
  onDeleteColumn,
  onTaskClick,
}) => {
  const dispatch = useAppDispatch();
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!board) {
    return (
      <Card>
        <Empty
          description="Nenhum board selecionado"
          image="/api/placeholder/400/200"
        />
      </Card>
    );
  }

  if (!columns || columns.length === 0) {
    return (
      <Card>
        <Empty
          description="Este board não possui colunas ainda"
          image="/api/placeholder/400/200"
        />
      </Card>
    );
  }

  const handleDragStart = (event: DragStartEvent) => {
    // Pode ser usado para feedback visual
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Para drag entre colunas em tempo real
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Encontrar a task sendo movida
    const activeTask = columns
      .flatMap(col => col.tasks)
      .find(task => task.id === activeId);

    if (!activeTask) return;

    // Encontrar coluna de origem
    const sourceColumn = columns.find(col => 
      col.tasks.some(task => task.id === activeId)
    );

    // Determinar coluna de destino
    let targetColumn = columns.find(col => col.id === overId);
    
    // Se overId é uma task, encontrar sua coluna
    if (!targetColumn) {
      targetColumn = columns.find(col => 
        col.tasks.some(task => task.id === overId)
      );
    }

    if (!sourceColumn || !targetColumn) return;

    // Se é a mesma coluna, reordenar
    if (sourceColumn.id === targetColumn.id) {
      const taskIds = sourceColumn.tasks.map(task => task.id);
      const oldIndex = taskIds.indexOf(activeId);
      const newIndex = taskIds.indexOf(overId);
      
      if (oldIndex !== newIndex) {
        const newOrder = arrayMove(taskIds, oldIndex, newIndex);
        // Aqui você poderia disparar uma ação para reordenar as tasks na mesma coluna
        console.log('Reordenar na mesma coluna:', newOrder);
      }
    } else {
      // Mover entre colunas
      const newPosition = targetColumn.tasks.length;
      
      dispatch(moveTaskLocal({
        taskId: activeId,
        sourceColumnId: sourceColumn.id,
        targetColumnId: targetColumn.id,
        position: newPosition
      }));

      // Aqui você deveria fazer a chamada para a API para persistir a mudança
      // moveTaskToColumn(activeId, targetColumn.id, newPosition);
    }
  };

  const columnIds = columns.map(col => col.id);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div style={{ 
        display: 'flex', 
        overflowX: 'auto', 
        paddingBottom: 16,
        minHeight: 'calc(100vh - 200px)'
      }}>
        <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              onAddTask={onAddTask}
              onEditColumn={onEditColumn}
              onDeleteColumn={onDeleteColumn}
              onTaskClick={onTaskClick}
            />
          ))}
        </SortableContext>
      </div>
    </DndContext>
  );
};

export default KanbanBoard;
