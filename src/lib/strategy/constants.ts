export const INDUSTRIES = [
  "SaaS",
  "E-commerce",
  "Agency",
  "Coaching / Consulting",
  "Healthcare",
  "Education",
  "Real Estate",
  "Hospitality",
  "Consumer Goods",
  "Finance",
  "Nonprofit",
  "Creator / Personal Brand",
  "Local Service Business",
  "Other",
] as const;

export type Industry = (typeof INDUSTRIES)[number];

export const GOALS = [
  "Get more customers",
  "Clarify brand positioning",
  "Improve marketing strategy",
  "Increase revenue",
  "Launch a new offer",
  "Enter a new market",
  "Improve retention",
  "Build a go-to-market plan",
] as const;

export type Goal = (typeof GOALS)[number];

export const BUSINESS_STAGES = [
  {
    value: "idea",
    label: "Idea Stage",
    description:
      "You have a concept but haven't launched yet. Still validating the market or building your first version.",
  },
  {
    value: "mvp_early",
    label: "MVP / Early Stage",
    description:
      "You've launched something and have early users or customers, but you're still finding product-market fit.",
  },
  {
    value: "revenue_generating",
    label: "Revenue Generating",
    description:
      "You have paying customers and consistent revenue. Now focused on growth, retention, or scaling.",
  },
] as const;

export type BusinessStage = (typeof BUSINESS_STAGES)[number]["value"];
