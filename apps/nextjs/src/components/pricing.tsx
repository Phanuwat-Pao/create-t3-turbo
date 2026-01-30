"use client";

import { Button, buttonVariants } from "@acme/ui/button";
import { Label } from "@acme/ui/label";
import { Switch } from "@acme/ui/switch";
import NumberFlow from "@number-flow/react";
import { CheckIcon } from "@radix-ui/react-icons";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { memo, useCallback, useEffect, useRef, useState } from "react";

import { cn } from "~/lib/utils";

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);

    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}

interface PricingPlan {
  name: string;
  price: string;
  yearlyPrice: string;
  period: string;
  features: string[];
  description: string;
  buttonText: string;
  href: string;
  isPopular: boolean;
}

interface PlanCardProps {
  plan: PricingPlan;
  index: number;
  isDesktop: boolean;
  isMonthly: boolean;
}

function getXOffset(index: number): number {
  if (index === 2) {
    return -30;
  }
  if (index === 0) {
    return 30;
  }
  return 0;
}

const PlanCard = memo(function PlanCard({
  plan,
  index,
  isDesktop,
  isMonthly,
}: PlanCardProps) {
  const handleUpgrade = useCallback(() => {
    if (plan.href) {
      window.location.href = plan.href;
    }
  }, [plan.href]);

  return (
    <motion.div
      initial={{ opacity: 1, y: 50 }}
      whileInView={
        isDesktop
          ? {
              opacity: 1,
              scale: index === 0 || index === 2 ? 0.94 : 1,
              x: getXOffset(index),
              y: plan.isPopular ? -20 : 0,
            }
          : {}
      }
      viewport={{ once: true }}
      transition={{
        damping: 30,
        delay: 0.4,
        duration: 1.6,
        opacity: { duration: 0.5 },
        stiffness: 100,
        type: "spring",
      }}
      className={cn(
        `bg-background relative rounded-sm border p-6 text-center lg:flex lg:flex-col lg:justify-center`,
        plan.isPopular ? "border-border border-2" : "border-border",
        "flex flex-col",
        !plan.isPopular && "mt-5",
        index === 0 || index === 2
          ? "z-0 translate-x-0 translate-y-0 -translate-z-[50px] rotate-y-10 transform"
          : "z-10",
        index === 0 && "origin-right",
        index === 2 && "origin-left"
      )}
    >
      {plan.isPopular && (
        <div className="bg-primary absolute top-0 right-0 flex items-center rounded-tr-sm rounded-bl-sm px-2 py-0.5">
          <Star className="text-primary-foreground h-4 w-4 fill-current" />
          <span className="text-primary-foreground ml-1 font-sans font-semibold">
            Popular
          </span>
        </div>
      )}
      <div className="flex flex-1 flex-col">
        <p className="text-muted-foreground mt-2 text-base font-semibold">
          {plan.name}
        </p>
        <div className="mt-6 flex items-center justify-center gap-x-2">
          <span className="text-foreground text-5xl font-bold tracking-tight">
            <NumberFlow
              value={isMonthly ? Number(plan.price) : Number(plan.yearlyPrice)}
              format={{
                currency: "USD",
                maximumFractionDigits: 0,
                minimumFractionDigits: 0,
                style: "currency",
              }}
              transformTiming={{
                duration: 500,
                easing: "ease-out",
              }}
              willChange
              className="font-variant-numeric: tabular-nums"
            />
          </span>
          {plan.period !== "Next 3 months" && (
            <span className="text-muted-foreground text-sm leading-6 font-semibold tracking-wide">
              / {plan.period}
            </span>
          )}
        </div>

        <p className="text-muted-foreground text-xs leading-5">
          {isMonthly ? "billed monthly" : "billed annually"}
        </p>

        <ul className="mt-5 flex flex-col gap-2">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2">
              <CheckIcon className="text-primary mt-1 h-4 w-4 shrink-0" />
              <span className="text-left">{feature}</span>
            </li>
          ))}
        </ul>

        <hr className="my-4 w-full" />
        <Button
          onClick={handleUpgrade}
          className={cn(
            buttonVariants({
              variant: "outline",
            }),
            "group relative w-full gap-2 overflow-hidden text-lg font-semibold tracking-tighter",
            "hover:ring-primary hover:bg-primary hover:text-primary-foreground transform-gpu ring-offset-current transition-all duration-300 ease-out hover:ring-2 hover:ring-offset-1",
            plan.isPopular
              ? "bg-primary text-primary-foreground"
              : "bg-background text-foreground"
          )}
        >
          {plan.buttonText}
        </Button>
        <p className="text-muted-foreground mt-6 text-xs leading-5">
          {plan.description}
        </p>
      </div>
    </motion.div>
  );
});

interface PricingProps {
  plans: PricingPlan[];
  title?: string;
  description?: string;
}

export function Pricing({
  plans,
  title = "Simple, Transparent Pricing",
  description = "Choose the plan that works for you",
}: PricingProps) {
  const [isMonthly, setIsMonthly] = useState(true);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const switchRef = useRef<HTMLButtonElement>(null);

  const handleToggle = useCallback((checked: boolean) => {
    setIsMonthly(!checked);
    if (checked && switchRef.current) {
      const rect = switchRef.current.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;

      confetti({
        colors: [
          "hsl(var(--primary))",
          "hsl(var(--accent))",
          "hsl(var(--secondary))",
          "hsl(var(--muted))",
        ],
        decay: 0.94,
        gravity: 1.2,
        origin: {
          x: x / window.innerWidth,
          y: y / window.innerHeight,
        },
        particleCount: 50,
        shapes: ["circle"],
        spread: 60,
        startVelocity: 30,
        ticks: 200,
      });
    }
  }, []);

  return (
    <div className="container py-4">
      <div className="mb-3 space-y-4 text-center">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {title}
        </h2>
        <p className="text-muted-foreground whitespace-pre-line">
          {description}
        </p>
      </div>

      <div className="mb-10 flex justify-center">
        <div className="relative inline-flex cursor-pointer items-center">
          <Label>
            <Switch
              ref={switchRef as React.RefObject<HTMLButtonElement>}
              checked={!isMonthly}
              onCheckedChange={handleToggle}
              className="relative"
            />
          </Label>
        </div>
        <span className="ml-2 font-semibold">
          Annual billing <span className="text-primary">(Save 20%)</span>
        </span>
      </div>

      <div className="sm:2 grid grid-cols-1 gap-4 md:grid-cols-3">
        {plans.map((plan, index) => (
          <PlanCard
            key={plan.name}
            plan={plan}
            index={index}
            isDesktop={isDesktop}
            isMonthly={isMonthly}
          />
        ))}
      </div>
    </div>
  );
}
