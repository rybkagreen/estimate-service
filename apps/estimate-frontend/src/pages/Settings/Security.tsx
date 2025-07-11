import React, { useState } from 'react';

const Security: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');

  const handleChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setMessage('Пароль должен быть не менее 6 символов');
      return;
    }
    if (password !== confirm) {
      setMessage('Пароли не совпадают');
      return;
    }
    setMessage('Пароль успешно изменён!');
  };

  return (
    <div className='max-w-xl mx-auto py-10 space-y-6'>
      <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>Безопасность</h1>
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4'>
        <form onSubmit={handleChange} className='space-y-4'>
          <div>
            <label className='block mb-1'>Новый пароль</label>
            <input
              type='password'
              className='border rounded px-2 py-1 w-full'
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label className='block mb-1'>Подтвердите пароль</label>
            <input
              type='password'
              className='border rounded px-2 py-1 w-full'
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
            />
          </div>
          <button type='submit' className='bg-blue-600 text-white px-4 py-2 rounded'>
            Сохранить
          </button>
        </form>
        {message && <div className='text-sm text-center mt-2 text-blue-600'>{message}</div>}
      </div>
    </div>
  );
};

export default Security;
