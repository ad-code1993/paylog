import { Credit, Review, CreditStatus } from "@prisma/client";

export interface ReputationProfile {
  score: number;
  riskStatus: "LOW RISK" | "MEDIUM RISK" | "HIGH RISK";
  metrics: {
    totalCredits: number;
    activeCreditsCount: number;
    overdueCreditsCount: number;
    onTimeClosedCount: number;
    lateClosedCount: number;
    totalOutstandingAmount: number;
    averageReviewRating: number;
    totalReviewsCount: number;
  };
}

export class ReputationService {
  calculateReputation(credits: Credit[], reviews: Review[]): ReputationProfile {
    let score = 100;
    let onTimeClosedCount = 0;
    let lateClosedCount = 0;
    let overdueCount = 0;
    let activeCreditsCount = 0;
    let totalOutstandingAmount = 0;

    const now = new Date();

    for (const credit of credits) {
      if (credit.status === CreditStatus.CLOSED) {
        // Compare updatedAt with dueDate to see if it was closed on time
        // Note: we compare time values
        const closedAt = new Date(credit.updatedAt).getTime();
        const dueDate = new Date(credit.dueDate).getTime();

        if (closedAt <= dueDate) {
          score += 5;
          onTimeClosedCount++;
        } else {
          score -= 10;
          lateClosedCount++;
        }
      } else {
        // Check if actually overdue (either marked OVERDUE, or ACTIVE but past due date)
        const isPastDue = new Date(credit.dueDate).getTime() < now.getTime();
        
        if (credit.status === CreditStatus.OVERDUE || isPastDue) {
          score -= 20;
          overdueCount++;
        } else {
          activeCreditsCount++;
        }
        
        // Outstanding is unpaid credits (ACTIVE or OVERDUE)
        totalOutstandingAmount += credit.amount;
      }
    }

    // Apply good cycle bonus: 3+ good cycles (on-time closed credits) -> +10 bonus
    if (onTimeClosedCount >= 3) {
      score += 10;
    }

    // Clamp score between 0 and 100
    score = Math.min(100, Math.max(0, score));

    // Map risk status
    let riskStatus: "LOW RISK" | "MEDIUM RISK" | "HIGH RISK" = "LOW RISK";
    if (score >= 80) {
      riskStatus = "LOW RISK";
    } else if (score >= 50) {
      riskStatus = "MEDIUM RISK";
    } else {
      riskStatus = "HIGH RISK";
    }

    // Calculate review metrics
    const totalReviewsCount = reviews.length;
    const averageReviewRating =
      totalReviewsCount > 0
        ? parseFloat((reviews.reduce((acc, rev) => acc + rev.rating, 0) / totalReviewsCount).toFixed(2))
        : 0;

    return {
      score,
      riskStatus,
      metrics: {
        totalCredits: credits.length,
        activeCreditsCount,
        overdueCreditsCount: overdueCount,
        onTimeClosedCount,
        lateClosedCount,
        totalOutstandingAmount: parseFloat(totalOutstandingAmount.toFixed(2)),
        averageReviewRating,
        totalReviewsCount,
      },
    };
  }
}

export const reputationService = new ReputationService();
