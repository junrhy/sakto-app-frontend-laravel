import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from '@/Components/ui/button';
import { 
    Bold, 
    Italic, 
    List, 
    ListOrdered, 
    Link as LinkIcon,
    Image as ImageIcon,
    Undo,
    Redo
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
            </div>
            <EditorContent 
                editor={editor} 
                className="prose prose-sm max-w-none p-4 min-h-[200px] focus:outline-none"
            />
        </div>
    );
} 