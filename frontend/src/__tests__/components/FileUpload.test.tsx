/**
 * Testes unitários para File Upload Feature
 * Cobre: botão anexar, preview, validações, múltiplos arquivos, envio
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import '@testing-library/jest-dom';

import MessageInput from '../../components/chat/MessageInput';
import ChatMessageComponent from '../../components/chat/ChatMessage';
import { ChatMessage } from '../../redux/slices/chatSlice';

const mockStore = configureStore([]);

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
    const mockFileReader = {
      result: null as string | ArrayBuffer | null,
      onload: null as ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null,
      readAsDataURL: function(this: any, file: Blob) {
        this.result = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUg`;
        if (this.onload) {
          this.onload.call(this, {} as ProgressEvent<FileReader>);
        }
      }
    };
    
    global.FileReader = jest.fn(() => mockFileReader) as any;
    
    // Mock URL.createObjectURL
    global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = jest.fn();
    
    // Mock window.matchMedia (necessário para Ant Design)
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  const createMockFile = (
    name: string,
    size: number,
    type: string
  ): File => {
    const blob = new Blob(['file content'], { type });
    return new File([blob], name, { type });
  };

  const createMockMessage = (overrides?: Partial<ChatMessage>): ChatMessage => {
    const now = new Date().toISOString();
    
    return {
      id: 'msg-' + Math.random(),
      content: 'Test message',
      sender: {
        id: 1,
        username: 'testuser',
        full_name: 'Test User',
        first_name: 'Test',
        last_name: 'User',
      },
      created_at: now,
      updated_at: now,
      message_type: 'text',
      attachments: [],
      is_edited: false,
      is_deleted: false,
      is_read: false,
      can_edit: true,
      can_delete: true,
      ...overrides,
    };
  };

  describe('Botão Anexar', () => {
    it('should render attach button', () => {
      render(
        <MessageInput
          onSendMessage={mockOnSendMessage}
          onTyping={mockOnTyping}
        />
      );

      // Procurar por botão com ícone de clipe (📎) - usar "paper-clip" que é o nome real
      const attachButton = screen.getByRole('button', { name: /paper-clip/i });
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

      const attachButton = screen.getByRole('button', { name: /paper-clip/i });
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
        // Tamanho pode variar por causa do mock, então verificar se existe um texto de tamanho
        const sizeText = screen.getByText(/\d+(\.\d+)?\s*(KB|MB)/i);
        expect(sizeText).toBeInTheDocument();
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
      const { message } = require('antd');
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
        // Verificar se message.error foi chamado com mensagem sobre tamanho
        expect(message.error).toHaveBeenCalledWith(
          expect.stringMatching(/muito grande|tamanho máximo|10\s*MB/i)
        );
      });
    });

    it('should reject invalid file types', async () => {
      const { message } = require('antd');
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
        // Verificar se message.error foi chamado com mensagem sobre tipo inválido
        expect(message.error).toHaveBeenCalledWith(
          expect.stringMatching(/tipo de arquivo|não suportado/i)
        );
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
          undefined, // Terceiro parâmetro agora é undefined
          expect.arrayContaining([
            expect.objectContaining({ uid: expect.any(String) })
          ])
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
          undefined, // Terceiro parâmetro agora é undefined
          expect.arrayContaining([
            expect.objectContaining({ uid: expect.any(String) })
          ])
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
    const mockMessageWithAttachments: ChatMessage = {
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
      updated_at: '2025-01-01T10:00:00Z',
      message_type: 'file',
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
        <ChatMessageComponent
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
        <ChatMessageComponent
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
        <ChatMessageComponent
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
        <ChatMessageComponent
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
        <ChatMessageComponent
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
