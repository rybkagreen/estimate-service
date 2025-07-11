import React, { useState } from 'react';
import { useGetProfileQuery, useUpdateProfileMutation } from '../store/api/userApi';

const Settings: React.FC = () => {
  const { data: profile, isLoading } = useGetProfileQuery();
  const [updateProfile] = useUpdateProfileMutation();
  const [name, setName] = useState('');
  const [aiModel, setAiModel] = useState('DeepSeek R1');
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (profile) {
      setName(profile.name);
      setAiModel(profile.aiModel || 'DeepSeek R1');
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    await updateProfile({ name, aiModel });
    setSaving(false);
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>Настройки</h1>
        <button
          className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg'
          onClick={handleSave}
          disabled={saving || isLoading}
        >
          {saving ? 'Сохранение...' : 'Сохранить'}
        </button>
      </div>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
          <h2 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
            Общие настройки
          </h2>
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Имя пользователя
              </label>
              <input
                type='text'
                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
                placeholder='Введите имя'
                value={name}
                onChange={e => setName(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Email
              </label>
              <input
                type='email'
                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
                value={profile?.email || ''}
                disabled
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Роль
              </label>
              <input
                type='text'
                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
                value={profile?.role || ''}
                disabled
              />
            </div>
          </div>
        </div>
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
          <h2 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>Настройки ИИ</h2>
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Модель ИИ
              </label>
              <select
                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
                value={aiModel}
                onChange={e => setAiModel(e.target.value)}
                disabled={isLoading}
              >
                <option>DeepSeek R1</option>
                <option>OpenAI GPT-4</option>
                <option>YandexGPT</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
