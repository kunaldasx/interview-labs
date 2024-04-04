import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { candidatesAPI } from '../../api/candidates';
import type { WorkExperience } from '../../types/candidate';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import toast from 'react-hot-toast';

export default function CandidateRegistrationPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    date_of_birth: '',
    linkedin_url: '',
    portfolio_url: '',
    experience_years: 0,
    education: '',
  });
  const [skills, setSkills] = useState<string[]>([]);
  const [workExperiences, setWorkExperiences] = useState<WorkExperience[]>([]);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isParsed, setIsParsed] = useState(false);

  const handleResumeUpload = async (file: File) => {
    setResumeFile(file);
    setIsParsing(true);
    setIsParsed(false);

    try {
      const parsed = await candidatesAPI.parseResume(file);
      const newForm = {
        full_name: parsed.full_name || '',
        email: parsed.email || '',
        phone: parsed.phone || '',
        address: parsed.address || '',
        date_of_birth: parsed.date_of_birth || '',
        linkedin_url: parsed.linkedin_url || '',
        portfolio_url: parsed.portfolio_url || '',
        experience_years: parsed.experience_years || 0,
        education: parsed.education || '',
      };
      setForm(newForm);
      setSkills(parsed.skills || []);
      setWorkExperiences(parsed.work_experiences || []);
      setIsParsed(true);
      const hasData = newForm.full_name || newForm.email || newForm.phone;
      toast.success(hasData ? 'Resume parsed — all fields auto-filled' : 'Resume uploaded but no fields could be extracted. Please fill manually.');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Resume parsing failed. Please fill fields manually.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleResumeUpload(file);
    }
  };

  const createMutation = useMutation({
    mutationFn: candidatesAPI.create,
    onSuccess: async (candidate) => {
      if (resumeFile) {
        try {
          await candidatesAPI.uploadResume(candidate.id, resumeFile);
          toast.success('Candidate registered with resume');
        } catch {
          toast.success('Candidate registered (resume link failed)');
        }
      } else {
        toast.success('Candidate registered successfully');
      }
      navigate(`/candidates/${candidate.id}`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Registration failed');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...form,
      date_of_birth: form.date_of_birth || undefined,
      linkedin_url: form.linkedin_url || undefined,
      portfolio_url: form.portfolio_url || undefined,
      address: form.address || undefined,
      skills: skills.length > 0 ? { skills } : undefined,
      work_experiences: workExperiences.length > 0 ? workExperiences : undefined,
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-10">
      <h1 className="text-2xl font-bold text-gray-900">Register Candidate</h1>

      {/* Resume Upload */}
      <Card>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Upload Resume</h2>
              <p className="text-sm text-gray-500">Upload a resume to auto-fill all candidate details</p>
            </div>
            {isParsed && (
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-700 bg-green-50 px-3 py-1 rounded-full">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Parsed
              </span>
            )}
          </div>

          <div
            className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isParsing ? 'border-indigo-300 bg-indigo-50' : resumeFile ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
            }`}
          >
            {isParsing ? (
              <div className="flex flex-col items-center gap-2">
                <svg className="w-8 h-8 text-indigo-500 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <p className="text-sm font-medium text-indigo-700">Parsing resume with AI...</p>
                <p className="text-xs text-indigo-500">Extracting personal details, skills, and work history</p>
              </div>
            ) : resumeFile ? (
              <div className="flex flex-col items-center gap-2">
                <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm font-medium text-gray-900">{resumeFile.name}</p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-indigo-600 hover:text-indigo-800 underline"
                >
                  Change file
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-sm text-gray-600">
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="font-medium text-indigo-600 hover:text-indigo-800">
                    Choose a file
                  </button>{' '}
                  or drag and drop
                </p>
                <p className="text-xs text-gray-400">PDF or DOCX up to 10MB</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.doc"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Details */}
        <Card>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Personal Details</h2>
              {isParsed && (
                <span className="text-xs text-gray-400">Auto-filled from resume</span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input id="name" label="Full Name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required disabled={isParsing} />
              <Input id="email" label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required disabled={isParsing} />
              <Input id="phone" label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} disabled={isParsing} />
              <Input id="dob" label="Date of Birth" type="date" value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} disabled={isParsing} />
            </div>

            <Input id="address" label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} disabled={isParsing} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input id="linkedin" label="LinkedIn URL" value={form.linkedin_url} onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })} disabled={isParsing} placeholder="https://linkedin.com/in/..." />
              <Input id="portfolio" label="Portfolio URL" value={form.portfolio_url} onChange={(e) => setForm({ ...form, portfolio_url: e.target.value })} disabled={isParsing} placeholder="https://..." />
            </div>
          </div>
        </Card>

        {/* Professional Details */}
        <Card>
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Professional Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input id="experience" label="Years of Experience" type="number" value={form.experience_years} onChange={(e) => setForm({ ...form, experience_years: parseInt(e.target.value) || 0 })} disabled={isParsing} />
              <Input id="education" label="Education" value={form.education} onChange={(e) => setForm({ ...form, education: e.target.value })} disabled={isParsing} />
            </div>

            {/* Skills */}
            {skills.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => setSkills(skills.filter((_, i) => i !== idx))}
                        className="text-indigo-400 hover:text-indigo-600"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Work Experience */}
        {workExperiences.length > 0 && (
          <Card>
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Work Experience</h2>

              <div className="space-y-3">
                {workExperiences.map((exp, idx) => (
                  <div key={idx} className="relative border border-gray-200 rounded-lg p-4">
                    <button
                      type="button"
                      onClick={() => setWorkExperiences(workExperiences.filter((_, i) => i !== idx))}
                      className="absolute top-3 right-3 text-gray-400 hover:text-red-500"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>

                    <div className="pr-8">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{exp.job_title}</h3>
                          <p className="text-sm text-indigo-600">{exp.company_name}</p>
                        </div>
                        {exp.is_current && (
                          <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">Current</span>
                        )}
                      </div>

                      <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                        {(exp.start_date || exp.end_date) && (
                          <span>{exp.start_date}{exp.start_date && exp.end_date ? ' — ' : ''}{exp.end_date}</span>
                        )}
                        {exp.location && (
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {exp.location}
                          </span>
                        )}
                      </div>

                      {exp.description && (
                        <p className="mt-2 text-sm text-gray-600 leading-relaxed">{exp.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button type="submit" isLoading={createMutation.isPending} disabled={isParsing}>Register</Button>
          <Button type="button" variant="outline" onClick={() => navigate('/candidates')}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
