import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch, set_current_project } from '@/store/main';
import axios from 'axios';

const UV_ProjectCreation: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [csvPreview, setCsvPreview] = useState<Array<{ title: string; url_slug: string; description: string }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();
  const userProfile = useSelector((state: RootState) => state.user_profile);

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      projectName: '',
      projectType: '',
      selectedTemplate: '',
      csvFile: null,
      primaryLanguage: 'en',
      targetAudience: '',
      industry: '',
    }
  });

  const watchProjectType = watch('projectType');

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    setGeneralError(null);

    try {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (key === 'csvFile') {
          formData.append(key, data[key][0]);
        } else {
          formData.append(key, data[key]);
        }
      });

      const response = await axios.post('http://localhost:1337/api/projects', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      dispatch(set_current_project(response.data.project_id));
      navigate(`/projects/${response.data.project_id}`);
    } catch (error) {
      setGeneralError('An error occurred while creating the project. Please try again.');
      console.error('Project creation error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setValue('csvFile', [file]);
      try {
        const formData = new FormData();
        formData.append('file', file);
        const response = await axios.post('http://localhost:1337/api/projects/csv-preview', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setCsvPreview(response.data.preview);
      } catch (error) {
        console.error('CSV preview error:', error);
        setCsvPreview([]);
      }
    }
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 5));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Project Name</h2>
            <Controller
              name="projectName"
              control={control}
              rules={{ required: 'Project name is required' }}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  placeholder="Enter project name"
                  className="w-full p-2 border rounded"
                />
              )}
            />
            {errors.projectName && <p className="text-red-500">{errors.projectName.message}</p>}
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Project Type</h2>
            <Controller
              name="projectType"
              control={control}
              rules={{ required: 'Project type is required' }}
              render={({ field }) => (
                <select {...field} className="w-full p-2 border rounded">
                  <option value="">Select project type</option>
                  <option value="blog">Blog</option>
                  <option value="business">Business Website</option>
                  <option value="ecommerce">E-commerce</option>
                  <option value="portfolio">Portfolio</option>
                  <option value="custom">Custom</option>
                </select>
              )}
            />
            {errors.projectType && <p className="text-red-500">{errors.projectType.message}</p>}
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Template Selection</h2>
            <div className="grid grid-cols-3 gap-4">
              {['template1', 'template2', 'template3'].map((template) => (
                <div
                  key={template}
                  className={`p-4 border rounded cursor-pointer ${
                    watch('selectedTemplate') === template ? 'border-blue-500' : ''
                  }`}
                  onClick={() => setValue('selectedTemplate', template)}
                >
                  <img src={`https://picsum.photos/seed/${template}/200/100`} alt={`Template ${template}`} className="w-full h-32 object-cover mb-2" />
                  <p className="text-center">{template}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">CSV Upload</h2>
            <Controller
              name="csvFile"
              control={control}
              rules={{ required: 'CSV file is required' }}
              render={({ field: { onChange, ...rest } }) => (
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    onChange(e.target.files);
                    handleFileUpload(e);
                  }}
                  {...rest}
                  className="w-full p-2 border rounded"
                />
              )}
            />
            {errors.csvFile && <p className="text-red-500">{errors.csvFile.message}</p>}
            {csvPreview.length > 0 && (
              <div className="mt-4">
                <h3 className="text-xl font-semibold">CSV Preview</h3>
                <table className="w-full mt-2 border-collapse border">
                  <thead>
                    <tr>
                      <th className="border p-2">Title</th>
                      <th className="border p-2">URL Slug</th>
                      <th className="border p-2">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {csvPreview.slice(0, 5).map((row, index) => (
                      <tr key={index}>
                        <td className="border p-2">{row.title}</td>
                        <td className="border p-2">{row.url_slug}</td>
                        <td className="border p-2">{row.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {csvPreview.length > 5 && (
                  <p className="mt-2 text-sm text-gray-500">Showing first 5 rows of {csvPreview.length} total rows.</p>
                )}
              </div>
            )}
          </div>
        );
      case 5:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Initial Settings</h2>
            <Controller
              name="primaryLanguage"
              control={control}
              rules={{ required: 'Primary language is required' }}
              render={({ field }) => (
                <div>
                  <label className="block mb-1">Primary Language</label>
                  <select {...field} className="w-full p-2 border rounded">
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    {/* Add more language options as needed */}
                  </select>
                </div>
              )}
            />
            <Controller
              name="targetAudience"
              control={control}
              rules={{ required: 'Target audience is required' }}
              render={({ field }) => (
                <div>
                  <label className="block mb-1">Target Audience</label>
                  <input {...field} type="text" placeholder="e.g., Young professionals" className="w-full p-2 border rounded" />
                </div>
              )}
            />
            <Controller
              name="industry"
              control={control}
              rules={{ required: 'Industry is required' }}
              render={({ field }) => (
                <div>
                  <label className="block mb-1">Industry/Niche</label>
                  <input {...field} type="text" placeholder="e.g., Technology, Fashion" className="w-full p-2 border rounded" />
                </div>
              )}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Create New Project</h1>
      <div className="mb-8">
        <div className="flex justify-between items-center">
          {[1, 2, 3, 4, 5].map((step) => (
            <div
              key={step}
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep >= step ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
            >
              {step}
            </div>
          ))}
        </div>
        <div className="h-2 bg-gray-200 mt-2">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
          ></div>
        </div>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {renderStep()}
        {generalError && <p className="text-red-500">{generalError}</p>}
        <div className="flex justify-between mt-8">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Previous
            </button>
          )}
          {currentStep < 5 ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
            >
              {isSubmitting ? 'Creating...' : 'Create Project'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default UV_ProjectCreation;