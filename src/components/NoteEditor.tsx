import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import {
    Bold,
    Italic,
    List,
    ListOrdered,
    Undo,
    Redo,
} from "lucide-react"

interface Props {
    content: string
    onChange: (value: string) => void
}

const NoteEditor = ({ content, onChange }: Props) => {

    const editor = useEditor({
        extensions: [StarterKit],
        content,
        onUpdate({ editor }) {
            onChange(editor.getHTML())
        }
    })

    if (!editor) return null

    const buttonStyle = (active: boolean) =>
        `p-2 rounded-md transition flex items-center gap-1
     ${active ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"}`

    return (
        <div className="border rounded-xl shadow-sm bg-white overflow-hidden">

            {/* Toolbar */}
            <div className="flex items-center gap-2 p-2 border-b bg-gray-50 flex-wrap">

                {/* Undo / Redo */}
                <button
                    onClick={() => editor.chain().focus().undo().run()}
                    className={buttonStyle(false)}
                >
                    <Undo size={18} />
                </button>

                <button
                    onClick={() => editor.chain().focus().redo().run()}
                    className={buttonStyle(false)}
                >
                    <Redo size={18} />
                </button>

                <div className="w-px h-6 bg-gray-300" />

                {/* Heading Dropdown */}
                <div className="relative">
                    <select
                        className="border rounded-md px-2 py-1 text-sm bg-white hover:bg-gray-50"
                        onChange={(e) => {
                            const value = e.target.value
                            if (value === "p") editor.chain().focus().setParagraph().run()
                            if (value === "h1") editor.chain().focus().toggleHeading({ level: 1 }).run()
                            if (value === "h2") editor.chain().focus().toggleHeading({ level: 2 }).run()
                            if (value === "h3") editor.chain().focus().toggleHeading({ level: 3 }).run()
                        }}
                    >
                        <option value="p">Paragraph</option>
                        <option value="h1">Heading 1</option>
                        <option value="h2">Heading 2</option>
                        <option value="h3">Heading 3</option>
                    </select>
                </div>

                <div className="w-px h-6 bg-gray-300" />

                {/* Bold */}
                <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={buttonStyle(editor.isActive("bold"))}
                >
                    <Bold size={18} />
                </button>

                {/* Italic */}
                <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={buttonStyle(editor.isActive("italic"))}
                >
                    <Italic size={18} />
                </button>

                <div className="w-px h-6 bg-gray-300" />

                {/* Bullet List */}
                <button
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={buttonStyle(editor.isActive("bulletList"))}
                >
                    <List size={18} />
                </button>

                {/* Ordered List */}
                <button
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={buttonStyle(editor.isActive("orderedList"))}
                >
                    <ListOrdered size={18} />
                </button>

            </div>

            {/* Editor Area */}
            <div className="p-4">
                <EditorContent
                    editor={editor}
                    className="
                    prose max-w-none
                    text-base
                    leading-relaxed
                    [&_.ProseMirror]:min-h-87.5
                    [&_.ProseMirror]:outline-none
                    "
                />
            </div>
        </div>
    )
}

export default NoteEditor