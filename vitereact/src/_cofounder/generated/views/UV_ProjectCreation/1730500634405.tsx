import React, { useState, useCallback, useEffect } from 'react';
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
        setProjectType(value as 'blog' | 'business' | 'ecommerce' | 'portfolio' | 'custom');
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCsvFile(file);
      const formData = new FormData();
      formData.append('file', file);
      try {
        const response = await axios.post('http://localhost:1337/api/projects/csv', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setCsvPreview(response.data.preview);
        setErrorMessages({ ...errorMessages, csvFile: null });
      } catch (error) {
        setErrorMessages({ ...errorMessages, csvFile: 'Error uploading CSV file. Please try again.' });
      }
    }
  };

  const validateStep = (step: number): boolean => {
    let isValid = true;
    const newErrorMessages = { ...errorMessages };

    switch (step) {
      case 1:
        if (!projectName.trim()) {
          newErrorMessages.projectName = 'Project name is required';
          isValid = false;
        } else {
          newErrorMessages.projectName = null;
        }
        break;
      case 2:
        if (!projectType) {
          newErrorMessages.projectType = 'Please select a project type';
          isValid = false;
        } else {
          newErrorMessages.projectType = null;
        }
        break;
      case 4:
        if (!csvFile) {
          newErrorMessages.csvFile = 'Please upload a CSV file';
          isValid = false;
        } else {
          newErrorMessages.csvFile = null;
        }
        break;
    }

    setErrorMessages(newErrorMessages);
    return isValid;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const selectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
  };

  const createProject = async () => {
    if (validateStep(5)) {
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
        setErrorMessages({ ...errorMessages, general: 'Error creating project. Please try again.' });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const saveAsDraft = useCallback(debounce(async () => {
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
      await axios.post('http://localhost:1337/api/projects', draftData);
      // Show a success message to the user
    } catch (error) {
      // Show an error message to the user
    }
  }, 1000), [projectName, projectType, selectedTemplate, primaryLanguage, targetAudience, industry]);

  useEffect(() => {
    saveAsDraft();
  }, [projectName, projectType, selectedTemplate, primaryLanguage, targetAudience, industry, saveAsDraft]);

  return (
    <div className="max-w-4xl mx-auto p-6">
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
          >
            <option value="">Select project type</option>
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
          <h2 className="text-2xl font-semibold mb-4">Select Template</h2>
          <div className="grid grid-cols-3 gap-4">
            {/* Replace with actual template data */}
            {[1, 2, 3, 4, 5, 6].map((templateId) => (
              <div
                key={templateId}
                className={`border p-4 cursor-pointer ${
                  selectedTemplate === `${templateId}` ? 'border-blue-600' : ''
                }`}
                onClick={() => selectTemplate(`${templateId}`)}
              >
                <img
                  src={`https://picsum.photos/seed/${templateId}/200/100`}
                  alt={`Template ${templateId}`}
                  className="w-full h-32 object-cover mb-2"
                />
                <p className="text-center">Template {templateId}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {currentStep === 4 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Upload CSV</h2>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="mb-4"
          />
          {errorMessages.csvFile && (
            <p className="text-red-500 mt-2">{errorMessages.csvFile}</p>
          )}
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
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              {/* Add more language options */}
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
          <button
            onClick={createProject}
            disabled={isSubmitting}
            className="bg-green-600 text-white px-4 py-2 rounded ml-auto"
          >
            {isSubmitting ? 'Creating...' : 'Create Project'}
          </button>
        )}
      </div>

      {errorMessages.general && (
        <p className="text-red-500 mt-4">{errorMessages.general}</p>
      )}
    </div>
  );
};

export default UV_ProjectCreation;