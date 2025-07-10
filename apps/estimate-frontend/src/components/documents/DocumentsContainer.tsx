import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { downloadFile, parseFile } from '../../services/fileService';
import { RootState } from '../../store';
import {
  addDocument,
  removeDocument,
  selectDocument,
  updateDocumentContent,
} from '../../store/slices/documentsSlice';
import DocumentEditor from './DocumentEditor';
import DocumentViewer from './DocumentViewer';
import FileUploader from './FileUploader';

const DocumentsContainer: React.FC = () => {
  const dispatch = useDispatch();
  const { files, selectedFileId } = useSelector((state: RootState) => state.documents);
  const selectedFile = files.find(f => f.id === selectedFileId) || null;

  const handleFileSelect = async (file: File) => {
    const parsed = await parseFile(file);
    dispatch(
      addDocument({
        id: uuidv4(),
        name: parsed.name,
        type: parsed.type,
        content: parsed.content,
        file,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    );
  };

  const handleSelect = (id: string) => {
    dispatch(selectDocument(id));
  };

  const handleRemove = (id: string) => {
    dispatch(removeDocument(id));
  };

  const handleSave = (content: string) => {
    if (selectedFile) {
      dispatch(updateDocumentContent({ id: selectedFile.id, content }));
    }
  };

  const handleDownload = () => {
    if (selectedFile) {
      downloadFile(selectedFile.name, selectedFile.content || '');
    }
  };

  return (
    <div className='space-y-6'>
      <FileUploader onFileSelect={handleFileSelect} accept='.xlsx,.csv,.pdf,.txt' />
      <div className='flex flex-wrap gap-2 mt-4'>
        {files.map(f => (
          <button
            key={f.id}
            className={`px-3 py-1 rounded border ${
              selectedFileId === f.id
                ? 'bg-blue-100 border-blue-400'
                : 'bg-gray-100 border-gray-300'
            }`}
            onClick={() => handleSelect(f.id)}
          >
            {f.name}
            <span
              className='ml-2 text-red-500 cursor-pointer'
              onClick={e => {
                e.stopPropagation();
                handleRemove(f.id);
              }}
            >
              ×
            </span>
          </button>
        ))}
      </div>
      {selectedFile && (
        <>
          <button
            className='mb-2 px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700'
            onClick={handleDownload}
          >
            Скачать
          </button>
          <DocumentViewer file={selectedFile.file || null} />
          <DocumentEditor file={selectedFile.file || null} onSave={handleSave} />
        </>
      )}
    </div>
  );
};

export default DocumentsContainer;
