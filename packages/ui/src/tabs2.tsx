"use client";

import { cn } from "@acme/ui";
import { motion } from "framer-motion";
import { memo, useCallback, useState } from "react";

interface Tab {
  title: string;
  value: string;
  content?: string | React.ReactNode;
}

interface TabButtonProps {
  tab: Tab;
  idx: number;
  active: Tab;
  tabs: Tab[];
  moveSelectedTabToTop: (idx: number) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  tabClassName?: string;
  activeTabClassName?: string;
}

const TabButton = memo(function TabButton({
  tab,
  idx,
  active,
  tabs,
  moveSelectedTabToTop,
  onMouseEnter,
  onMouseLeave,
  tabClassName,
  activeTabClassName,
}: TabButtonProps) {
  const handleClick = useCallback(() => {
    moveSelectedTabToTop(idx);
  }, [moveSelectedTabToTop, idx]);

  return (
    <button
      type="button"
      onClick={handleClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cn(
        "relative rounded-full px-4 py-2 opacity-80 hover:opacity-100",
        tabClassName
      )}
      style={{
        transformStyle: "preserve-3d",
      }}
    >
      {active.value === tab.value && (
        <motion.div
          transition={{
            delay: 0.1,
            duration: 0.2,

            type: "keyframes",
          }}
          animate={{
            x: tabs.indexOf(tab) === 0 ? [0, 0, 0] : [0, 0, 0],
          }}
          className={cn(
            "absolute inset-0 bg-gray-200 opacity-100 dark:bg-zinc-900/90",
            activeTabClassName
          )}
        />
      )}

      <span
        className={cn(
          "relative block text-black dark:text-white",
          active.value === tab.value
            ? "text-opacity-100 font-medium"
            : "opacity-40"
        )}
      >
        {tab.title}
      </span>
    </button>
  );
});

export const FadeInDiv = ({
  className,
  tabs,
}: {
  className?: string;
  key?: string;
  tabs: Tab[];
  active: Tab;
  hovering?: boolean;
}) => {
  const isActive = (tab: Tab) => tab.value === tabs[0]?.value;
  return (
    <div className="relative h-full w-full">
      {tabs.map((tab, idx) => (
        <motion.div
          key={tab.value}
          style={{
            opacity: idx < 3 ? 1 - idx * 0.1 : 0,
            scale: 1 - idx * 0.1,
            zIndex: -idx,
          }}
          animate={{
            transition: {
              delay: 0.1,
              duration: 0.2,
              type: "keyframes",
            },
          }}
          className={cn(
            "h-full w-full",
            isActive(tab) ? "" : "hidden",
            className
          )}
        >
          {tab.content}
        </motion.div>
      ))}
    </div>
  );
};

export const Tabs = ({
  tabs: propTabs,
  containerClassName,
  activeTabClassName,
  tabClassName,
  contentClassName,
}: {
  tabs: Tab[];
  containerClassName?: string;
  activeTabClassName?: string;
  tabClassName?: string;
  contentClassName?: string;
}) => {
  const [active, setActive] = useState<Tab>(
    () => propTabs[0] ?? { content: "", title: "", value: "" }
  );
  const [tabs, setTabs] = useState<Tab[]>(propTabs);

  const moveSelectedTabToTop = useCallback(
    (idx: number) => {
      const newTabs = [...propTabs];
      const selectedTab = newTabs.splice(idx, 1);
      const [firstSelected] = selectedTab;
      if (!firstSelected) {
        return;
      }
      newTabs.unshift(firstSelected);
      setTabs(newTabs);
      const [firstTab] = newTabs;
      if (firstTab) {
        setActive(firstTab);
      }
    },
    [propTabs]
  );

  const [hovering, setHovering] = useState(false);

  const handleMouseEnter = useCallback(() => setHovering(true), []);
  const handleMouseLeave = useCallback(() => setHovering(false), []);

  return (
    <>
      <div
        className={cn(
          "no-visible-scrollbar bg-opacity-0 relative mt-0 flex w-full max-w-max flex-row items-center justify-start overflow-auto border-x border-t perspective-[1000px] sm:overflow-visible",
          containerClassName
        )}
      >
        {propTabs.map((tab, idx) => (
          <TabButton
            key={tab.title}
            tab={tab}
            idx={idx}
            active={active}
            tabs={tabs}
            moveSelectedTabToTop={moveSelectedTabToTop}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            tabClassName={tabClassName}
            activeTabClassName={activeTabClassName}
          />
        ))}
      </div>
      <FadeInDiv
        tabs={tabs}
        active={active}
        key={active.value}
        hovering={hovering}
        className={cn("", contentClassName)}
      />
    </>
  );
};
