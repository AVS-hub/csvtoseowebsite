import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch, set_current_project } from '@/store/main';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronRight, ChevronLeft, Upload, Check } from "lucide-react";

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
            <h2 className="text-2xl font-bold">Step 1: Project Name</h2>
            <div className="space-y-2">
              <Label htmlFor="projectName">Project Name</Label>
              <Controller
                name="projectName"
                control={control}
                rules={{ required: 'Project name is required' }}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="projectName"
                    placeholder="Enter project name"
                    className="w-full"
                  />
                )}
              />
              {errors.projectName && <p className="text-sm text-red-500">{errors.projectName.message}</p>}
              <p className="text-sm text-gray-500">Choose a unique and descriptive name for your project.</p>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Step 2: Project Type</h2>
            <div className="space-y-2">
              <Label htmlFor="projectType">Project Type</Label>
              <Controller
                name="projectType"
                control={control}
                rules={{ required: 'Project type is required' }}
                render={({ field }) => (
                  <select {...field} id="projectType" className="w-full p-2 border rounded">
                    <option value="">Select project type</option>
                    <option value="blog">Blog</option>
                    <option value="business">Business Website</option>
                    <option value="ecommerce">E-commerce</option>
                    <option value="portfolio">Portfolio</option>
                    <option value="custom">Custom</option>
                  </select>
                )}
              />
              {errors.projectType && <p className="text-sm text-red-500">{errors.projectType.message}</p>}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Step 3: Template Selection</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['template1', 'template2', 'template3'].map((template) => (
                <div
                  key={template}
                  className={`p-4 border rounded cursor-pointer transition-all ${
                    watch('selectedTemplate') === template ? 'border-blue-500 shadow-lg' : 'hover:border-blue-300'
                  }`}
                  onClick={() => setValue('selectedTemplate', template)}
                >
                  <img src={`https://picsum.photos/seed/${template}/200/100`} alt={`Template ${template}`} className="w-full h-32 object-cover mb-2 rounded" />
                  <p className="text-center font-semibold">{template}</p>
                  {watch('selectedTemplate') === template && (
                    <div className="flex justify-center mt-2">
                      <Check className="text-blue-500" size={20} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Step 4: CSV Upload</h2>
            <div className="space-y-2">
              <Label htmlFor="csvFile">Upload CSV File</Label>
              <Controller
                name="csvFile"
                control={control}
                rules={{ required: 'CSV file is required' }}
                render={({ field: { onChange, ...rest } }) => (
                  <div className="flex items-center space-x-2">
                    <Input
                      type="file"
                      accept=".csv"
                      onChange={(e) => {
                        onChange(e.target.files);
                        handleFileUpload(e);
                      }}
                      {...rest}
                      id="csvFile"
                      className="w-full"
                    />
                    <Upload className="text-gray-500" size={20} />
                  </div>
                )}
              />
              {errors.csvFile && <p className="text-sm text-red-500">{errors.csvFile.message}</p>}
            </div>
            {csvPreview.length > 0 && (
              <div className="mt-4">
                <h3 className="text-xl font-semibold">CSV Preview</h3>
                <div className="overflow-x-auto">
                  <table className="w-full mt-2 border-collapse border">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border p-2">Title</th>
                        <th className="border p-2">URL Slug</th>
                        <th className="border p-2">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {csvPreview.slice(0, 5).map((row, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                          <td className="border p-2">{row.title}</td>
                          <td className="border p-2">{row.url_slug}</td>
                          <td className="border p-2">{row.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
            <h2 className="text-2xl font-bold">Step 5: Initial Settings</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="primaryLanguage">Primary Language</Label>
                <Controller
                  name="primaryLanguage"
                  control={control}
                  rules={{ required: 'Primary language is required' }}
                  render={({ field }) => (
                    <select {...field} id="primaryLanguage" className="w-full p-2 border rounded">
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                    </select>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetAudience">Target Audience</Label>
                <Controller
                  name="targetAudience"
                  control={control}
                  rules={{ required: 'Target audience is required' }}
                  render={({ field }) => (
                    <Input {...field} id="targetAudience" placeholder="e.g., Young professionals" className="w-full" />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industry/Niche</Label>
                <Controller
                  name="industry"
                  control={control}
                  rules={{ required: 'Industry is required' }}
                  render={({ field }) => (
                    <Input {...field} id="industry" placeholder="e.g., Technology, Fashion" className="w-full" />
                  )}
                />
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">Project Creation Wizard</h1>
      <p className="text-gray-600 mb-6">Create your new project in just a few steps</p>
      
      <div className="mb-8">
        <div className="flex justify-between items-center">
          {[1, 2, 3, 4, 5].map((step) => (
            <div
              key={step}
              className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold transition-all ${
                currentStep >= step
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {step}
            </div>
          ))}
        </div>
        <div className="h-2 bg-gray-200 mt-2 rounded-full">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
          ></div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          {renderStep()}
        </div>

        {generalError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{generalError}</span>
          </div>
        )}

        <div className="flex justify-between mt-8">
          {currentStep > 1 && (
            <Button
              type="button"
              onClick={prevStep}
              variant="outline"
              className="flex items-center"
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
          )}
          {currentStep < 5 ? (
            <Button
              type="button"
              onClick={nextStep}
              className="flex items-center ml-auto"
            >
              Next <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <div className="flex space-x-4 ml-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  // Implement save as draft functionality
                  console.log("Save as draft");
                }}
              >
                Save as Draft
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Project'}
              </Button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default UV_ProjectCreation;