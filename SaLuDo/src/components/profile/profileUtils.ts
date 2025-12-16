import { ProfileItem, PersonalityTrait } from "../../types/profile";

export const transformToProfileItems = (
  items: any[],
  textField: string = "description",
  itemType: string = "other"
): ProfileItem[] => {
  if (!items || !Array.isArray(items)) {
    return [];
  }

  return items
    .filter((item) => item)
    .map((item) => ({
      text:
        item[textField] ||
        item.skillName ||
        item.evidence ||
        item.certificationName ||
        item.description ||
        "No description available",
      score: item.score || undefined,
      skillName:
        item.skillName ||
        item.name ||
        item.certificationName ||
        item.institution ||
        item.company ||
        item.title ||
        undefined,
      evidence: item.evidence || item.description || undefined,
      addedBy: item.addedBy === 'AI' ? 'AI' : item.addedBy === 'HUMAN' ? 'Human' : item.source === 'ai' ? 'AI' : item.source === 'manual' ? 'Human' : 'AI',
      title: item.title || undefined,
      role: item.role || undefined,
      institution: item.institution || undefined,
      name: item.name || undefined,
      issuingOrganization: item.issuingOrganization || undefined,
      issueDate: item.issueDate || undefined,
      startDate: item.startDate || undefined,
      endDate: item.endDate || undefined,
    }));
};

export const createRadarData = (personalityData: any): PersonalityTrait[] => {
  if (!personalityData) {
    return [
      {
        trait: "Cognitive & Problem-Solving",
        value: 7.5,
        breakdown: [
          { sub: "Analytical Thinking", score: 7.5 },
          { sub: "Problem Solving", score: 8.0 },
          { sub: "Critical Thinking", score: 7.0 },
        ],
      },
      {
        trait: "Communication & Teamwork",
        value: 8.0,
        breakdown: [
          { sub: "Communication", score: 8.2 },
          { sub: "Teamwork", score: 7.8 },
          { sub: "Leadership", score: 8.0 },
        ],
      },
    ];
  }

  const radarData: PersonalityTrait[] = [];

  if (personalityData.cognitiveAndProblemSolving) {
    const category = personalityData.cognitiveAndProblemSolving;
    const breakdown = Object.keys(category).map((key) => ({
      sub: category[key].traitName || key,
      score: category[key].score || 0,
    }));
    const avgScore =
      breakdown.reduce((sum, item) => sum + item.score, 0) / breakdown.length;

    radarData.push({
      trait: "Cognitive & Problem-Solving",
      value: avgScore,
      breakdown,
    });
  }

  if (personalityData.communicationAndTeamwork) {
    const category = personalityData.communicationAndTeamwork;
    const breakdown = Object.keys(category).map((key) => ({
      sub: category[key].traitName || key,
      score: category[key].score || 0,
    }));
    const avgScore =
      breakdown.reduce((sum, item) => sum + item.score, 0) / breakdown.length;

    radarData.push({
      trait: "Communication & Teamwork",
      value: avgScore,
      breakdown,
    });
  }

  if (personalityData.workEthicAndReliability) {
    const category = personalityData.workEthicAndReliability;
    const breakdown = Object.keys(category).map((key) => ({
      sub: category[key].traitName || key,
      score: category[key].score || 0,
    }));
    const avgScore =
      breakdown.reduce((sum, item) => sum + item.score, 0) / breakdown.length;

    radarData.push({
      trait: "Work Ethic & Reliability",
      value: avgScore,
      breakdown,
    });
  }

  if (personalityData.growthAndLeadership) {
    const category = personalityData.growthAndLeadership;
    const breakdown = Object.keys(category).map((key) => ({
      sub: category[key].traitName || key,
      score: category[key].score || 0,
    }));
    const avgScore =
      breakdown.reduce((sum, item) => sum + item.score, 0) / breakdown.length;

    radarData.push({
      trait: "Growth & Leadership",
      value: avgScore,
      breakdown,
    });
  }

  if (personalityData.cultureAndPersonalityFit) {
    const category = personalityData.cultureAndPersonalityFit;
    const breakdown = Object.keys(category).map((key) => ({
      sub: category[key].traitName || key,
      score: category[key].score || 0,
    }));
    const avgScore =
      breakdown.reduce((sum, item) => sum + item.score, 0) / breakdown.length;

    radarData.push({
      trait: "Culture & Personality Fit",
      value: avgScore,
      breakdown,
    });
  }

  if (personalityData.bonusTraits) {
    const category = personalityData.bonusTraits;
    const breakdown = Object.keys(category).map((key) => ({
      sub: category[key].traitName || key,
      score: category[key].score || 0,
    }));
    const avgScore =
      breakdown.reduce((sum, item) => sum + item.score, 0) / breakdown.length;

    radarData.push({
      trait: "Bonus Traits",
      value: avgScore,
      breakdown,
    });
  }

  return radarData.length > 0
    ? radarData
    : [
        {
          trait: "No Data Available",
          value: 0,
          breakdown: [{ sub: "No traits found", score: 0 }],
        },
      ];
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Get API base URL from environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/';

export const getFileDownloadUrl = (fileId: string) => {
  return `${API_URL}files/${fileId}`;
};

export const getTranscriptDownloadUrl = (fileId: string) => {
  return `${API_URL}files/transcripts/${fileId}`;
};

export const getInterviewVideoDownloadUrl = (id: string, fileId: string) => {
  return `${API_URL}candidates/${id}/videos/interview/${fileId}/download`;
};

export const getIntroductionVideoDownloadUrl = (id: string, fileId: string) => {
  return `${API_URL}candidates/${id}/videos/introduction/${fileId}/download`;
};
