import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch, set_current_project } from '@/store/main';
import axios from 'axios';
import { debounce } from 'lodash';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

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
    <>
      <div className="min-h-screen flex flex-col">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-2xl font-bold text-gray-900">Project Creation Wizard</h1>
          </div>
        </header>

        <main className="flex-grow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Progress value={(currentStep / 5) * 100} className="mb-8" />

            <div className="bg-white shadow-sm rounded-lg p-6">
              {currentStep === 1 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Name Your Project</h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="projectName">Project Name</Label>
                      <Input
                        id="projectName"
                        name="projectName"
                        value={projectName}
                        onChange={handleInputChange}
                        placeholder="Enter project name"
                      />
                      {errorMessages.projectName && (
                        <p className="text-red-500 text-sm mt-1">{errorMessages.projectName}</p>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      Choose a unique name for your project. This will help you identify it later.
                    </p>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Project Type</h2>
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
                    <p className="text-red-500 text-sm mt-1">{errorMessages.projectType}</p>
                  )}
                </div>
              )}

              {currentStep === 3 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Select Template</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((templateId) => (
                      <div
                        key={templateId}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          selectedTemplate === `${templateId}` ? 'border-blue-600 ring-2 ring-blue-600' : 'hover:border-blue-400'
                        }`}
                        onClick={() => selectTemplate(`${templateId}`)}
                      >
                        <img
                          src={`https://picsum.photos/seed/${templateId}/300/200`}
                          alt={`Template ${templateId}`}
                          className="w-full h-40 object-cover rounded-md mb-2"
                        />
                        <p className="text-center font-medium">Template {templateId}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Upload CSV</h2>
                  <Input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="mb-4"
                  />
                  {errorMessages.csvFile && (
                    <p className="text-red-500 text-sm mt-1">{errorMessages.csvFile}</p>
                  )}
                  {csvPreview.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-lg font-semibold mb-2">CSV Preview</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="border p-2 text-left">Title</th>
                              <th className="border p-2 text-left">URL Slug</th>
                              <th className="border p-2 text-left">Description</th>
                            </tr>
                          </thead>
                          <tbody>
                            {csvPreview.map((row, index) => (
                              <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                                <td className="border p-2">{row.title}</td>
                                <td className="border p-2">{row.url_slug}</td>
                                <td className="border p-2">{row.description}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {currentStep === 5 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Initial Settings</h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="primaryLanguage">Primary Language</Label>
                      <select
                        id="primaryLanguage"
                        name="primaryLanguage"
                        value={primaryLanguage}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="targetAudience">Target Audience</Label>
                      <Input
                        id="targetAudience"
                        name="targetAudience"
                        value={targetAudience}
                        onChange={handleInputChange}
                        placeholder="Enter target audience"
                      />
                    </div>
                    <div>
                      <Label htmlFor="industry">Industry/Niche</Label>
                      <Input
                        id="industry"
                        name="industry"
                        value={industry}
                        onChange={handleInputChange}
                        placeholder="Enter industry or niche"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>

        <footer className="bg-gray-50 border-t">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <Button
                variant="secondary"
                onClick={saveAsDraft}
              >
                Save as Draft
              </Button>
              <div className="space-x-4">
                {currentStep > 1 && (
                  <Button
                    variant="outline"
                    onClick={previousStep}
                  >
                    Previous
                  </Button>
                )}
                {currentStep < 5 ? (
                  <Button onClick={nextStep}>
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={createProject}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Creating...' : 'Create Project'}
                  </Button>
                )}
              </div>
            </div>
            {errorMessages.general && (
              <p className="text-red-500 text-sm mt-2">{errorMessages.general}</p>
            )}
          </div>
        </footer>
      </div>
    </>
  );
};

export default UV_ProjectCreation;