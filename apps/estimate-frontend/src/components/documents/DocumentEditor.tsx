import React, { useState } from 'react';

interface DocumentEditorProps {
  file: File | null;
  onSave: (content: string) => void;
}

const DocumentEditor: React.FC<DocumentEditorProps> = ({ file, onSave }) => {
  const [content, setContent] = useState<string>('');
  const [loaded, setLoaded] = useState(false);

  React.useEffect(() => {
    if (file && file.type.startsWith('text/')) {
      const reader = new FileReader();
      reader.onload = e => {
        setContent(e.target?.result as string);
        setLoaded(true);
      };
      reader.readAsText(file);
    } else {
      setContent('');
      setLoaded(false);
    }
  }, [file]);

  if (!file) {
    return <div className='text-gray-400 text-center p-8'>Файл не выбран</div>;
  }
  if (!file.type.startsWith('text/')) {
    return <div className='text-gray-500'>Редактирование этого типа файлов не поддерживается</div>;
  }

  return (
    <div className='my-4'>
      <h3 className='font-semibold mb-2'>Редактирование: {file.name}</h3>
      <textarea
        className='w-full h-64 p-2 border rounded mb-2'
        value={content}
        onChange={e => setContent(e.target.value)}
        disabled={!loaded}
      />
      <button
        className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'
        onClick={() => onSave(content)}
        disabled={!loaded}
      >
        Сохранить
      </button>
    </div>
  );
};

export default DocumentEditor;
