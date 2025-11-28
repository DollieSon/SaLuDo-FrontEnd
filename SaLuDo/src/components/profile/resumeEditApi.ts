// API helper functions for resume editing

import axios from "axios";
import { 
  EditableSkill, 
  EditableExperience, 
  EditableEducation, 
  EditableCertification, 
  EditableStrengthWeakness 
} from "./resumeEditTypes";
import { API_ENDPOINTS } from "./resumeEditConstants";

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  "Content-Type": "application/json"
});

export const resumeEditApi = {
  // Skills
  async updateSkill(candidateId: string, skill: EditableSkill) {
    const endpoint = API_ENDPOINTS.SKILLS(candidateId, skill.candidateSkillId);
    await axios.put(`http://localhost:3001${endpoint}`, {
      skillName: skill.skillName,
      score: skill.score,
      evidence: skill.evidence
    }, { headers: getAuthHeaders() });
  },

  async createSkill(candidateId: string, skill: EditableSkill) {
    const endpoint = API_ENDPOINTS.SKILLS(candidateId);
    await axios.post(`http://localhost:3001${endpoint}`, {
      skillName: skill.skillName,
      score: skill.score,
      evidence: skill.evidence,
      addedBy: skill.source
    }, { headers: getAuthHeaders() });
  },

  async deleteSkill(candidateId: string, skillId: string) {
    const endpoint = API_ENDPOINTS.SKILLS(candidateId, skillId);
    await axios.delete(`http://localhost:3001${endpoint}`, { headers: getAuthHeaders() });
  },

  // Experience
  async updateExperience(candidateId: string, exp: EditableExperience) {
    const endpoint = API_ENDPOINTS.EXPERIENCE(candidateId, exp.experienceId);
    await axios.put(`http://localhost:3001${endpoint}`, {
      description: exp.description,
      company: exp.company,
      position: exp.position,
      startDate: exp.startDate,
      endDate: exp.endDate
    }, { headers: getAuthHeaders() });
  },

  async createExperience(candidateId: string, exp: EditableExperience) {
    const endpoint = API_ENDPOINTS.EXPERIENCE(candidateId);
    await axios.post(`http://localhost:3001${endpoint}`, {
      description: exp.description,
      company: exp.company,
      position: exp.position,
      startDate: exp.startDate,
      endDate: exp.endDate
    }, { headers: getAuthHeaders() });
  },

  async deleteExperience(candidateId: string, expId: string) {
    const endpoint = API_ENDPOINTS.EXPERIENCE(candidateId, expId);
    await axios.delete(`http://localhost:3001${endpoint}`, { headers: getAuthHeaders() });
  },

  // Education
  async updateEducation(candidateId: string, edu: EditableEducation) {
    const endpoint = API_ENDPOINTS.EDUCATION(candidateId, edu.educationId);
    await axios.put(`http://localhost:3001${endpoint}`, {
      description: edu.description,
      institution: edu.institution,
      degree: edu.degree,
      fieldOfStudy: edu.fieldOfStudy,
      graduationDate: edu.graduationDate
    }, { headers: getAuthHeaders() });
  },

  async createEducation(candidateId: string, edu: EditableEducation) {
    const endpoint = API_ENDPOINTS.EDUCATION(candidateId);
    await axios.post(`http://localhost:3001${endpoint}`, {
      description: edu.description,
      institution: edu.institution,
      degree: edu.degree,
      fieldOfStudy: edu.fieldOfStudy,
      graduationDate: edu.graduationDate
    }, { headers: getAuthHeaders() });
  },

  async deleteEducation(candidateId: string, eduId: string) {
    const endpoint = API_ENDPOINTS.EDUCATION(candidateId, eduId);
    await axios.delete(`http://localhost:3001${endpoint}`, { headers: getAuthHeaders() });
  },

  // Certifications
  async updateCertification(candidateId: string, cert: EditableCertification) {
    const endpoint = API_ENDPOINTS.CERTIFICATIONS(candidateId, cert.certificationId);
    await axios.put(`http://localhost:3001${endpoint}`, {
      description: cert.description,
      certificationName: cert.certificationName,
      issuingOrganization: cert.issuingOrganization,
      issueDate: cert.issueDate,
      expirationDate: cert.expirationDate
    }, { headers: getAuthHeaders() });
  },

  async createCertification(candidateId: string, cert: EditableCertification) {
    const endpoint = API_ENDPOINTS.CERTIFICATIONS(candidateId);
    await axios.post(`http://localhost:3001${endpoint}`, {
      description: cert.description,
      certificationName: cert.certificationName,
      issuingOrganization: cert.issuingOrganization,
      issueDate: cert.issueDate,
      expirationDate: cert.expirationDate
    }, { headers: getAuthHeaders() });
  },

  async deleteCertification(candidateId: string, certId: string) {
    const endpoint = API_ENDPOINTS.CERTIFICATIONS(candidateId, certId);
    await axios.delete(`http://localhost:3001${endpoint}`, { headers: getAuthHeaders() });
  },

  // Strengths & Weaknesses
  async updateStrengthWeakness(candidateId: string, item: EditableStrengthWeakness) {
    const endpoint = API_ENDPOINTS.STRENGTHS_WEAKNESSES(candidateId, item.strengthWeaknessId);
    await axios.put(`http://localhost:3001${endpoint}`, {
      description: item.description,
      type: item.type
    }, { headers: getAuthHeaders() });
  },

  async createStrengthWeakness(candidateId: string, item: EditableStrengthWeakness) {
    const endpoint = API_ENDPOINTS.STRENGTHS_WEAKNESSES(candidateId);
    await axios.post(`http://localhost:3001${endpoint}`, {
      description: item.description,
      type: item.type
    }, { headers: getAuthHeaders() });
  },

  async deleteStrengthWeakness(candidateId: string, id: string, type: 'strength' | 'weakness') {
    const endpoint = `${API_ENDPOINTS.STRENGTHS_WEAKNESSES(candidateId, id)}?type=${type}`;
    await axios.delete(`http://localhost:3001${endpoint}`, { headers: getAuthHeaders() });
  }
};
