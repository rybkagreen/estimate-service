import React from 'react';

interface DocumentViewerProps {
  file: File | null;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ file }) => {
  if (!file) {
    return <div className='text-gray-400 text-center p-8'>Файл не выбран</div>;
  }

  // Простейший просмотрщик для текстовых и PDF файлов (расширяемый)
  const renderContent = () => {
    if (file.type === 'application/pdf') {
      return (
        <iframe
          src={URL.createObjectURL(file)}
          title='PDF Preview'
          className='w-full h-96 border rounded'
        />
      );
    }
    if (file.type.startsWith('text/')) {
      const [content, setContent] = React.useState<string>('');
      React.useEffect(() => {
        const reader = new FileReader();
        reader.onload = e => setContent(e.target?.result as string);
        reader.readAsText(file);
      }, [file]);
      return <pre className='bg-gray-100 p-4 rounded overflow-x-auto'>{content}</pre>;
    }
    return <div className='text-gray-500'>Просмотр этого типа файлов не поддерживается</div>;
  };

  return (
    <div className='my-4'>
      <h3 className='font-semibold mb-2'>Просмотр: {file.name}</h3>
      {renderContent()}
    </div>
  );
};

export default DocumentViewer;
