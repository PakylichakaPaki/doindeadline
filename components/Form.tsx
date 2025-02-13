import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Form = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
    budget_from: '',
    budget_to: '',
    deadline: '',
    reminds: '',
    all_auto_responses: false,
    rules: {
      budget_from: '',
      budget_to: '',
      deadline_days: '',
      qty_freelancers: '',
    },
  });

  const [token, setToken] = useState<string | null>(null);
  const [errors, setErrors] = useState<any>({});

  // Загрузка токена из localStorage при монтировании компонента
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        setToken(savedToken);
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const isChecked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: isChecked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleRulesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      rules: {
        ...prev.rules,
        [name]: value || '',
      },
    }));
  };

  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newToken = e.target.value;
    setToken(newToken);

    if (typeof window !== 'undefined') {
      localStorage.setItem('token', newToken); // Сохраняем токен в localStorage
    }
  };

  const validate = () => {
    const errors: any = {};

    if (!formData.title.trim()) {
      errors.title = 'Поле "Название задачи" обязательно для заполнения.';
    }

    if (!formData.description.trim()) {
      errors.description = 'Поле "Описание задачи" обязательно для заполнения.';
    }

    if (!formData.tags.trim()) {
      errors.tags = 'Поле "Теги" обязательно для заполнения.';
    }

    if (!formData.budget_from || isNaN(Number(formData.budget_from))) {
      errors.budget_from = 'Поле "Бюджет (от)" должно быть числом.';
    } else if (Number(formData.budget_from) <= 0) {
      errors.budget_from = 'Поле "Бюджет (от)" должно быть больше 0.';
    }

    if (!formData.budget_to || isNaN(Number(formData.budget_to))) {
      errors.budget_to = 'Поле "Бюджет (до)" должно быть числом.';
    } else if (Number(formData.budget_to) <= Number(formData.budget_from)) {
      errors.budget_to = 'Поле "Бюджет (до)" должно быть больше "Бюджет (от)".';
    }

    if (!formData.deadline || isNaN(Number(formData.deadline))) {
      errors.deadline = 'Поле "Срок выполнения" должно быть числом.';
    } else if (Number(formData.deadline) <= 0) {
      errors.deadline = 'Поле "Срок выполнения" должно быть больше 0.';
    }

    if (!formData.reminds || isNaN(Number(formData.reminds))) {
      errors.reminds = 'Поле "Количество напоминаний" должно быть числом.';
    } else if (Number(formData.reminds) < 0) {
      errors.reminds = 'Поле "Количество напоминаний" должно быть не меньше 0.';
    }

    if (!formData.rules.budget_from || isNaN(Number(formData.rules.budget_from))) {
      errors.rules_budget_from = 'Поле "Минимальный бюджет правил" должно быть числом.';
    } else if (Number(formData.rules.budget_from) <= 0) {
      errors.rules_budget_from = 'Поле "Минимальный бюджет правил" должно быть больше 0.';
    }

    if (!formData.rules.budget_to || isNaN(Number(formData.rules.budget_to))) {
      errors.rules_budget_to = 'Поле "Максимальный бюджет правил" должно быть числом.';
    } else if (Number(formData.rules.budget_to) <= Number(formData.rules.budget_from)) {
      errors.rules_budget_to = 'Поле "Максимальный бюджет правил" должно быть больше "Минимального бюджета правил".';
    }

    if (!formData.rules.deadline_days || isNaN(Number(formData.rules.deadline_days))) {
      errors.rules_deadline_days = 'Поле "Срок выполнения правил" должно быть числом.';
    } else if (Number(formData.rules.deadline_days) <= 0) {
      errors.rules_deadline_days = 'Поле "Срок выполнения правил" должно быть больше 0.';
    }

    if (!formData.rules.qty_freelancers || isNaN(Number(formData.rules.qty_freelancers))) {
      errors.rules_qty_freelancers = 'Поле "Количество фрилансеров" должно быть числом.';
    } else if (Number(formData.rules.qty_freelancers) <= 0) {
      errors.rules_qty_freelancers = 'Поле "Количество фрилансеров" должно быть больше 0.';
    }

    return Object.keys(errors).length === 0 ? null : errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      alert('Токен не указан!');
      return;
    }

    const validationErrors = validate();
    if (validationErrors) {
      setErrors(validationErrors);
      return;
    }

    try {
      const queryParams = new URLSearchParams({
        token,
        title: formData.title,
        description: formData.description,
        tags: formData.tags,
        budget_from: formData.budget_from,
        budget_to: formData.budget_to,
        deadline: formData.deadline,
        reminds: formData.reminds,
        all_auto_responses: String(formData.all_auto_responses),
        rules: JSON.stringify({
          budget_from: Number(formData.rules.budget_from || 0),
          budget_to: Number(formData.rules.budget_to || 0),
          deadline_days: Number(formData.rules.deadline_days || 0),
          qty_freelancers: Number(formData.rules.qty_freelancers || 0),
        }),
      });

      const response = await axios.get(
        `https://deadlinetaskbot.productlove.ru/api/v1/tasks/client/newhardtask?${queryParams.toString()}`
      );

      if (response.status === 200) {
        alert('Задача опубликована!');
        setFormData({ // Очищаем форму
          title: '',
          description: '',
          tags: '',
          budget_from: '',
          budget_to: '',
          deadline: '',
          reminds: '',
          all_auto_responses: false,
          rules: {
            budget_from: '',
            budget_to: '',
            deadline_days: '',
            qty_freelancers: '',
          },
        });
        setErrors({});
      } else {
        alert(`Ошибка сервера: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error:', error);

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 422) {
          alert(`Ошибка в данных: ${JSON.stringify(error.response?.data?.message || 'Неизвестная ошибка')}`);
        } else {
          alert(`Ошибка: ${error.response?.data.message || 'Неизвестная ошибка'}`);
        }
      } else {
        alert('Произошла ошибка при отправке запроса.');
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-lg rounded-lg w-3/4">
      <h2 className="text-2xl font-bold mb-4">Форма создания задачи</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        {/* Title */}
        <div className="mb-4 col-span-2 sm:col-span-1">
          <label className="block text-gray-700 font-bold mb-2" htmlFor="title">
            Название задачи
          </label>
          <input
            className={`w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 ${
              errors.title ? 'border-red-500' : ''
            }`}
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
          {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
        </div>

        {/* Description */}
        <div className="mb-4 col-span-2">
          <label className="block text-gray-700 font-bold mb-2" htmlFor="description">
            Описание задачи
          </label>
          <textarea
            className={`w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 ${
              errors.description ? 'border-red-500' : ''
            }`}
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
          {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
        </div>

        {/* Tags */}
        <div className="mb-4 col-span-2 sm:col-span-1">
          <label className="block text-gray-700 font-bold mb-2" htmlFor="tags">
            Теги (через запятую)
          </label>
          <input
            className={`w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 ${
              errors.tags ? 'border-red-500' : ''
            }`}
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            required
          />
          {errors.tags && <p className="text-red-500 text-sm">{errors.tags}</p>}
        </div>

        {/* Budget From */}
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2" htmlFor="budget_from">
            Бюджет (от)
          </label>
          <input
            className={`w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 ${
              errors.budget_from ? 'border-red-500' : ''
            }`}
            type="number"
            id="budget_from"
            name="budget_from"
            value={formData.budget_from}
            onChange={handleChange}
            required
          />
          {errors.budget_from && <p className="text-red-500 text-sm">{errors.budget_from}</p>}
        </div>

        {/* Budget To */}
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2" htmlFor="budget_to">
            Бюджет (до)
          </label>
          <input
            className={`w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 ${
              errors.budget_to ? 'border-red-500' : ''
            }`}
            type="number"
            id="budget_to"
            name="budget_to"
            value={formData.budget_to}
            onChange={handleChange}
            required
          />
          {errors.budget_to && <p className="text-red-500 text-sm">{errors.budget_to}</p>}
        </div>

        {/* Deadline */}
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2" htmlFor="deadline">
            Срок выполнения (дни)
          </label>
          <input
            className={`w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 ${
              errors.deadline ? 'border-red-500' : ''
            }`}
            type="number"
            id="deadline"
            name="deadline"
            value={formData.deadline}
            onChange={handleChange}
            required
          />
          {errors.deadline && <p className="text-red-500 text-sm">{errors.deadline}</p>}
        </div>

        {/* Reminds */}
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2" htmlFor="reminds">
            Количество напоминаний
          </label>
          <input
            className={`w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 ${
              errors.reminds ? 'border-red-500' : ''
            }`}
            type="number"
            id="reminds"
            name="reminds"
            value={formData.reminds}
            onChange={handleChange}
            required
          />
          {errors.reminds && <p className="text-red-500 text-sm">{errors.reminds}</p>}
        </div>

        {/* Auto Responses */}
        <div className="mb-4 col-span-2">
          <label className="block text-gray-700 font-bold mb-2" htmlFor="all_auto_responses">
            Автоматические ответы
          </label>
          <input
            className="mr-2 leading-tight"
            type="checkbox"
            id="all_auto_responses"
            name="all_auto_responses"
            checked={formData.all_auto_responses}
            onChange={handleChange}
          />
        </div>

        {/* Rules - Budget From */}
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2" htmlFor="rules_budget_from">
            Минимальный бюджет правил
          </label>
          <input
            className={`w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 ${
              errors.rules_budget_from ? 'border-red-500' : ''
            }`}
            type="number"
            id="rules_budget_from"
            name="budget_from"
            value={formData.rules.budget_from}
            onChange={handleRulesChange}
            required
          />
          {errors.rules_budget_from && <p className="text-red-500 text-sm">{errors.rules_budget_from}</p>}
        </div>

        {/* Rules - Budget To */}
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2" htmlFor="rules_budget_to">
            Максимальный бюджет правил
          </label>
          <input
            className={`w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 ${
              errors.rules_budget_to ? 'border-red-500' : ''
            }`}
            type="number"
            id="rules_budget_to"
            name="budget_to"
            value={formData.rules.budget_to}
            onChange={handleRulesChange}
            required
          />
          {errors.rules_budget_to && <p className="text-red-500 text-sm">{errors.rules_budget_to}</p>}
        </div>

        {/* Rules - Deadline Days */}
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2" htmlFor="rules_deadline_days">
            Срок выполнения правил (дни)
          </label>
          <input
            className={`w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 ${
              errors.rules_deadline_days ? 'border-red-500' : ''
            }`}
            type="number"
            id="rules_deadline_days"
            name="deadline_days"
            value={formData.rules.deadline_days}
            onChange={handleRulesChange}
            required
          />
          {errors.rules_deadline_days && <p className="text-red-500 text-sm">{errors.rules_deadline_days}</p>}
        </div>

        {/* Rules - Freelancers */}
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2" htmlFor="rules_qty_freelancers">
            Количество фрилансеров
          </label>
          <input
            className={`w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 ${
              errors.rules_qty_freelancers ? 'border-red-500' : ''
            }`}
            type="number"
            id="rules_qty_freelancers"
            name="qty_freelancers"
            value={formData.rules.qty_freelancers}
            onChange={handleRulesChange}
            required
          />
          {errors.rules_qty_freelancers && <p className="text-red-500 text-sm">{errors.rules_qty_freelancers}</p>}
        </div>

        {/* Token */}
        <div className="mb-4 col-span-2">
          <label className="block text-gray-700 font-bold mb-2" htmlFor="token">
            Токен
          </label>
          <input
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            type="text"
            id="token"
            name="token"
            value={token ?? ''}
            onChange={handleTokenChange}
          />
        </div>

        {/* Submit Button */}
        <div className="col-span-2 flex justify-center">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            type="submit"
          >
            Создать задачу
          </button>
        </div>
      </form>
    </div>
  );
};

export default Form;