import { reputationService } from "./modules/reputation/reputation.service";
import { Credit, Review, CreditStatus } from "@prisma/client";

// Mock helper to generate Credit entries
const mockCredit = (overrides: Partial<Credit>): Credit => {
  const now = new Date();
  return {
    id: Math.random().toString(),
    shopId: "shop-1",
    customerId: "cust-1",
    amount: 100,
    dueDate: new Date(now.getTime() + 24 * 60 * 60 * 1000), // tomorrow
    status: CreditStatus.ACTIVE,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
};

// Mock helper to generate Review entries
const mockReview = (overrides: Partial<Review>): Review => {
  return {
    id: Math.random().toString(),
    shopId: "shop-1",
    customerId: "cust-1",
    rating: 5,
    comment: "Excellent",
    createdAt: new Date(),
    ...overrides,
  };
};

function runTests() {
  console.log("=========================================");
  console.log(" RUNNING REPUTATION SYSTEM UNIT TESTS  ");
  console.log("=========================================");

  let passed = 0;
  let failed = 0;

  const assert = (name: string, condition: boolean, message?: string) => {
    if (condition) {
      console.log(`[PASS] ${name}`);
      passed++;
    } else {
      console.error(`[FAIL] ${name} ${message ? `- ${message}` : ""}`);
      failed++;
    }
  };

  // Test 1: Initial Score & Risk
  {
    const profile = reputationService.calculateReputation([], []);
    assert(
      "Initial score should be 100, risk LOW RISK",
      profile.score === 100 && profile.riskStatus === "LOW RISK"
    );
  }

  // Test 2: Active unpaid (not past due) shouldn't reduce score
  {
    const credits = [mockCredit({ amount: 150 })];
    const profile = reputationService.calculateReputation(credits, []);
    assert(
      "Active credit within due date should keep score at 100",
      profile.score === 100 && profile.metrics.totalOutstandingAmount === 150
    );
  }

  // Test 3: Overdue deduction (-20)
  {
    // Marked OVERDUE
    const credits = [mockCredit({ status: CreditStatus.OVERDUE, amount: 100 })];
    const profile = reputationService.calculateReputation(credits, []);
    assert(
      "Overdue credit should deduct -20 points (score: 80, LOW RISK)",
      profile.score === 80 && profile.riskStatus === "LOW RISK"
    );
  }

  // Test 4: Dynamic Overdue deduction (Active but past due date)
  {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const credits = [mockCredit({ status: CreditStatus.ACTIVE, dueDate: yesterday, amount: 200 })];
    const profile = reputationService.calculateReputation(credits, []);
    assert(
      "Active credit past due date should dynamically count as OVERDUE and deduct -20",
      profile.score === 80 && profile.metrics.overdueCreditsCount === 1
    );
  }

  // Test 5: Closed on time (+5)
  {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const credits = [
      mockCredit({
        status: CreditStatus.CLOSED,
        dueDate: yesterday,
        updatedAt: yesterday, // closed on time
      }),
    ];
    const profile = reputationService.calculateReputation(credits, []);
    assert(
      "On-time closed credit should add +5 (score: 100, clamped)",
      profile.score === 100 && profile.metrics.onTimeClosedCount === 1
    );
  }

  // Test 6: Late closure (-10)
  {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const today = new Date();
    const credits = [
      mockCredit({
        status: CreditStatus.CLOSED,
        dueDate: yesterday,
        updatedAt: today, // closed late
      }),
    ];
    const profile = reputationService.calculateReputation(credits, []);
    assert(
      "Late closed credit should deduct -10 points (score: 90)",
      profile.score === 90 && profile.metrics.lateClosedCount === 1
    );
  }

  // Test 7: 3+ good cycles bonus (+10)
  {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const credits = [
      mockCredit({ status: CreditStatus.OVERDUE }),
      mockCredit({ status: CreditStatus.OVERDUE }),
      mockCredit({ status: CreditStatus.CLOSED, dueDate: yesterday, updatedAt: yesterday }),
      mockCredit({ status: CreditStatus.CLOSED, dueDate: yesterday, updatedAt: yesterday }),
      mockCredit({ status: CreditStatus.CLOSED, dueDate: yesterday, updatedAt: yesterday }),
    ];
    const profile = reputationService.calculateReputation(credits, []);
    assert(
      "3+ on-time closed cycles should award +10 bonus points (60 - 40 + 15 + 10 = 85)",
      profile.score === 85 && profile.riskStatus === "LOW RISK"
    );
  }

  // Test 8: Risk mapping
  {
    // High risk (<50)
    // starting: 100
    // 3 overdue: -60 (score: 40)
    const credits = [
      mockCredit({ status: CreditStatus.OVERDUE }),
      mockCredit({ status: CreditStatus.OVERDUE }),
      mockCredit({ status: CreditStatus.OVERDUE }),
    ];
    const profile = reputationService.calculateReputation(credits, []);
    assert(
      "Score < 50 should map to HIGH RISK status",
      profile.score === 40 && profile.riskStatus === "HIGH RISK"
    );

    // Medium risk (50 - 79)
    // starting: 100
    // 2 overdue: -40 (score: 60)
    const credits2 = [
      mockCredit({ status: CreditStatus.OVERDUE }),
      mockCredit({ status: CreditStatus.OVERDUE }),
    ];
    const profile2 = reputationService.calculateReputation(credits2, []);
    assert(
      "Score 50-79 should map to MEDIUM RISK status",
      profile2.score === 60 && profile2.riskStatus === "MEDIUM RISK"
    );
  }

  // Test 9: Review average calculations
  {
    const reviews = [
      mockReview({ rating: 5 }),
      mockReview({ rating: 4 }),
      mockReview({ rating: 3 }),
    ];
    const profile = reputationService.calculateReputation([], reviews);
    assert(
      "Review stats should calculate correct average (5 + 4 + 3) / 3 = 4.00",
      profile.metrics.averageReviewRating === 4 && profile.metrics.totalReviewsCount === 3
    );
  }

  console.log("=========================================");
  console.log(` TEST RUN COMPLETE: ${passed} passed, ${failed} failed`);
  console.log("=========================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
