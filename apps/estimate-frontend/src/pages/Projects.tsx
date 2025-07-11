import React, { useState } from 'react';
import {
  Project,
  useCreateProjectMutation,
  useDeleteProjectMutation,
  useGetProjectsQuery,
  useUpdateProjectMutation,
} from '../store/api/projectsApi';

const Projects: React.FC = () => {
  const { data: projects = [], isLoading, error } = useGetProjectsQuery();
  const [createProject] = useCreateProjectMutation();
  const [updateProject] = useUpdateProjectMutation();
  const [deleteProject] = useDeleteProjectMutation();
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [search, setSearch] = useState('');

  const filtered = projects.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await createProject({ name: newName, status: 'active' });
    setNewName('');
  };

  const handleEdit = (project: Project) => {
    setEditingId(project.id);
    setEditName(project.name);
  };

  const handleUpdate = async (id: string) => {
    await updateProject({ id, data: { name: editName } });
    setEditingId(null);
    setEditName('');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Удалить проект?')) {
      await deleteProject(id);
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>Проекты</h1>
        <div className='flex gap-2'>
          <input
            className='border rounded px-2 py-1'
            placeholder='Новый проект...'
            value={newName}
            onChange={e => setNewName(e.target.value)}
          />
          <button
            className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg'
            onClick={handleCreate}
          >
            Добавить
          </button>
        </div>
      </div>
      <input
        className='border rounded px-2 py-1 w-full mb-2'
        placeholder='Поиск по проектам...'
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow'>
        <table className='min-w-full'>
          <thead>
            <tr>
              <th className='px-4 py-2 text-left'>Название</th>
              <th className='px-4 py-2 text-left'>Статус</th>
              <th className='px-4 py-2'>Действия</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={3} className='text-center p-4'>
                  Загрузка...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={3} className='text-center p-4'>
                  Нет проектов
                </td>
              </tr>
            ) : (
              filtered.map(project => (
                <tr key={project.id} className='border-t'>
                  <td className='px-4 py-2'>
                    {editingId === project.id ? (
                      <input
                        className='border rounded px-2 py-1'
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        onBlur={() => handleUpdate(project.id)}
                        autoFocus
                      />
                    ) : (
                      <span>{project.name}</span>
                    )}
                  </td>
                  <td className='px-4 py-2'>{project.status}</td>
                  <td className='px-4 py-2 flex gap-2'>
                    <button
                      className='text-blue-600 hover:underline'
                      onClick={() => handleEdit(project)}
                    >
                      Редактировать
                    </button>
                    <button
                      className='text-red-600 hover:underline'
                      onClick={() => handleDelete(project.id)}
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {error && <div className='text-red-600'>Ошибка загрузки проектов</div>}
    </div>
  );
};

export default Projects;
