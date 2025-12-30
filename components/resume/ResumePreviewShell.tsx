import React from 'react';

interface ResumePreviewShellProps {
  children: React.ReactNode;
  zoomLevel?: number;
  pageCount?: number;
}

export const ResumePreviewShell: React.FC<ResumePreviewShellProps> = ({ 
  children, 
  zoomLevel = 0.65,
  pageCount = 1 
}) => {
  return (
    <div className="resume-preview-outer h-full w-full">
      <div className="resume-preview-scroll h-full overflow-auto">
        <div className="resume-preview-center flex items-start justify-center pt-6 pb-6 min-h-full">
          <div 
            className="resume-preview-zoom-wrapper"
            style={{ 
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'top center',
              transition: 'transform 0.3s ease-out'
            }}
          >
            <div 
              className="resume-page bg-white shadow-2xl relative"
              style={{
                width: '8.5in',
                minHeight: `${pageCount * 11}in`,
              }}
            >
              <div 
                className="resume-page-content"
                style={{
                  padding: '0.5in',
                  fontFamily: 'inherit'
                }}
              >
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

