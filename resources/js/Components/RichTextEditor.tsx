import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { Button } from '@/Components/ui/button';
import { 
    Bold, 
    Italic, 
    List, 
    ListOrdered, 
    Link as LinkIcon,
    Image as ImageIcon,
    Undo,
    Redo,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Underline as UnderlineIcon,
    Heading1,
    Heading2,
    Heading3,
    Quote,
    Code,
    ListChecks,
    Minus,
    Type,
    Palette,
    Eraser
} from 'lucide-react';
import { useEffect } from 'react';

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
}

export default function RichTextEditor({ content, onChange, placeholder = 'Start writing...' }: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-blue-500 hover:text-blue-700 underline',
                },
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'max-w-full rounded-lg',
                },
            }),
            Placeholder.configure({
                placeholder,
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Underline,
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
        ],
        content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    // Update editor content when the content prop changes
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    if (!editor) {
        return null;
    }

    const addLink = (e: React.MouseEvent) => {
        e.preventDefault();
        const url = window.prompt('Enter URL');
        if (url) {
            editor.chain().focus().setLink({ href: url }).run();
        }
    };

    const addImage = (e: React.MouseEvent) => {
        e.preventDefault();
        const url = window.prompt('Enter image URL');
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    };

    const handleFormatAction = (e: React.MouseEvent, action: () => void) => {
        e.preventDefault();
        action();
    };

    return (
        <div className="border rounded-lg">
            <div className="border-b p-2 flex flex-wrap gap-2">
                {/* Text Style Controls */}
                <div className="flex items-center gap-1 border-r pr-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleFormatAction(e, () => editor.chain().focus().toggleBold().run())}
                        className={editor.isActive('bold') ? 'bg-gray-100' : ''}
                    >
                        <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleFormatAction(e, () => editor.chain().focus().toggleItalic().run())}
                        className={editor.isActive('italic') ? 'bg-gray-100' : ''}
                    >
                        <Italic className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleFormatAction(e, () => editor.chain().focus().toggleUnderline().run())}
                        className={editor.isActive('underline') ? 'bg-gray-100' : ''}
                    >
                        <UnderlineIcon className="h-4 w-4" />
                    </Button>
                </div>

                {/* Heading Controls */}
                <div className="flex items-center gap-1 border-r pr-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleFormatAction(e, () => editor.chain().focus().toggleHeading({ level: 1 }).run())}
                        className={editor.isActive('heading', { level: 1 }) ? 'bg-gray-100' : ''}
                    >
                        <Heading1 className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleFormatAction(e, () => editor.chain().focus().toggleHeading({ level: 2 }).run())}
                        className={editor.isActive('heading', { level: 2 }) ? 'bg-gray-100' : ''}
                    >
                        <Heading2 className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleFormatAction(e, () => editor.chain().focus().toggleHeading({ level: 3 }).run())}
                        className={editor.isActive('heading', { level: 3 }) ? 'bg-gray-100' : ''}
                    >
                        <Heading3 className="h-4 w-4" />
                    </Button>
                </div>

                {/* List Controls */}
                <div className="flex items-center gap-1 border-r pr-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleFormatAction(e, () => editor.chain().focus().toggleBulletList().run())}
                        className={editor.isActive('bulletList') ? 'bg-gray-100' : ''}
                    >
                        <List className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleFormatAction(e, () => editor.chain().focus().toggleOrderedList().run())}
                        className={editor.isActive('orderedList') ? 'bg-gray-100' : ''}
                    >
                        <ListOrdered className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleFormatAction(e, () => editor.chain().focus().toggleTaskList().run())}
                        className={editor.isActive('taskList') ? 'bg-gray-100' : ''}
                    >
                        <ListChecks className="h-4 w-4" />
                    </Button>
                </div>

                {/* Alignment Controls */}
                <div className="flex items-center gap-1 border-r pr-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleFormatAction(e, () => editor.chain().focus().setTextAlign('left').run())}
                        className={editor.isActive({ textAlign: 'left' }) ? 'bg-gray-100' : ''}
                    >
                        <AlignLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleFormatAction(e, () => editor.chain().focus().setTextAlign('center').run())}
                        className={editor.isActive({ textAlign: 'center' }) ? 'bg-gray-100' : ''}
                    >
                        <AlignCenter className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleFormatAction(e, () => editor.chain().focus().setTextAlign('right').run())}
                        className={editor.isActive({ textAlign: 'right' }) ? 'bg-gray-100' : ''}
                    >
                        <AlignRight className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleFormatAction(e, () => editor.chain().focus().setTextAlign('justify').run())}
                        className={editor.isActive({ textAlign: 'justify' }) ? 'bg-gray-100' : ''}
                    >
                        <AlignJustify className="h-4 w-4" />
                    </Button>
                </div>

                {/* Block Controls */}
                <div className="flex items-center gap-1 border-r pr-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleFormatAction(e, () => editor.chain().focus().toggleBlockquote().run())}
                        className={editor.isActive('blockquote') ? 'bg-gray-100' : ''}
                    >
                        <Quote className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleFormatAction(e, () => editor.chain().focus().toggleCodeBlock().run())}
                        className={editor.isActive('codeBlock') ? 'bg-gray-100' : ''}
                    >
                        <Code className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleFormatAction(e, () => editor.chain().focus().setHorizontalRule().run())}
                    >
                        <Minus className="h-4 w-4" />
                    </Button>
                </div>

                {/* Insert Controls */}
                <div className="flex items-center gap-1 border-r pr-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={addLink}
                        className={editor.isActive('link') ? 'bg-gray-100' : ''}
                    >
                        <LinkIcon className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={addImage}
                    >
                        <ImageIcon className="h-4 w-4" />
                    </Button>
                </div>

                {/* History Controls */}
                <div className="flex items-center gap-1">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleFormatAction(e, () => editor.chain().focus().undo().run())}
                        disabled={!editor.can().undo()}
                    >
                        <Undo className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleFormatAction(e, () => editor.chain().focus().redo().run())}
                        disabled={!editor.can().redo()}
                    >
                        <Redo className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleFormatAction(e, () => editor.chain().focus().clearNodes().unsetAllMarks().run())}
                    >
                        <Eraser className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            <EditorContent 
                editor={editor} 
                className="prose prose-sm max-w-none p-4 min-h-[200px] focus:outline-none [&_.ProseMirror]:focus:outline-none [&_.ProseMirror]:focus:ring-0 [&_.ProseMirror]:focus:border-0"
            />
        </div>
    );
} 