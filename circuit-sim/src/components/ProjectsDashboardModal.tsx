import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Edit2,
  Trash2,
  Copy,
  Download,
  Clock,
  Cpu,
  Sparkles,
  ExternalLink,
  Check,
  LogOut,
} from 'lucide-react';
import { authService } from '../services/authService';
import type { SavedProject, UserProfile } from '../types';

interface ProjectsDashboardModalProps {
  isOpen: boolean;
  user: UserProfile | null;
  currentProjectId?: string;
  onClose: () => void;
  onOpenProject: (project: SavedProject) => void;
  onCreateNewProject: () => void;
  onOpenAuth: () => void;
  onSignOut?: () => void;
}

export const ProjectsDashboardModal: React.FC<ProjectsDashboardModalProps> = ({
  isOpen,
  user,
  currentProjectId,
  onClose,
  onOpenProject,
  onCreateNewProject,
  onOpenAuth,
  onSignOut,
}) => {
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const loadUserProjects = React.useCallback(async () => {
    const targetUserId = user ? user.id : 'guest_user';
    try {
      const list = await authService.getProjectsAsync(targetUserId);
      setProjects(list);
    } catch {
      setProjects(authService.getProjects(targetUserId));
    }
  }, [user]);

  useEffect(() => {
    if (isOpen) {
      loadUserProjects();
    }
  }, [isOpen, loadUserProjects]);

  if (!isOpen) return null;

  const handleStartRename = (p: SavedProject) => {
    setEditingId(p.id);
    setEditingName(p.name);
  };

  const handleSaveRename = (projectId: string) => {
    const targetUserId = user ? user.id : 'guest_user';
    if (!editingName.trim()) return;
    try {
      authService.renameProject(targetUserId, projectId, editingName);
      setEditingId(null);
      loadUserProjects();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDuplicate = (projectId: string) => {
    const targetUserId = user ? user.id : 'guest_user';
    try {
      authService.duplicateProject(targetUserId, projectId);
      loadUserProjects();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = (projectId: string, name: string) => {
    const targetUserId = user ? user.id : 'guest_user';
    if (window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      try {
        authService.deleteProject(targetUserId, projectId);
        loadUserProjects();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const handleExportJson = (project: SavedProject) => {
    const data = JSON.stringify(
      {
        circuitName: project.name,
        components: project.components,
        wires: project.wires,
        code: project.code,
      },
      null,
      2
    );
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.replace(/[^a-z0-9]/gi, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    const now = Date.now();
    const diffMin = Math.round((now - ts) / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.round(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 990,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 780,
          maxHeight: '85vh',
          backgroundColor: '#ffffff',
          borderRadius: 16,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid #e2e8f0',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#F7F4EE',
            color: '#1F2321',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <img src="/voltflow-logo.png" alt="VoltFlow Studio" style={{ height: 52, objectFit: 'contain' }} />
            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, fontFamily: "'Playfair Display', Georgia, serif", color: '#1F2321' }}>Recent Projects</h2>
              <span style={{ fontSize: 12, color: '#5F6862' }}>
                {user ? `Workspace for ${user.displayName} (${projects.length} circuits)` : 'Sign in to sync your cloud circuits'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {user && (
              <>
                {onSignOut && (
                  <button
                    onClick={() => {
                      onSignOut();
                      onClose();
                    }}
                    title="Log out of your account"
                    style={{
                      padding: '8px 14px',
                      borderRadius: 8,
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      color: '#ef4444',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <LogOut size={16} /> Log Out
                  </button>
                )}
                <button
                  onClick={() => {
                    onCreateNewProject();
                    onClose();
                  }}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 8,
                    border: 'none',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: '0 2px 4px rgba(37, 99, 235, 0.3)',
                  }}
                >
                  <Plus size={16} /> New Circuit
                </button>
              </>
            )}
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: 6,
                borderRadius: 6,
              }}
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24, backgroundColor: '#f8fafc' }}>
          {!user ? (
            <div
              style={{
                textAlign: 'center',
                padding: '48px 24px',
                backgroundColor: '#ffffff',
                borderRadius: 12,
                border: '1px dashed #cbd5e1',
              }}
            >
              <Cpu size={40} color="#64748b" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
                Account Required for Cloud Projects
              </h3>
              <p style={{ margin: '0 0 20px', fontSize: 13, color: '#64748b', maxWidth: 360, marginLeft: 'auto', marginRight: 'auto' }}>
                Sign in to automatically save, load, and version your circuits with isolated cloud workspace storage.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onOpenAuth();
                }}
                style={{
                  padding: '10px 20px',
                  borderRadius: 8,
                  border: 'none',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Sign In / Register
              </button>
            </div>
          ) : projects.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '48px 24px',
                backgroundColor: '#ffffff',
                borderRadius: 12,
                border: '1px dashed #cbd5e1',
              }}
            >
              <Sparkles size={36} color="#2563eb" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
                No circuits saved yet
              </h3>
              <p style={{ margin: '0 0 20px', fontSize: 13, color: '#64748b' }}>
                Click "New Circuit" or save your current schematic to build your project library.
              </p>
              <button
                onClick={() => {
                  onCreateNewProject();
                  onClose();
                }}
                style={{
                  padding: '10px 18px',
                  borderRadius: 8,
                  border: 'none',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Plus size={16} /> Create First Circuit
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
              {projects.map((p) => {
                const isCurrent = currentProjectId === p.id;
                return (
                  <div
                    key={p.id}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: 12,
                      border: isCurrent ? '2px solid #2563eb' : '1px solid #e2e8f0',
                      padding: 16,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                      position: 'relative',
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                    }}
                  >
                    {/* Badge */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 999,
                          backgroundColor: isCurrent ? '#eff6ff' : '#f1f5f9',
                          color: isCurrent ? '#2563eb' : '#64748b',
                          border: isCurrent ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                        }}
                      >
                        {isCurrent ? 'ACTIVE' : 'PROJECT'}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          color: '#94a3b8',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <Clock size={12} /> {formatDate(p.updatedAt)}
                      </span>
                    </div>

                    {/* Circuit Title */}
                    <div>
                      {editingId === p.id ? (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(p.id)}
                            autoFocus
                            style={{
                              flex: 1,
                              padding: '4px 8px',
                              borderRadius: 6,
                              border: '1px solid #2563eb',
                              fontSize: 13,
                              fontWeight: 700,
                            }}
                          />
                          <button
                            onClick={() => handleSaveRename(p.id)}
                            style={{
                              background: '#2563eb',
                              border: 'none',
                              color: '#fff',
                              borderRadius: 6,
                              padding: '4px 8px',
                              cursor: 'pointer',
                            }}
                          >
                            <Check size={14} />
                          </button>
                        </div>
                      ) : (
                        <h4
                          style={{
                            margin: 0,
                            fontSize: 14,
                            fontWeight: 700,
                            color: '#0f172a',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                          title={p.name}
                        >
                          {p.name}
                        </h4>
                      )}

                      <div
                        style={{
                          display: 'flex',
                          gap: 12,
                          marginTop: 6,
                          fontSize: 11,
                          color: '#64748b',
                        }}
                      >
                        <span>{p.components?.length || 0} components</span>
                        <span>•</span>
                        <span>{p.wires?.length || 0} wires</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div
                      style={{
                        display: 'flex',
                        gap: 6,
                        marginTop: 'auto',
                        paddingTop: 10,
                        borderTop: '1px solid #f1f5f9',
                      }}
                    >
                      <button
                        onClick={() => {
                          onOpenProject(p);
                          onClose();
                        }}
                        style={{
                          flex: 1,
                          padding: '7px 10px',
                          borderRadius: 6,
                          border: 'none',
                          backgroundColor: '#0f172a',
                          color: '#ffffff',
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                        }}
                      >
                        Open <ExternalLink size={12} />
                      </button>

                      <button
                        onClick={() => handleStartRename(p)}
                        title="Rename Project"
                        style={{
                          padding: '7px 8px',
                          borderRadius: 6,
                          border: '1px solid #cbd5e1',
                          backgroundColor: '#ffffff',
                          color: '#475569',
                          cursor: 'pointer',
                        }}
                      >
                        <Edit2 size={13} />
                      </button>

                      <button
                        onClick={() => handleDuplicate(p.id)}
                        title="Duplicate Circuit"
                        style={{
                          padding: '7px 8px',
                          borderRadius: 6,
                          border: '1px solid #cbd5e1',
                          backgroundColor: '#ffffff',
                          color: '#475569',
                          cursor: 'pointer',
                        }}
                      >
                        <Copy size={13} />
                      </button>

                      <button
                        onClick={() => handleExportJson(p)}
                        title="Export JSON"
                        style={{
                          padding: '7px 8px',
                          borderRadius: 6,
                          border: '1px solid #cbd5e1',
                          backgroundColor: '#ffffff',
                          color: '#475569',
                          cursor: 'pointer',
                        }}
                      >
                        <Download size={13} />
                      </button>

                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        title="Delete Circuit"
                        style={{
                          padding: '7px 8px',
                          borderRadius: 6,
                          border: '1px solid #fecaca',
                          backgroundColor: '#fef2f2',
                          color: '#ef4444',
                          cursor: 'pointer',
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
