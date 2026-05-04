import { WEIGHTS, QUESTIONS } from '../config/data.js';

export function useScoring() {
  const calculateOverallScore = (answers) => {
    if (!answers || Object.keys(answers).length === 0) return 0;
    
    let totalWeightedScore = 0;
    let totalWeight = 0;
    
    Object.entries(answers).forEach(([key, score]) => {
      const [catId, qIdxStr] = key.split('_');
      const qIdx = parseInt(qIdxStr);
      const weightLabel = QUESTIONS[catId][qIdx].weight;
      const weight = WEIGHTS[weightLabel] || 1.0;
      
      totalWeightedScore += (score / 5) * 100 * weight;
      totalWeight += weight;
    });
    
    return Math.round(totalWeightedScore / totalWeight);
  };

  const calculateCategoryScores = (answers) => {
    const catScores = {};
    
    Object.keys(QUESTIONS).forEach(catId => {
      const qs = QUESTIONS[catId];
      let catWeightedScore = 0;
      let catTotalWeight = 0;
      
      qs.forEach((q, qi) => {
        const key = `${catId}_${qi}`;
        const score = answers[key] || 3; // Default to neutral if not answered
        const weight = WEIGHTS[q.weight] || 1.0;
        
        catWeightedScore += (score / 5) * 100 * weight;
        catTotalWeight += weight;
      });
      
      catScores[catId] = Math.round(catWeightedScore / catTotalWeight);
    });
    
    return catScores;
  };

  return { calculateOverallScore, calculateCategoryScores };
}
