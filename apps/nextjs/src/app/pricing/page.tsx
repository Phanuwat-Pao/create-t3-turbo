import { Pricing } from "@/components/pricing";

const demoPlans = [
  {
    buttonText: "Start Free Trial",
    description: "Perfect for individuals and small projects",
    features: [
      "Up to 10 projects",
      "Basic analytics",
      "48-hour support response time",
      "Limited API access",
    ],
    href: "/sign-up",
    isPopular: false,
    name: "Plus",
    period: "per month",
    price: "20",
    yearlyPrice: "16",
  },
  {
    buttonText: "Get Started",
    description: "Ideal for growing teams and businesses",
    features: [
      "Unlimited projects",
      "Advanced analytics",
      "24-hour support response time",
      "Full API access",
      "Priority support",
    ],
    href: "/sign-up",
    isPopular: true,
    name: "Pro",
    period: "per month",
    price: "50",
    yearlyPrice: "40",
  },
];

export default function Page() {
  return <Pricing plans={demoPlans} />;
}
