export interface ProductAnalysis {
  productName: string;
  targetAudience: string;
  features: string[];
  benefits: string[];
  painPoints: string[];
  usp: string;
  marketingAngles: string[];
}

export interface BonusIdea {
  name: string;
  description: string;
  whyItHelps: string;
  estimatedValue: string;
}

export interface BonusPage {
  headline: string;
  subheadline: string;
  ctaText: string;
  bonusStackDescription: string;
  scarcitySection: string;
  closingSection: string;
  htmlTemplate: string;
}

export interface EmailSwipe {
  type: 'announcement' | 'benefits' | 'faq' | 'last-chance';
  subject: string;
  previewText: string;
  body: string;
  ctaText: string;
}

export interface ApiResponse {
  analysis: ProductAnalysis;
  bonuses: BonusIdea[];
  bonusPage: BonusPage;
  emails: EmailSwipe[];
}
