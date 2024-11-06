import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch, set_current_project } from '@/store/main';
import axios from 'axios';
import { debounce } from 'lodash';

const UV_ProjectCreation: React.FC = () => {
  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();
  const userProfile = useSelector((state: RootState) => state.user_profile);

  const [currentStep, setCurrentStep] = useState(1);
  const [projectName, setProjectName] = useState('');
  const [projectType, setProjectType] = useState<'blog' | 'business' | 'ecommerce' | 'portfolio' | 'custom' | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<Array<{ title: string; url_slug: string; description: string }>>([]);
  const [primaryLanguage, setPrimaryLanguage] = useState('en');
  const [targetAudience, setTargetAudience] = useState('');
  const [industry, setIndustry] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessages, setErrorMessages] = useState({
    projectName: null,
    projectType: null,
    csvFile: null,
    general: null,
  });

  const projectTypes = [
    { value: 'blog', label: 'Blog' },
    { value: 'business', label: 'Business Website' },
    { value: 'ecommerce', label: 'E-commerce' },
    { value: 'portfolio', label: 'Portfolio' },
    { value: 'custom', label: 'Custom' },
  ];

  const templates = [
    { id: 'template1', name: 'Modern Blog', image: 'https://picsum.photos/seed/template1/300/200' },
    { id: 'template2', name: 'Corporate Site', image: 'https://picsum.photos/seed/template2/300/200' },
    { id: 'template3', name: 'Online Store', image: 'https://picsum.photos/seed/template3/300/200' },
    { id: 'template4', name: 'Creative Portfolio', image: 'https://picsum.photos/seed/template4/300/200' },
  ];

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => 
    debounce((value: string) => setter(value), 300);

  const validateStep = (step: number): boolean => {
    let isValid = true;
    const newErrorMessages = { ...errorMessages };

    if (step === 1) {
      if (!projectName.trim()) {
        newErrorMessages.projectName = 'Project name is required';
        isValid = false;
      } else {
        newErrorMessages.projectName = null;
      }
    } else if (step === 2) {
      if (!projectType) {
        newErrorMessages.projectType = 'Please select a project type';
        isValid = false;
      } else {
        newErrorMessages.projectType = null;
      }
    }

    setErrorMessages(newErrorMessages);
    return isValid;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCsvFile(file);
      try {
        const formData = new FormData();
        formData.append('file', file);
        const response = await axios.post('http://localhost:1337/api/projects/upload-csv', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setCsvPreview(response.data.preview);
      } catch (error) {
        console.error('Error uploading CSV:', error);
        setErrorMessages({ ...errorMessages, csvFile: 'Error uploading CSV file' });
      }
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleCreateProject = async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    try {
      const projectData = {
        name: projectName,
        type: projectType,
        template_id: selectedTemplate,
        primary_language: primaryLanguage,
        target_audience: targetAudience,
        industry: industry,
      };

      const response = await axios.post('http://localhost:1337/api/projects', projectData);
      dispatch(set_current_project(response.data.project_id));
      navigate(`/projects/${response.data.project_id}`);
    } catch (error) {
      console.error('Error creating project:', error);
      setErrorMessages({ ...errorMessages, general: 'Error creating project. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveAsDraft = async () => {
    try {
      const draftData = {
        name: projectName,
        type: projectType,
        template_id: selectedTemplate,
        primary_language: primaryLanguage,
        target_audience: targetAudience,
        industry: industry,
        status: 'draft',
      };

      await axios.post('http://localhost:1337/api/projects/draft', draftData);
      // Show success message or update UI to indicate draft was saved
    } catch (error) {
      console.error('Error saving draft:', error);
      setErrorMessages({ ...errorMessages, general: 'Error saving draft. Please try again.' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Create New Project</h1>
      
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map((step) => (
            <React.Fragment key={step}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep >= step ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {step}
              </div>
              {step < 5 && (
                <div className={`flex-1 h-1 ${
                  currentStep > step ? 'bg-blue-500' : 'bg-gray-200'
                }`}></div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step 1: Project Name */}
      {currentStep === 1 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Project Name</h2>
          <input
            type="text"
            value={projectName}
            onChange={(e) => handleInputChange(setProjectName)(e.target.value)}
            placeholder="Enter project name"
            className="w-full p-2 border rounded"
            aria-label="Project Name"
          />
          {errorMessages.projectName && (
            <p className="text-red-500 mt-2">{errorMessages.projectName}</p>
          )}
        </div>
      )}

      {/* Step 2: Project Type */}
      {currentStep === 2 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Project Type</h2>
          <div className="grid grid-cols-2 gap-4">
            {projectTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setProjectType(type.value as any)}
                className={`p-4 border rounded ${
                  projectType === type.value ? 'bg-blue-100 border-blue-500' : ''
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
          {errorMessages.projectType && (
            <p className="text-red-500 mt-2">{errorMessages.projectType}</p>
          )}
        </div>
      )}

      {/* Step 3: Template Selection */}
      {currentStep === 3 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Select Template</h2>
          <div className="grid grid-cols-2 gap-4">
            {templates.map((template) => (
              <div
                key={template.id}
                onClick={() => setSelectedTemplate(template.id)}
                className={`cursor-pointer border rounded p-4 ${
                  selectedTemplate === template.id ? 'border-blue-500' : ''
                }`}
              >
                <img src={template.image} alt={template.name} className="w-full h-40 object-cover mb-2" />
                <p className="text-center">{template.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 4: CSV Upload */}
      {currentStep === 4 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Upload CSV</h2>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="mb-4"
          />
          {csvPreview.length > 0 && (
            <div className="mt-4">
              <h3 className="text-xl font-semibold mb-2">CSV Preview</h3>
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border p-2">Title</th>
                    <th className="border p-2">URL Slug</th>
                    <th className="border p-2">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {csvPreview.map((row, index) => (
                    <tr key={index}>
                      <td className="border p-2">{row.title}</td>
                      <td className="border p-2">{row.url_slug}</td>
                      <td className="border p-2">{row.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {errorMessages.csvFile && (
            <p className="text-red-500 mt-2">{errorMessages.csvFile}</p>
          )}
        </div>
      )}

      {/* Step 5: Initial Settings */}
      {currentStep === 5 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Initial Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block mb-2">Primary Language</label>
              <select
                value={primaryLanguage}
                onChange={(e) => setPrimaryLanguage(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                {/* Add more language options as needed */}
              </select>
            </div>
            <div>
              <label className="block mb-2">Target Audience</label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => handleInputChange(setTargetAudience)(e.target.value)}
                placeholder="Describe your target audience"
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block mb-2">Industry/Niche</label>
              <input
                type="text"
                value={industry}
                onChange={(e) => handleInputChange(setIndustry)(e.target.value)}
                placeholder="Enter your industry or niche"
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="mt-8 flex justify-between">
        {currentStep > 1 && (
          <button
            onClick={previousStep}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            Previous
          </button>
        )}
        {currentStep < 5 ? (
          <button
            onClick={nextStep}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleCreateProject}
            disabled={isSubmitting}
            className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create Project'}
          </button>
        )}
      </div>

      {/* Save as Draft Button */}
      <div className="mt-4">
        <button
          onClick={saveAsDraft}
          className="px-4 py-2 bg-gray-500 text-white rounded"
        >
          Save as Draft
        </button>
      </div>

      {/* General Error Message */}
      {errorMessages.general && (
        <p className="text-red-500 mt-4">{errorMessages.general}</p>
      )}
    </div>
  );
};

export default UV_ProjectCreation;