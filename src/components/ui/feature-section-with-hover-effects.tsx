import { cn } from "@/lib/utils";
import {
  IconAdjustmentsBolt,
  IconCloud,
  IconBrain,
  IconEaseInOut,
  IconVersions,
  IconHelp,
  IconUpload,
  IconDashboard,
} from "@tabler/icons-react";

export function FeaturesSectionWithHoverEffects() {
  const features = [
    {
      title: "Easy Upload",
      description:
        "Upload your datasets in CSV or Excel format with our simple drag-and-drop interface.",
      icon: <IconUpload />,
    },
    {
      title: "AI-Powered Metadata",
      description:
        "Our AI automatically generates comprehensive metadata for your datasets, saving you time and effort.",
      icon: <IconBrain />,
    },
    {
      title: "Dataset Versioning",
      description:
        "Keep track of changes to your datasets with our powerful versioning system.",
      icon: <IconVersions />,
    },
    {
      title: "Supervisor Review",
      description: "Streamlined review process for dataset approval and publication.",
      icon: <IconAdjustmentsBolt />,
    },
    {
      title: "Intuitive Dashboard",
      description: "Monitor all your datasets from a single, user-friendly dashboard.",
      icon: <IconDashboard />,
    },
    {
      title: "Bilingual Support",
      description:
        "Full support for both English and Arabic metadata, with proper RTL formatting.",
      icon: <IconHelp />,
    },
    {
      title: "Cloud Storage",
      description:
        "Your datasets are securely stored in the cloud, accessible from anywhere.",
      icon: <IconCloud />,
    },
    {
      title: "User-Friendly Interface",
      description: "Designed with simplicity in mind, making data publishing accessible to everyone.",
      icon: <IconEaseInOut />,
    },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 relative z-10 py-10 max-w-7xl mx-auto">
      {features.map((feature, index) => (
        <Feature key={feature.title} {...feature} index={index} />
      ))}
    </div>
  );
}

const Feature = ({
  title,
  description,
  icon,
  index,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}) => {
  return (
    <div
      className={cn(
        "flex flex-col lg:border-r py-10 relative group/feature dark:border-neutral-800",
        (index === 0 || index === 4) && "lg:border-l dark:border-neutral-800",
        index < 4 && "lg:border-b dark:border-neutral-800"
      )}
    >
      {index < 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none" />
      )}
      {index >= 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none" />
      )}
      <div className="mb-4 relative z-10 px-10 text-neutral-600 dark:text-neutral-400">
        {icon}
      </div>
      <div className="text-lg font-bold mb-2 relative z-10 px-10">
        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-neutral-300 dark:bg-neutral-700 group-hover/feature:bg-primary transition-all duration-200 origin-center" />
        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-neutral-800 dark:text-neutral-100">
          {title}
        </span>
      </div>
      <p className="text-sm text-neutral-600 dark:text-neutral-300 max-w-xs relative z-10 px-10">
        {description}
      </p>
    </div>
  );
}; 