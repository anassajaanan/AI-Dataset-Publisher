import Link from "next/link";

export default function Home() {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Dataset Publishing Platform</h1>
          <p className="text-xl text-gray-600">
            Upload, process, and publish datasets with AI-powered metadata generation
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Upload Datasets</h2>
            <p className="text-gray-600 mb-4">
              Upload CSV and Excel files with our easy-to-use drag-and-drop interface.
            </p>
            <Link
              href="/upload"
              className="text-primary hover:underline font-medium"
            >
              Start uploading →
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">AI-Powered Metadata</h2>
            <p className="text-gray-600 mb-4">
              Generate titles, descriptions, tags, and categories automatically with AI in both English and Arabic.
            </p>
            <span className="text-gray-400">
              Available after upload
            </span>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Publishing Workflow</h2>
            <p className="text-gray-600 mb-4">
              Manage the complete dataset publishing process with versioning and supervisor review.
            </p>
            <Link
              href="/dashboard"
              className="text-primary hover:underline font-medium"
            >
              View dashboard →
            </Link>
          </div>
        </div>

        <div className="bg-primary/5 p-8 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
          <ol className="list-decimal pl-5 space-y-3">
            <li>
              <span className="font-medium">Upload your dataset</span> - Start by uploading a CSV or Excel file.
            </li>
            <li>
              <span className="font-medium">Review AI-generated metadata</span> - Our system will automatically generate metadata for your dataset.
            </li>
            <li>
              <span className="font-medium">Submit for review</span> - Once you're satisfied with the metadata, submit it for supervisor review.
            </li>
            <li>
              <span className="font-medium">Publish your dataset</span> - After approval, your dataset will be published and available.
            </li>
          </ol>
          <div className="mt-6">
            <Link
              href="/upload"
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            >
              Start Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
