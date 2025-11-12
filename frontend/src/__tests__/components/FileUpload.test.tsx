/**
 * Testes unitários para File Upload Feature
 * Cobre: botão anexar, preview, validações, múltiplos arquivos, envio
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import '@testing-library/jest-dom';

import MessageInput from '../../components/chat/MessageInput';
import ChatMessage from '../../components/chat/ChatMessage';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

// Mock do Ant Design message
jest.mock('antd', () => ({
  ...jest.requireActual('antd'),
  message: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
  },
}));

describe('File Upload Feature', () => {
  const mockOnSendMessage = jest.fn();
  const mockOnTyping = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock FileReader
    global.FileReader = class {
      result: string | ArrayBuffer | null = null;
      onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
      
      readAsDataURL(file: Blob) {
        this.result = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUg`;
        if (this.onload) {
          this.onload({} as ProgressEvent<FileReader>);
        }
      }
    } as any;
  });

  const createMockFile = (
    name: string,
    size: number,
    type: string
  ): File => {
    const blob = new Blob(['file content'], { type });
    return new File([blob], name, { type });
  };

  describe('Botão Anexar', () => {
    it('should render attach button', () => {
      render(
        <MessageInput
          onSendMessage={mockOnSendMessage}
          onTyping={mockOnTyping}
        />
      );

      // Procurar por botão com ícone de clipe (📎)
      const attachButton = screen.getByRole('button', { name: /anexar|attach|paperclip/i });
      expect(attachButton).toBeInTheDocument();
    });

    it('should have file input element', () => {
      const { container } = render(
        <MessageInput
          onSendMessage={mockOnSendMessage}
          onTyping={mockOnTyping}
        />
      );

      const fileInput = container.querySelector('input[type="file"]');
      expect(fileInput).toBeInTheDocument();
    });

    it('should open file picker on button click', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <MessageInput
          onSendMessage={mockOnSendMessage}
          onTyping={mockOnTyping}
        />
      );

      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
      const clickSpy = jest.spyOn(fileInput, 'click');

      const attachButton = screen.getByRole('button', { name: /anexar|attach|paperclip/i });
      await user.click(attachButton);

      expect(clickSpy).toHaveBeenCalled();
    });
  });

  describe('Seleção de Arquivos', () => {
    it('should allow selecting single file', async () => {
      const { container } = render(
        <MessageInput
          onSendMessage={mockOnSendMessage}
          onTyping={mockOnTyping}
        />
      );

      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
      const file = createMockFile('test.pdf', 1024 * 100, 'application/pdf'); // 100KB

      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        // Verificar se o arquivo foi adicionado
        expect(screen.getByText('test.pdf')).toBeInTheDocument();
      });
    });

    it('should allow selecting multiple files', async () => {
      const { container } = render(
        <MessageInput
          onSendMessage={mockOnSendMessage}
          onTyping={mockOnTyping}
        />
      );

      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
      const files = [
        createMockFile('file1.pdf', 1024 * 100, 'application/pdf'),
        createMockFile('file2.jpg', 1024 * 200, 'image/jpeg'),
        createMockFile('file3.txt', 1024 * 50, 'text/plain'),
      ];

      fireEvent.change(fileInput, { target: { files } });

      await waitFor(() => {
        expect(screen.getByText('file1.pdf')).toBeInTheDocument();
        expect(screen.getByText('file2.jpg')).toBeInTheDocument();
        expect(screen.getByText('file3.txt')).toBeInTheDocument();
      });
    });
  });

  describe('Preview Visual', () => {
    it('should show file preview after selection', async () => {
      const { container } = render(
        <MessageInput
          onSendMessage={mockOnSendMessage}
          onTyping={mockOnTyping}
        />
      );

      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
      const file = createMockFile('image.png', 1024 * 500, 'image/png');

      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        // Preview deve estar visível
        expect(screen.getByText('image.png')).toBeInTheDocument();
      });
    });

    it('should display file name and size', async () => {
      const { container } = render(
        <MessageInput
          onSendMessage={mockOnSendMessage}
          onTyping={mockOnTyping}
        />
      );

      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
      const file = createMockFile('document.pdf', 1024 * 1024 * 2, 'application/pdf'); // 2MB

      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByText('document.pdf')).toBeInTheDocument();
        expect(screen.getByText(/2(\.\d+)?\s*MB/i)).toBeInTheDocument();
      });
    });

    it('should show file icon based on type', async () => {
      const { container } = render(
        <MessageInput
          onSendMessage={mockOnSendMessage}
          onTyping={mockOnTyping}
        />
      );

      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
      const pdfFile = createMockFile('doc.pdf', 1024 * 100, 'application/pdf');

      fireEvent.change(fileInput, { target: { files: [pdfFile] } });

      await waitFor(() => {
        // Ícone de PDF ou clipe deve estar presente
        const icon = container.querySelector('.anticon-file-pdf, .anticon-paper-clip');
        expect(icon).toBeInTheDocument();
      });
    });
  });

  describe('Validações', () => {
    it('should reject files larger than 10MB', async () => {
      const { container } = render(
        <MessageInput
          onSendMessage={mockOnSendMessage}
          onTyping={mockOnTyping}
        />
      );

      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
      const largeFile = createMockFile(
        'large.pdf',
        1024 * 1024 * 15, // 15MB
        'application/pdf'
      );

      fireEvent.change(fileInput, { target: { files: [largeFile] } });

      await waitFor(() => {
        // Mensagem de erro deve aparecer
        expect(screen.getByText(/tamanho máximo|10\s*mb/i)).toBeInTheDocument();
      });
    });

    it('should reject invalid file types', async () => {
      const { container } = render(
        <MessageInput
          onSendMessage={mockOnSendMessage}
          onTyping={mockOnTyping}
        />
      );

      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
      const invalidFile = createMockFile('script.exe', 1024 * 100, 'application/x-msdownload');

      fireEvent.change(fileInput, { target: { files: [invalidFile] } });

      await waitFor(() => {
        // Mensagem de erro de tipo inválido
        expect(screen.getByText(/tipo de arquivo não permitido|inválido/i)).toBeInTheDocument();
      });
    });

    it('should show error message for invalid files', async () => {
      const { message } = require('antd');
      const { container } = render(
        <MessageInput
          onSendMessage={mockOnSendMessage}
          onTyping={mockOnTyping}
        />
      );

      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
      const largeFile = createMockFile('large.zip', 1024 * 1024 * 20, 'application/zip');

      fireEvent.change(fileInput, { target: { files: [largeFile] } });

      await waitFor(() => {
        expect(message.error).toHaveBeenCalled();
      });
    });
  });

  describe('Remoção de Arquivos', () => {
    it('should allow removing file from preview', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <MessageInput
          onSendMessage={mockOnSendMessage}
          onTyping={mockOnTyping}
        />
      );

      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
      const file = createMockFile('removeme.pdf', 1024 * 100, 'application/pdf');

      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByText('removeme.pdf')).toBeInTheDocument();
      });

      // Encontrar e clicar no botão de remover (X)
      const removeButton = screen.getByRole('button', { name: /close|remove|delete/i });
      await user.click(removeButton);

      await waitFor(() => {
        expect(screen.queryByText('removeme.pdf')).not.toBeInTheDocument();
      });
    });

    it('should remove correct file when multiple files', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <MessageInput
          onSendMessage={mockOnSendMessage}
          onTyping={mockOnTyping}
        />
      );

      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
      const files = [
        createMockFile('file1.pdf', 1024 * 100, 'application/pdf'),
        createMockFile('file2.jpg', 1024 * 200, 'image/jpeg'),
      ];

      fireEvent.change(fileInput, { target: { files } });

      await waitFor(() => {
        expect(screen.getByText('file1.pdf')).toBeInTheDocument();
        expect(screen.getByText('file2.jpg')).toBeInTheDocument();
      });

      // Remover o primeiro arquivo
      const removeButtons = screen.getAllByRole('button', { name: /close|remove/i });
      await user.click(removeButtons[0]);

      await waitFor(() => {
        expect(screen.queryByText('file1.pdf')).not.toBeInTheDocument();
        expect(screen.getByText('file2.jpg')).toBeInTheDocument();
      });
    });
  });

  describe('Envio de Mensagens com Anexos', () => {
    it('should send message with attachments', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <MessageInput
          onSendMessage={mockOnSendMessage}
          onTyping={mockOnTyping}
        />
      );

      // Adicionar arquivo
      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
      const file = createMockFile('attachment.pdf', 1024 * 100, 'application/pdf');
      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByText('attachment.pdf')).toBeInTheDocument();
      });

      // Enviar mensagem
      const sendButton = screen.getByRole('button', { name: /send|enviar/i });
      await user.click(sendButton);

      await waitFor(() => {
        expect(mockOnSendMessage).toHaveBeenCalledWith(
          expect.anything(),
          'file',
          expect.arrayContaining([expect.objectContaining({ name: 'attachment.pdf' })])
        );
      });
    });

    it('should send message with text and attachments', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <MessageInput
          onSendMessage={mockOnSendMessage}
          onTyping={mockOnTyping}
        />
      );

      // Digitar texto
      const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
      await user.type(textarea, 'Check this file');

      // Adicionar arquivo
      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
      const file = createMockFile('doc.pdf', 1024 * 100, 'application/pdf');
      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByText('doc.pdf')).toBeInTheDocument();
      });

      // Enviar
      const sendButton = screen.getByRole('button', { name: /send|enviar/i });
      await user.click(sendButton);

      await waitFor(() => {
        expect(mockOnSendMessage).toHaveBeenCalledWith(
          'Check this file',
          'file',
          expect.any(Array)
        );
      });
    });

    it('should clear attachments after sending', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <MessageInput
          onSendMessage={mockOnSendMessage}
          onTyping={mockOnTyping}
        />
      );

      // Adicionar arquivo
      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
      const file = createMockFile('temp.pdf', 1024 * 100, 'application/pdf');
      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByText('temp.pdf')).toBeInTheDocument();
      });

      // Enviar
      const sendButton = screen.getByRole('button', { name: /send|enviar/i });
      await user.click(sendButton);

      await waitFor(() => {
        expect(screen.queryByText('temp.pdf')).not.toBeInTheDocument();
      });
    });
  });

  describe('Renderização de Anexos Recebidos', () => {
    const mockMessageWithAttachments = {
      id: '1',
      content: 'Mensagem com anexo',
      sender: {
        id: 1,
        username: 'user1',
        full_name: 'User One',
        first_name: 'User',
        last_name: 'One',
      },
      created_at: '2025-01-01T10:00:00Z',
      message_type: 'file' as const,
      attachments: [
        {
          id: 'att1',
          file: '/media/attachments/doc.pdf',
          file_name: 'document.pdf',
          file_size: 1024 * 1024 * 2, // 2MB
          file_type: 'application/pdf',
          uploaded_at: '2025-01-01T10:00:00Z',
        },
      ],
      is_edited: false,
      is_deleted: false,
      is_read: false,
      can_edit: false,
      can_delete: false,
    };

    it('should render attachment in message', () => {
      render(
        <ChatMessage
          message={mockMessageWithAttachments}
          isOwn={false}
          showAvatar={true}
          onReply={jest.fn()}
          onMarkAsRead={jest.fn()}
        />
      );

      expect(screen.getByText('document.pdf')).toBeInTheDocument();
    });

    it('should display attachment file name', () => {
      render(
        <ChatMessage
          message={mockMessageWithAttachments}
          isOwn={false}
          showAvatar={true}
          onReply={jest.fn()}
          onMarkAsRead={jest.fn()}
        />
      );

      expect(screen.getByText('document.pdf')).toBeInTheDocument();
    });

    it('should display attachment file size', () => {
      render(
        <ChatMessage
          message={mockMessageWithAttachments}
          isOwn={false}
          showAvatar={true}
          onReply={jest.fn()}
          onMarkAsRead={jest.fn()}
        />
      );

      expect(screen.getByText(/2(\.\d+)?\s*MB/i)).toBeInTheDocument();
    });

    it('should have download link for attachment', () => {
      const { container } = render(
        <ChatMessage
          message={mockMessageWithAttachments}
          isOwn={false}
          showAvatar={true}
          onReply={jest.fn()}
          onMarkAsRead={jest.fn()}
        />
      );

      const downloadLink = container.querySelector('a[href*="/media/attachments"]');
      expect(downloadLink).toBeInTheDocument();
    });

    it('should show attachment icon', () => {
      const { container } = render(
        <ChatMessage
          message={mockMessageWithAttachments}
          isOwn={false}
          showAvatar={true}
          onReply={jest.fn()}
          onMarkAsRead={jest.fn()}
        />
      );

      // Ícone de clipe ou arquivo
      const icon = container.querySelector('.anticon-paper-clip, .anticon-file');
      expect(icon).toBeInTheDocument();
    });
  });
});
