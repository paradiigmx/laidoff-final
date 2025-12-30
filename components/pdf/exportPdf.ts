import { StructuredResume } from '../../types';
import { FitSettings, DEFAULT_FIT_SETTINGS } from '../../services/fitEngine';

export async function exportResumeAsPdf(
  resume: StructuredResume,
  filename: string = 'resume.pdf',
  accentColor: string = '#0f172a',
  fitSettings?: FitSettings
): Promise<void> {
  try {
    const [reactPdfRenderer, { ResumePdfDocument }] = await Promise.all([
      import('@react-pdf/renderer'),
      import('./ResumePdfDocument'),
    ]);

    const { pdf } = reactPdfRenderer;
    const React = await import('react');

    const doc = React.createElement(ResumePdfDocument, { 
      data: resume, 
      accentColor, 
      fitSettings: fitSettings || DEFAULT_FIT_SETTINGS 
    });
    const blob = await pdf(doc).toBlob();

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('PDF export failed:', error);
    throw new Error('Failed to generate PDF. Please try again.');
  }
}
