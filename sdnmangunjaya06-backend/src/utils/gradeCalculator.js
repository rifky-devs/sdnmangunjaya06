export const validateScore = (score) => {
  const value = Number(score);

  if (Number.isNaN(value) || value < 0 || value > 100) {
    return false;
  }

  return true;
};

export const calculateFinalScore = (assignmentScore, midtermScore, finalExamScore) => {
  return Number((assignmentScore * 0.3 + midtermScore * 0.3 + finalExamScore * 0.4).toFixed(2));
};

export const determineGraduationStatus = (finalScore) => {
  return finalScore >= 70 ? 'Lulus' : 'Tidak Lulus';
};

export const validateGradePayload = ({ assignment_score, midterm_score, final_exam_score }) => {
  const scores = [assignment_score, midterm_score, final_exam_score];

  return scores.every(validateScore);
};
