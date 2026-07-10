export interface BinaryResult {
  option1: {
    name: string;
    pros: string[];
    cons: string[];
  };
  option2: {
    name: string;
    pros: string[];
    cons: string[];
  };
  matrix: {
    criteria: string;
    option1Val: string;
    option2Val: string;
  }[];
  recommendation: {
    winnerName: string;
    percentage: number;
    logicSummary: string;
  };
}

export interface MultiVectorResult {
  comparisonGrid: {
    optionName: string;
    advantage: string;
    bestFor: string;
    keyTradeoff: string;
  }[];
  rankings: {
    rank: number;
    optionName: string;
    suitabilityScore: number;
    justification: string;
  }[];
  criteriaDefined: string[];
}

export interface WeightedWheelResult {
  scores: {
    optionName: string;
    scores: {
      Importance: number;
      Cost: number;
      Time: number;
    };
    weightedTotal: number;
  }[];
  winner: string;
  analysis: string;
}

export interface InstinctiveResult {
  selectedOption: string;
  instinctiveRationale: string;
  subconsciousFactors: string[];
  nextStep: string;
}

export interface ParadoxResult {
  hesitation: string;
  frameworks: {
    title: string;
    application: string;
  }[];
}
