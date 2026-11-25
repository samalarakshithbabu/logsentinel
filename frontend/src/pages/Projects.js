import React, { useState, useEffect } from 'react';
import { projectsAPI } from '../services/api';
import { useForm } from 'react-hook-form';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await projectsAPI.list();
      setProjects(response.data);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      await projectsAPI.create(data);
      setShowModal(false);
      reset();
      fetchProjects();
    } catch (err) {
      console.error('Failed to create project:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await projectsAPI.delete(id);
        fetchProjects();
      } catch (err) {
        console.error('Failed to delete project:', err);
      }
    }
  };

  const copyApiKey = (key) => {
    navigator.clipboard.writeText(key);
    alert('API key copied to clipboard');
  };

  if (loading) {
    return <div className="loading">Loading projects...</div>;
  }

  return (
    <div className="projects-page">
      <div className="page-header">
        <h1>Projects</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <p>No projects yet. Create your first project to start logging errors.</p>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            Create Project
          </button>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map(project => (
            <div key={project.id} className="project-card">
              <div className="project-header">
                <h3>{project.name}</h3>
                <span className={`badge ${project.is_active ? 'active' : 'inactive'}`}>
                  {project.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="project-description">{project.description}</p>
              <div className="project-api-key">
                <label>API Key:</label>
                <div className="api-key-display">
                  <code>{project.api_key}</code>
                  <button onClick={() => copyApiKey(project.api_key)} className="copy-btn">
                    Copy
                  </button>
                </div>
              </div>
              <div className="project-actions">
                <button className="btn-secondary">View Errors</button>
                <button className="btn-danger" onClick={() => handleDelete(project.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Create New Project</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="form-group">
                <label htmlFor="name">Project Name</label>
                <input
                  type="text"
                  id="name"
                  {...register('name', { required: 'Name is required' })}
                  className={errors.name ? 'error' : ''}
                />
                {errors.name && <span className="error-text">{errors.name.message}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  {...register('description')}
                  rows={3}
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;