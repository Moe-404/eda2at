import React, { useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import {
    Bold, Italic, Strikethrough, Heading2, Heading3, List, ListOrdered,
    Quote, Minus, Link as LinkIcon, Image as ImageIcon,
    AlignRight, AlignCenter, AlignLeft, Undo, Redo, BookOpen, MessageSquare,
} from 'lucide-react';
import './RichTextEditor.css';

const ToolbarButton = ({ onClick, active, title, children, disabled }) => (
    <button
        type="button"
        onClick={onClick}
        className={`rte-btn ${active ? 'is-active' : ''}`}
        title={title}
        aria-label={title}
        disabled={disabled}
    >
        {children}
    </button>
);

const RichTextEditor = ({ value, onChange, placeholder = 'اكتب محتوى الإضاءة هنا...' }) => {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [2, 3] },
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
            }),
            Image.configure({ inline: false, allowBase64: true }),
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Placeholder.configure({ placeholder }),
        ],
        content: value || '',
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    const insertImage = useCallback(() => {
        if (!editor) return;
        const url = window.prompt('رابط الصورة');
        if (url) editor.chain().focus().setImage({ src: url, alt: '' }).run();
    }, [editor]);

    const insertLink = useCallback(() => {
        if (!editor) return;
        const previous = editor.getAttributes('link').href;
        const url = window.prompt('الرابط', previous);
        if (url === null) return;
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }, [editor]);

    const insertAyah = useCallback(() => {
        if (!editor) return;
        editor
            .chain()
            .focus()
            .insertContent(
                '<blockquote class="ayah">﴿ ... اكتب الآية هنا ... ﴾<br/><small>[سورة: آية]</small></blockquote><p></p>'
            )
            .run();
    }, [editor]);

    const insertHadith = useCallback(() => {
        if (!editor) return;
        editor
            .chain()
            .focus()
            .insertContent(
                '<blockquote class="hadith">« ... اكتب الحديث هنا ... »<br/><small>[المصدر]</small></blockquote><p></p>'
            )
            .run();
    }, [editor]);

    if (!editor) return null;

    return (
        <div className="rte">
            <div className="rte-toolbar" role="toolbar" aria-label="أدوات التنسيق">
                <ToolbarButton title="تراجع" onClick={() => editor.chain().focus().undo().run()}>
                    <Undo size={16} />
                </ToolbarButton>
                <ToolbarButton title="إعادة" onClick={() => editor.chain().focus().redo().run()}>
                    <Redo size={16} />
                </ToolbarButton>

                <span className="rte-divider" />

                <ToolbarButton
                    title="عنوان ثانوي"
                    active={editor.isActive('heading', { level: 2 })}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                >
                    <Heading2 size={16} />
                </ToolbarButton>
                <ToolbarButton
                    title="عنوان فرعي"
                    active={editor.isActive('heading', { level: 3 })}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                >
                    <Heading3 size={16} />
                </ToolbarButton>

                <span className="rte-divider" />

                <ToolbarButton
                    title="غامق"
                    active={editor.isActive('bold')}
                    onClick={() => editor.chain().focus().toggleBold().run()}
                >
                    <Bold size={16} />
                </ToolbarButton>
                <ToolbarButton
                    title="مائل"
                    active={editor.isActive('italic')}
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                >
                    <Italic size={16} />
                </ToolbarButton>
                <ToolbarButton
                    title="شطب"
                    active={editor.isActive('strike')}
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                >
                    <Strikethrough size={16} />
                </ToolbarButton>

                <span className="rte-divider" />

                <ToolbarButton
                    title="قائمة نقطية"
                    active={editor.isActive('bulletList')}
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                >
                    <List size={16} />
                </ToolbarButton>
                <ToolbarButton
                    title="قائمة مرقمة"
                    active={editor.isActive('orderedList')}
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                >
                    <ListOrdered size={16} />
                </ToolbarButton>
                <ToolbarButton
                    title="اقتباس"
                    active={editor.isActive('blockquote')}
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                >
                    <Quote size={16} />
                </ToolbarButton>
                <ToolbarButton
                    title="فاصل"
                    onClick={() => editor.chain().focus().setHorizontalRule().run()}
                >
                    <Minus size={16} />
                </ToolbarButton>

                <span className="rte-divider" />

                <ToolbarButton
                    title="محاذاة يمين"
                    active={editor.isActive({ textAlign: 'right' })}
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                >
                    <AlignRight size={16} />
                </ToolbarButton>
                <ToolbarButton
                    title="محاذاة وسط"
                    active={editor.isActive({ textAlign: 'center' })}
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                >
                    <AlignCenter size={16} />
                </ToolbarButton>
                <ToolbarButton
                    title="محاذاة يسار"
                    active={editor.isActive({ textAlign: 'left' })}
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                >
                    <AlignLeft size={16} />
                </ToolbarButton>

                <span className="rte-divider" />

                <ToolbarButton title="رابط" active={editor.isActive('link')} onClick={insertLink}>
                    <LinkIcon size={16} />
                </ToolbarButton>
                <ToolbarButton title="إضافة صورة" onClick={insertImage}>
                    <ImageIcon size={16} />
                </ToolbarButton>

                <span className="rte-divider" />

                <ToolbarButton title="آية قرآنية" onClick={insertAyah}>
                    <BookOpen size={16} />
                    <span className="rte-btn-label">آية</span>
                </ToolbarButton>
                <ToolbarButton title="حديث نبوي" onClick={insertHadith}>
                    <MessageSquare size={16} />
                    <span className="rte-btn-label">حديث</span>
                </ToolbarButton>
            </div>

            <EditorContent editor={editor} className="rte-content" />
        </div>
    );
};

export default RichTextEditor;
