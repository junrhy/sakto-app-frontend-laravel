import { Head } from '@inertiajs/react';

interface MaintenanceProps {
  message: string;
}

export default function Maintenance({ message }: MaintenanceProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <Head title="Maintenance Mode" />
      
      <div className="max-w-md w-full mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="text-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-16 w-16 text-yellow-500 mx-auto mb-4" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 6v6m0 0v6m0-6h6m-6 0H6" 
              />
            </svg>
            
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Maintenance Mode
            </h1>
            
            <p className="text-gray-600 mb-6">
              {message}
            </p>
            
            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-500">
                If you need immediate assistance, please contact the administrator.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 