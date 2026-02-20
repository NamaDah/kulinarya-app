"use client";

interface CuisineTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { key: "all", label: "All", emoji: "🌏" },
  { key: "chinese", label: "Chinese", emoji: "🇨🇳" },
  { key: "japanese", label: "Japanese", emoji: "🇯🇵" },
  { key: "korean", label: "Korean", emoji: "🇰🇷" },
];

export default function CuisineTabs({
  activeTab,
  onTabChange,
}: CuisineTabsProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-8">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          id={`tab-${tab.key}`}
          onClick={() => onTabChange(tab.key)}
          className={`
            px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer
            ${
              activeTab === tab.key
                ? "gradient-warm text-white shadow-lg shadow-primary/25 scale-105"
                : "bg-white text-muted hover:bg-surface-warm hover:text-foreground border border-border"
            }
          `}
        >
          <span className="mr-1.5">{tab.emoji}</span>
          {tab.label}
        </button>
      ))}
    </div>
  );
}
