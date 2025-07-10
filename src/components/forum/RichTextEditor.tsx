
import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Bold, Italic, Link, List, Code, Eye } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minRows?: number;
  maxRows?: number;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Write your message here...",
  minRows = 4,
  maxRows = 15
}) => {
  const [isPreview, setIsPreview] = useState(false);

  const insertText = (before: string, after: string = '') => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    onChange(newText);
    
    // Set cursor position after the inserted text
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
  };

  const formatText = (type: string) => {
    switch (type) {
      case 'bold':
        insertText('**', '**');
        break;
      case 'italic':
        insertText('*', '*');
        break;
      case 'code':
        insertText('`', '`');
        break;
      case 'link':
        insertText('[', '](url)');
        break;
      case 'list':
        insertText('- ');
        break;
      default:
        break;
    }
  };

  const renderPreview = (text: string) => {
    // Simple markdown preview - replace with a proper markdown parser in production
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded">$1</code>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:underline">$1</a>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul class="list-disc list-inside">$1</ul>')
      .replace(/\n/g, '<br>');
  };

  return (
    <div className="border border-gray-300 rounded-md">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => formatText('bold')}
            className="h-8 w-8 p-0"
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => formatText('italic')}
            className="h-8 w-8 p-0"
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => formatText('code')}
            className="h-8 w-8 p-0"
            title="Code"
          >
            <Code className="h-4 w-4" />
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => formatText('link')}
            className="h-8 w-8 p-0"
            title="Link"
          >
            <Link className="h-4 w-4" />
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => formatText('list')}
            className="h-8 w-8 p-0"
            title="List"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsPreview(!isPreview)}
          className="flex items-center space-x-1 h-8"
        >
          <Eye className="h-4 w-4" />
          <span className="text-sm">{isPreview ? 'Edit' : 'Preview'}</span>
        </Button>
      </div>

      {/* Editor/Preview */}
      <div className="p-3">
        {isPreview ? (
          <div
            className="min-h-[100px] prose max-w-none"
            dangerouslySetInnerHTML={{ __html: renderPreview(value) }}
          />
        ) : (
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="min-h-[100px] border-0 resize-none focus:ring-0 focus:outline-none p-0"
            style={{
              minHeight: `${minRows * 1.5}rem`,
              maxHeight: `${maxRows * 1.5}rem`
            }}
          />
        )}
      </div>

      {/* Help text */}
      <div className="px-3 py-2 border-t border-gray-200 bg-gray-50">
        <p className="text-xs text-gray-500">
          Supports Markdown formatting. Use **bold**, *italic*, `code`, [links](url), and - lists.
        </p>
      </div>
    </div>
  );
};
