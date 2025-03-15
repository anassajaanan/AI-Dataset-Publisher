import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GooeyFilter } from "@/components/ui/gooey-filter";
import { useScreenSize } from "@/hooks/use-screen-size";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import NewVersionDialog from '@/components/datasets/NewVersionDialog';
import { 
  FileText, 
  Database, 
  Calendar, 
  BarChart2,
  Pencil,
  Clock,
  AlertCircle,
  CheckCircle2,
  Info
} from 'lucide-react';

interface DatasetTabsProps {
  dataset: any;
  formatFileSize: (bytes: number) => string;
  formatDate: (dateString: string) => string;
  getStatusVariant: (status: string) => string;
  getStatusLabel: (status: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
  columnChunks: string[][];
  datasetId: string;
  onVersionUpdate: () => void;
}

const DatasetTabs = ({
  dataset,
  formatFileSize,
  formatDate,
  getStatusVariant,
  getStatusLabel,
  getStatusIcon,
  columnChunks,
  datasetId,
  onVersionUpdate
}: DatasetTabsProps) => {
  const [activeTab, setActiveTab] = useState(0);
  const [isGooeyEnabled, setIsGooeyEnabled] = useState(true);
  const screenSize = useScreenSize();

  // Get latest version safely
  const latestVersion = dataset?.versions?.reduce((latest: any, current: any) => 
    current.versionNumber > latest.versionNumber ? current : latest, 
    { versionNumber: -1 }
  );

  // Define the tab content
  const TAB_CONTENT = [
    {
      title: "File Information",
      icon: FileText,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/50 dark:bg-black/20 p-4 rounded-lg shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="font-medium">File Details</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Filename</h4>
                  <p className="text-lg font-medium truncate">{dataset.filename}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Size</h4>
                  <p className="text-lg font-medium">{formatFileSize(dataset.fileSize)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Created</h4>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="text-base">{formatDate(dataset.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white/50 dark:bg-black/20 p-4 rounded-lg shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <BarChart2 className="h-5 w-5 text-primary" />
                <h3 className="font-medium">Data Statistics</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Rows</h4>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-medium">{dataset.rowCount.toLocaleString()}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Columns</h4>
                  <p className="text-lg font-medium">{dataset.columns.length}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
                  <Badge variant={getStatusVariant(latestVersion.status)} className="mt-1 flex items-center gap-1 w-fit">
                    {getStatusIcon(latestVersion.status)}
                    {getStatusLabel(latestVersion.status)}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white/50 dark:bg-black/20 p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                <h3 className="font-medium">Additional Information</h3>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Version</h4>
                <p className="text-base">{latestVersion.versionNumber}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Last Updated</h4>
                <p className="text-base">{formatDate(latestVersion.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Columns",
      icon: Database,
      content: (
        <div className="space-y-6">
          <div className="bg-white/50 dark:bg-black/20 p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                <h3 className="font-medium">Dataset Columns</h3>
              </div>
              <Badge variant="outline" className="bg-primary/5">
                {dataset.columns.length} total
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-h-[350px] overflow-y-auto pr-2">
              {columnChunks.map((chunk, chunkIndex) => (
                <div key={chunkIndex} className="space-y-2">
                  {chunk.map((column: string, index: number) => (
                    <div 
                      key={index}
                      className="px-3 py-2 rounded-md bg-primary/5 hover:bg-primary/10 transition-colors text-sm font-medium truncate"
                      title={column}
                    >
                      {column}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white/50 dark:bg-black/20 p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Info className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Column Information</h3>
            </div>
            <p className="text-muted-foreground">
              This dataset contains {dataset.columns.length} columns and {dataset.rowCount.toLocaleString()} rows.
              You can explore the data by clicking on the columns above.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Version History",
      icon: Calendar,
      content: (
        <div className="space-y-6">
          <div className="bg-white/50 dark:bg-black/20 p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <h3 className="font-medium">Version Timeline</h3>
              </div>
              {latestVersion && latestVersion.status === 'draft' && (
                <NewVersionDialog 
                  datasetId={datasetId} 
                  onSuccess={onVersionUpdate}
                />
              )}
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Version</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Comments</th>
                  </tr>
                </thead>
                <tbody>
                  {dataset.versions.map((version: any) => (
                    <tr key={version._id ? version._id.toString() : `version-${version.versionNumber}`} className="border-b hover:bg-white/30 dark:hover:bg-black/10 transition-colors">
                      <td className="py-3 px-4 font-medium">{version.versionNumber}</td>
                      <td className="py-3 px-4">{formatDate(version.createdAt)}</td>
                      <td className="py-3 px-4">
                        <Badge variant={getStatusVariant(version.status)} className="flex items-center gap-1 w-fit">
                          {getStatusIcon(version.status)}
                          {getStatusLabel(version.status)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">{version.comments || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="bg-white/50 dark:bg-black/20 p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Info className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Version Information</h3>
            </div>
            <p className="text-muted-foreground">
              This dataset has {dataset.versions.length} version{dataset.versions.length !== 1 ? 's' : ''}.
              The current version is {latestVersion.versionNumber} and its status is <span className="font-medium">{getStatusLabel(latestVersion.status)}</span>.
              {latestVersion.status === 'draft' && (
                <span> You can create a new version using the "New Version" button above.</span>
              )}
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="relative w-full h-full min-h-[500px] flex justify-center p-4 bg-white dark:bg-black rounded-xl shadow-sm border">
      <GooeyFilter
        id="gooey-filter"
        strength={screenSize.lessThan("md") ? 8 : 15}
      />

      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <Badge variant="outline" className="bg-primary/5 hidden md:flex">
          {dataset.filename}
        </Badge>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsGooeyEnabled(!isGooeyEnabled)}
        >
          {isGooeyEnabled ? "Disable effect" : "Enable effect"}
        </Button>
      </div>

      <div className="w-full relative mt-16">
        <div
          className="absolute inset-0"
          style={{ filter: isGooeyEnabled ? "url(#gooey-filter)" : "none" }}
        >
          <div className="flex w-full">
            {TAB_CONTENT.map((_, index) => (
              <div key={index} className="relative flex-1 h-12 md:h-14">
                {activeTab === index && (
                  <motion.div
                    layoutId="active-tab"
                    className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/20 dark:from-primary/20 dark:to-primary/30"
                    transition={{
                      type: "spring",
                      bounce: 0.0,
                      duration: 0.4,
                    }}
                  />
                )}
              </div>
            ))}
          </div>
          {/* Content panel */}
          <div className="w-full min-h-[400px] md:min-h-[450px] bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 overflow-hidden text-foreground rounded-b-lg">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{
                  opacity: 0,
                  y: 20,
                  filter: "blur(10px)",
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  filter: "blur(0px)",
                }}
                exit={{
                  opacity: 0,
                  y: -20,
                  filter: "blur(10px)",
                }}
                transition={{
                  duration: 0.3,
                  ease: "easeOut",
                }}
                className="p-6 md:p-8"
              >
                {TAB_CONTENT[activeTab].content}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Interactive text overlay, no filter */}
        <div className="relative flex w-full">
          {TAB_CONTENT.map((tab, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className="flex-1 h-12 md:h-14 transition-all duration-200 hover:bg-primary/5"
            >
              <span
                className={`
                w-full h-full flex items-center justify-center gap-2
                ${activeTab === index ? "text-primary font-medium" : "text-muted-foreground"}
              `}
              >
                {React.createElement(tab.icon, { 
                  className: `h-4 w-4 ${activeTab === index ? 'text-primary' : 'text-muted-foreground'}`
                })}
                {tab.title}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DatasetTabs; 