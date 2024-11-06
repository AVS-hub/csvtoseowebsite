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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    switch (name) {
      case 'projectName':
        setProjectName(value);
        break;
      case 'projectType':
        setProjectType(value as typeof projectType);
        break;
      case 'primaryLanguage':
        setPrimaryLanguage(value);
        break;
      case 'targetAudience':
        setTargetAudience(value);
        break;
      case 'industry':
        setIndustry(value);
        break;
    }
  };

  const validateProjectName = useCallback(debounce(async (name: string) => {
    try {
      const response = await axios.post('http://localhost:1337/api/projects/validate-name', { name });
      if (!response.data.isValid) {
        setErrorMessages(prev => ({ ...prev, projectName: 'Project name already exists' }));
      } else {
        setErrorMessages(prev => ({ ...prev, projectName: null }));
      }
    } catch (error) {
      console.error('Error validating project name:', error);
    }
  }, 300), []);

  useEffect(() => {
    if (projectName) {
      validateProjectName(projectName);
    }
  }, [projectName, validateProjectName]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCsvFile(file);
      const formData = new FormData();
      formData.append('file', file);
      try {
        const response = await axios.post('http://localhost:1337/api/projects/validate-csv', formData);
        setCsvPreview(response.data.preview);
        setErrorMessages(prev => ({ ...prev, csvFile: null }));
      } catch (error) {
        console.error('Error uploading CSV:', error);
        setErrorMessages(prev => ({ ...prev, csvFile: 'Invalid CSV format' }));
      }
    }
  };

  const validateStep = () => {
    let isValid = true;
    const newErrorMessages = { ...errorMessages };

    switch (currentStep) {
      case 1:
        if (!projectName) {
          newErrorMessages.projectName = 'Project name is required';
          isValid = false;
        }
        break;
      case 2:
        if (!projectType) {
          newErrorMessages.projectType = 'Project type is required';
          isValid = false;
        }
        break;
      case 4:
        if (!csvFile) {
          newErrorMessages.csvFile = 'CSV file is required';
          isValid = false;
        }
        break;
    }

    setErrorMessages(newErrorMessages);
    return isValid;
  };

  const nextStep = () => {
    if (validateStep()) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const previousStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleTemplateSelection = (templateId: string) => {
    setSelectedTemplate(templateId);
  };

  const createProject = async () => {
    if (!validateStep()) return;

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
      const newProjectId = response.data.project_id;

      if (csvFile) {
        const formData = new FormData();
        formData.append('file', csvFile);
        await axios.post(`http://localhost:1337/api/projects/${newProjectId}/csv`, formData);
      }

      dispatch(set_current_project(newProjectId));
      navigate(`/projects/${newProjectId}`);
    } catch (error) {
      console.error('Error creating project:', error);
      setErrorMessages(prev => ({ ...prev, general: 'Failed to create project. Please try again.' }));
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

      const response = await axios.post('http://localhost:1337/api/projects/draft', draftData);
      alert('Project saved as draft successfully!');
    } catch (error) {
      console.error('Error saving draft:', error);
      alert('Failed to save draft. Please try again.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Create New Project</h1>
      <div className="mb-8">
        <div className="flex justify-between items-center">
          {[1, 2, 3, 4, 5].map((step) => (
            <div
              key={step}
              className={`w-1/5 text-center ${
                currentStep >= step ? 'text-blue-600' : 'text-gray-400'
              }`}
            >
              <div
                className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${
                  currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200'
                }`}
              >
                {step}
              </div>
              <div className="mt-2">Step {step}</div>
            </div>
          ))}
        </div>
        <div className="h-2 bg-gray-200 rounded-full mt-4">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
          ></div>
        </div>
      </div>

      {currentStep === 1 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Project Name</h2>
          <input
            type="text"
            name="projectName"
            value={projectName}
            onChange={handleInputChange}
            placeholder="Enter project name"
            className="w-full p-2 border rounded"
            aria-label="Project Name"
          />
          {errorMessages.projectName && (
            <p className="text-red-500 mt-2">{errorMessages.projectName}</p>
          )}
        </div>
      )}

      {currentStep === 2 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Project Type</h2>
          <select
            name="projectType"
            value={projectType || ''}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            aria-label="Project Type"
          >
            <option value="">Select a project type</option>
            <option value="blog">Blog</option>
            <option value="business">Business Website</option>
            <option value="ecommerce">E-commerce</option>
            <option value="portfolio">Portfolio</option>
            <option value="custom">Custom</option>
          </select>
          {errorMessages.projectType && (
            <p className="text-red-500 mt-2">{errorMessages.projectType}</p>
          )}
        </div>
      )}

      {currentStep === 3 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Template Selection</h2>
          <div className="grid grid-cols-3 gap-4">
            {/* Replace with actual template data */}
            {[1, 2, 3, 4, 5, 6].map((template) => (
              <div
                key={template}
                className={`border p-4 rounded cursor-pointer ${
                  selectedTemplate === `template_${template}` ? 'border-blue-600' : ''
                }`}
                onClick={() => handleTemplateSelection(`template_${template}`)}
              >
                <img
                  src={`https://picsum.photos/seed/${template}/200/100`}
                  alt={`Template ${template}`}
                  className="w-full h-32 object-cover mb-2"
                />
                <p className="text-center">Template {template}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {currentStep === 4 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">CSV Upload</h2>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="mb-4"
            aria-label="Upload CSV file"
          />
          {errorMessages.csvFile && (
            <p className="text-red-500 mb-2">{errorMessages.csvFile}</p>
          )}
          {csvPreview.length > 0 && (
            <div>
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
        </div>
      )}

      {currentStep === 5 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Initial Settings</h2>
          <div className="mb-4">
            <label className="block mb-2">Primary Language</label>
            <select
              name="primaryLanguage"
              value={primaryLanguage}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              aria-label="Primary Language"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              {/* Add more language options as needed */}
            </select>
          </div>
          <div className="mb-4">
            <label className="block mb-2">Target Audience</label>
            <input
              type="text"
              name="targetAudience"
              value={targetAudience}
              onChange={handleInputChange}
              placeholder="Enter target audience"
              className="w-full p-2 border rounded"
              aria-label="Target Audience"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">Industry/Niche</label>
            <input
              type="text"
              name="industry"
              value={industry}
              onChange={handleInputChange}
              placeholder="Enter industry or niche"
              className="w-full p-2 border rounded"
              aria-label="Industry or Niche"
            />
          </div>
        </div>
      )}

      <div className="mt-8 flex justify-between">
        {currentStep > 1 && (
          <button
            onClick={previousStep}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded"
          >
            Previous
          </button>
        )}
        {currentStep < 5 ? (
          <button
            onClick={nextStep}
            className="bg-blue-600 text-white px-4 py-2 rounded ml-auto"
          >
            Next
          </button>
        ) : (
          <div>
            <button
              onClick={createProject}
              disabled={isSubmitting}
              className={`bg-green-600 text-white px-4 py-2 rounded ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Creating...' : 'Create Project'}
            </button>
            <button
              onClick={saveAsDraft}
              className="bg-gray-500 text-white px-4 py-2 rounded ml-2"
            >
              Save as Draft
            </button>
          </div>
        )}
      </div>

      {errorMessages.general && (
        <p className="text-red-500 mt-4">{errorMessages.general}</p>
      )}
    </div>
  );
};

export default UV_ProjectCreation;