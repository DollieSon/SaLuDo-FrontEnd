/**
 * ScoringSettings Component
 * Admin page for configuring predictive success score weights and modifiers
 */

import React, { useState, useEffect, useCallback } from 'react';
import { scoringSettingsApi } from '../../utils/scoringApi';
import {
  ScoringPreferences,
  ScoringWeights,
  ScoringModifiers,
  PersonalityCategoryWeights,
  DEFAULT_SCORING_WEIGHTS,
  DEFAULT_PERSONALITY_CATEGORY_WEIGHTS,
  validateScoringWeights,
  validatePersonalityCategoryWeights,
} from '../../types/scoring';
import '../css/PredictiveScore.css';

interface ScoringSettingsProps {
  jobId?: string;  // If provided, edit job-specific settings
  onSave?: () => void;
}

interface Toast {
  message: string;
  type: 'success' | 'error';
}

export const ScoringSettings: React.FC<ScoringSettingsProps> = ({
  jobId,
  onSave,
}) => {
  // State
  const [settings, setSettings] = useState<ScoringPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [isJobSpecific, setIsJobSpecific] = useState(false);

  // Validation state
  const [weightsError, setWeightsError] = useState<string | null>(null);
  const [personalityWeightsError, setPersonalityWeightsError] = useState<string | null>(null);

  // Load settings
  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const result = jobId
        ? await scoringSettingsApi.getJobSettings(jobId)
        : await scoringSettingsApi.getGlobalSettings();

      if (result.success) {
        const effectiveSettings = 'effectiveSettings' in result
          ? (result as { effectiveSettings: ScoringPreferences }).effectiveSettings
          : result.settings;
        setSettings(effectiveSettings);
        setIsJobSpecific('isJobSpecific' in result ? (result as { isJobSpecific: boolean }).isJobSpecific : false);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      setToast({ message: 'Failed to load settings', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Validate weights when they change
  useEffect(() => {
    if (settings?.weights) {
      const validation = validateScoringWeights(settings.weights);
      setWeightsError(validation.valid ? null : validation.error || null);
    }
  }, [settings?.weights]);

  useEffect(() => {
    if (settings?.personalityCategoryWeights) {
      const validation = validatePersonalityCategoryWeights(settings.personalityCategoryWeights);
      setPersonalityWeightsError(validation.valid ? null : validation.error || null);
    }
  }, [settings?.personalityCategoryWeights]);

  // Calculate weight totals
  const weightsTotal = settings?.weights
    ? settings.weights.skillMatch +
      settings.weights.personalityFit +
      settings.weights.experience +
      settings.weights.education +
      settings.weights.profileQuality
    : 0;

  const personalityWeightsTotal = settings?.personalityCategoryWeights
    ? settings.personalityCategoryWeights.cognitiveAndProblemSolving +
      settings.personalityCategoryWeights.communicationAndTeamwork +
      settings.personalityCategoryWeights.workEthicAndReliability +
      settings.personalityCategoryWeights.growthAndLeadership +
      settings.personalityCategoryWeights.cultureAndPersonalityFit +
      settings.personalityCategoryWeights.bonusTraits
    : 0;

  // Update weight handler
  const updateWeight = (key: keyof ScoringWeights, value: number) => {
    if (!settings) return;
    setSettings({
      ...settings,
      weights: {
        ...settings.weights,
        [key]: Math.max(0, Math.min(100, value)),
      },
    });
  };

  // Update personality weight handler
  const updatePersonalityWeight = (key: keyof PersonalityCategoryWeights, value: number) => {
    if (!settings) return;
    setSettings({
      ...settings,
      personalityCategoryWeights: {
        ...settings.personalityCategoryWeights,
        [key]: Math.max(0, Math.min(100, value)),
      },
    });
  };

  // Update modifier handler
  const updateModifier = (key: keyof ScoringModifiers, value: number) => {
    if (!settings) return;
    setSettings({
      ...settings,
      modifiers: {
        ...settings.modifiers,
        [key]: value,
      },
    });
  };

  // Save settings
  const handleSave = async () => {
    if (!settings) return;

    // Validate before saving
    const weightsValidation = validateScoringWeights(settings.weights);
    if (!weightsValidation.valid) {
      setToast({ message: weightsValidation.error || 'Invalid weights', type: 'error' });
      return;
    }

    const personalityValidation = validatePersonalityCategoryWeights(settings.personalityCategoryWeights);
    if (!personalityValidation.valid) {
      setToast({ message: personalityValidation.error || 'Invalid personality weights', type: 'error' });
      return;
    }

    try {
      setSaving(true);

      const updateData = {
        weights: settings.weights,
        modifiers: settings.modifiers,
        personalityCategoryWeights: settings.personalityCategoryWeights,
        isActive: settings.isActive,
      };

      const result = jobId
        ? await scoringSettingsApi.setJobSettings(jobId, updateData)
        : await scoringSettingsApi.updateGlobalSettings(updateData);

      if (result.success) {
        setToast({ message: 'Settings saved successfully', type: 'success' });
        if (onSave) onSave();
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      setToast({ message: 'Failed to save settings', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // Reset to defaults
  const handleReset = async () => {
    if (!settings) return;

    if (jobId) {
      // For job-specific, delete the override
      try {
        setSaving(true);
        await scoringSettingsApi.deleteJobSettings(jobId);
        await fetchSettings();
        setToast({ message: 'Reverted to global settings', type: 'success' });
      } catch (error) {
        setToast({ message: 'Failed to reset settings', type: 'error' });
      } finally {
        setSaving(false);
      }
    } else {
      // For global, reset to defaults
      setSettings({
        ...settings,
        weights: { ...DEFAULT_SCORING_WEIGHTS },
        personalityCategoryWeights: { ...DEFAULT_PERSONALITY_CATEGORY_WEIGHTS },
        modifiers: {
          certificationBonus: 2,
          maxCertificationBonus: 10,
          yearsExperienceMultiplier: 1.0,
          educationLevelBonus: {
            high_school: 0,
            associate: 2,
            bachelor: 5,
            master: 8,
            doctorate: 10,
          },
          recentActivityBonus: 5,
          skillEvidenceBonus: 5,
        },
      });
    }
  };

  // Weight item labels
  const weightLabels: Record<keyof ScoringWeights, string> = {
    skillMatch: 'Skill Match',
    personalityFit: 'Personality Fit',
    experience: 'Experience',
    education: 'Education',
    profileQuality: 'Profile Quality',
  };

  const personalityWeightLabels: Record<keyof PersonalityCategoryWeights, string> = {
    cognitiveAndProblemSolving: 'Cognitive & Problem Solving',
    communicationAndTeamwork: 'Communication & Teamwork',
    workEthicAndReliability: 'Work Ethic & Reliability',
    growthAndLeadership: 'Growth & Leadership',
    cultureAndPersonalityFit: 'Culture & Personality Fit',
    bonusTraits: 'Bonus Traits',
  };

  if (loading || !settings) {
    return (
      <div className="scoring-settings">
        <div className="scoring-settings-header">
          <h2>Loading settings...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="scoring-settings">
      {toast && (
        <div className={`settings-toast ${toast.type}`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="scoring-settings-header">
        <h2>{jobId ? 'Job-Specific Scoring Settings' : 'Global Scoring Settings'}</h2>
        <p>
          {jobId
            ? isJobSpecific
              ? 'These settings override the global defaults for this job.'
              : 'Using global defaults. Make changes to create job-specific overrides.'
            : 'Configure how candidate success scores are calculated across all jobs.'}
        </p>
      </div>

      {/* Main Weights Section */}
      <div className="settings-section">
        <h3>Score Category Weights</h3>

        {weightsError && (
          <div className="validation-error">
            <span className="validation-error-icon">!</span>
            <span className="validation-error-text">{weightsError}</span>
          </div>
        )}

        <div className="weight-total">
          <span className="weight-total-label">Total Weight</span>
          <span className={`weight-total-value ${weightsTotal === 100 ? 'valid' : 'invalid'}`}>
            {weightsTotal}/100
          </span>
        </div>

        {(Object.keys(settings.weights) as Array<keyof ScoringWeights>).map((key) => (
          <div key={key} className="weight-item">
            <span className="weight-label">{weightLabels[key]}</span>
            <div className="weight-slider-container">
              <input
                type="range"
                className="weight-slider"
                min={0}
                max={100}
                value={settings.weights[key]}
                onChange={(e) => updateWeight(key, parseInt(e.target.value, 10))}
              />
              <input
                type="number"
                className="weight-input"
                min={0}
                max={100}
                value={settings.weights[key]}
                onChange={(e) => updateWeight(key, parseInt(e.target.value, 10) || 0)}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Personality Category Weights */}
      <div className="settings-section">
        <h3>Personality Category Weights</h3>

        {personalityWeightsError && (
          <div className="validation-error">
            <span className="validation-error-icon">!</span>
            <span className="validation-error-text">{personalityWeightsError}</span>
          </div>
        )}

        <div className="weight-total">
          <span className="weight-total-label">Total Weight</span>
          <span className={`weight-total-value ${personalityWeightsTotal === 100 ? 'valid' : 'invalid'}`}>
            {personalityWeightsTotal}/100
          </span>
        </div>

        {(Object.keys(settings.personalityCategoryWeights) as Array<keyof PersonalityCategoryWeights>).map((key) => (
          <div key={key} className="weight-item">
            <span className="weight-label">{personalityWeightLabels[key]}</span>
            <div className="weight-slider-container">
              <input
                type="range"
                className="weight-slider"
                min={0}
                max={100}
                value={settings.personalityCategoryWeights[key]}
                onChange={(e) => updatePersonalityWeight(key, parseInt(e.target.value, 10))}
              />
              <input
                type="number"
                className="weight-input"
                min={0}
                max={100}
                value={settings.personalityCategoryWeights[key]}
                onChange={(e) => updatePersonalityWeight(key, parseInt(e.target.value, 10) || 0)}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Modifiers Section */}
      <div className="settings-section">
        <h3>Score Modifiers</h3>
        <div className="modifier-grid">
          <div className="modifier-item">
            <label className="modifier-label">Certification Bonus (per cert)</label>
            <input
              type="number"
              className="modifier-input"
              min={0}
              max={20}
              step={0.5}
              value={settings.modifiers.certificationBonus}
              onChange={(e) => updateModifier('certificationBonus', parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="modifier-item">
            <label className="modifier-label">Max Certification Bonus</label>
            <input
              type="number"
              className="modifier-input"
              min={0}
              max={30}
              step={1}
              value={settings.modifiers.maxCertificationBonus}
              onChange={(e) => updateModifier('maxCertificationBonus', parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="modifier-item">
            <label className="modifier-label">Experience Multiplier</label>
            <input
              type="number"
              className="modifier-input"
              min={0.5}
              max={2}
              step={0.1}
              value={settings.modifiers.yearsExperienceMultiplier}
              onChange={(e) => updateModifier('yearsExperienceMultiplier', parseFloat(e.target.value) || 1)}
            />
          </div>

          <div className="modifier-item">
            <label className="modifier-label">Recent Activity Bonus</label>
            <input
              type="number"
              className="modifier-input"
              min={0}
              max={10}
              step={1}
              value={settings.modifiers.recentActivityBonus}
              onChange={(e) => updateModifier('recentActivityBonus', parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="modifier-item">
            <label className="modifier-label">Skill Evidence Bonus</label>
            <input
              type="number"
              className="modifier-input"
              min={0}
              max={15}
              step={1}
              value={settings.modifiers.skillEvidenceBonus}
              onChange={(e) => updateModifier('skillEvidenceBonus', parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="settings-actions">
        <button
          className="settings-btn secondary"
          onClick={handleReset}
          disabled={saving}
        >
          {jobId ? 'Revert to Global' : 'Reset to Defaults'}
        </button>
        <button
          className="settings-btn primary"
          onClick={handleSave}
          disabled={saving || weightsTotal !== 100 || personalityWeightsTotal !== 100}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default ScoringSettings;
