/**
 * GymMind.ai - Profile Completion Utilities
 * ==========================================
 * Helper functions to check profile completion status
 */

export interface UserProfile {
  height?: number;
  weight?: number;
  fitnessGoal?: string;
  experienceLevel?: string;
  age?: number;
  name?: string;
  email?: string;
}

export interface ProfileCompletionStatus {
  isComplete: boolean;
  missingFields: string[];
  completionPercentage: number;
  requiredFields: string[];
}

export const ESSENTIAL_PROFILE_FIELDS = {
  height: 'Height (cm)',
  weight: 'Weight (kg)', 
  fitnessGoal: 'Fitness Goal',
  experienceLevel: 'Experience Level'
};

export const OPTIONAL_PROFILE_FIELDS = {
  age: 'Age',
  name: 'Name',
  email: 'Email'
};

/**
 * Check if user profile is complete with essential information
 */
export function checkProfileCompletion(profile: UserProfile | null): ProfileCompletionStatus {
  const requiredFields = Object.keys(ESSENTIAL_PROFILE_FIELDS);
  const missingFields: string[] = [];

  if (!profile) {
    return {
      isComplete: false,
      missingFields: Object.values(ESSENTIAL_PROFILE_FIELDS),
      completionPercentage: 0,
      requiredFields
    };
  }

  // Check each essential field
  requiredFields.forEach(field => {
    if (!profile[field as keyof UserProfile]) {
      const fieldName = ESSENTIAL_PROFILE_FIELDS[field as keyof typeof ESSENTIAL_PROFILE_FIELDS];
      missingFields.push(fieldName);
    }
  });

  const completionPercentage = Math.round(
    ((requiredFields.length - missingFields.length) / requiredFields.length) * 100
  );

  return {
    isComplete: missingFields.length === 0,
    missingFields,
    completionPercentage,
    requiredFields
  };
}

/**
 * Get user-friendly message about profile completion
 */
export function getProfileCompletionMessage(status: ProfileCompletionStatus): string {
  if (status.isComplete) {
    return "Your profile is complete! 🎉";
  }

  if (status.missingFields.length === 1) {
    return `Add your ${status.missingFields[0].toLowerCase()} to complete your profile.`;
  }

  if (status.missingFields.length === 2) {
    return `Add your ${status.missingFields.join(' and ').toLowerCase()} to complete your profile.`;
  }

  const lastField = status.missingFields.pop();
  return `Add your ${status.missingFields.join(', ').toLowerCase()}, and ${lastField?.toLowerCase()} to complete your profile.`;
}

/**
 * Get completion progress for UI indicators
 */
export function getCompletionProgress(status: ProfileCompletionStatus) {
  return {
    percentage: status.completionPercentage,
    completed: status.requiredFields.length - status.missingFields.length,
    total: status.requiredFields.length,
    color: status.completionPercentage >= 75 ? 'green' : 
           status.completionPercentage >= 50 ? 'amber' : 'red'
  };
}