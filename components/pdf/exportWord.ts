import { StructuredResume } from '../../types';

export async function exportResumeAsWord(
  resume: StructuredResume,
  filename: string = 'resume.docx'
): Promise<void> {
  try {
    // Create HTML content from resume
    let htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; margin: 1in; line-height: 1.6; }
        h1 { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
        h2 { font-size: 18px; font-weight: bold; margin-top: 20px; margin-bottom: 10px; border-bottom: 2px solid #333; padding-bottom: 5px; }
        h3 { font-size: 16px; font-weight: bold; margin-top: 15px; margin-bottom: 5px; }
        .contact { margin-bottom: 15px; }
        .section { margin-bottom: 20px; }
        ul { margin-left: 20px; }
        li { margin-bottom: 5px; }
        .experience-item { margin-bottom: 15px; }
        .job-header { font-weight: bold; margin-bottom: 5px; }
        .company { font-style: italic; }
        .dates { float: right; }
    </style>
</head>
<body>
    <h1>${resume.fullName || 'Resume'}</h1>
    <div class="contact">
        ${resume.contact?.email ? `<p>Email: ${resume.contact.email}</p>` : ''}
        ${resume.contact?.phone ? `<p>Phone: ${resume.contact.phone}</p>` : ''}
        ${resume.contact?.location ? `<p>Location: ${resume.contact.location}</p>` : ''}
        ${resume.contact?.linkedin ? `<p>LinkedIn: ${resume.contact.linkedin}</p>` : ''}
    </div>
    
    ${resume.title ? `<h2>${resume.title}</h2>` : ''}
    
    ${resume.summary ? `
    <div class="section">
        <h2>Profile</h2>
        <p>${resume.summary}</p>
    </div>
    ` : ''}
    
    ${resume.experience && resume.experience.length > 0 ? `
    <div class="section">
        <h2>Experience</h2>
        ${resume.experience.map(exp => `
            <div class="experience-item">
                <div class="job-header">
                    <span>${exp.role || ''}</span>
                    ${exp.dates ? `<span class="dates">${exp.dates}</span>` : ''}
                </div>
                <div class="company">${exp.company || ''}</div>
                ${exp.description && exp.description.length > 0 ? `
                    <ul>
                        ${exp.description.map(bullet => `<li>${bullet}</li>`).join('')}
                    </ul>
                ` : ''}
            </div>
        `).join('')}
    </div>
    ` : ''}
    
    ${resume.skills && resume.skills.length > 0 ? `
    <div class="section">
        <h2>Skills</h2>
        <p>${resume.skills.slice(0, 15).join(', ')}</p>
    </div>
    ` : ''}
    
    ${resume.education && resume.education.length > 0 ? `
    <div class="section">
        <h2>Education</h2>
        ${resume.education.map(edu => `
            <div>
                <h3>${edu.school || ''}</h3>
                <p>${edu.degree || ''}${edu.dates ? ` - ${edu.dates}` : ''}</p>
            </div>
        `).join('')}
    </div>
    ` : ''}
    
    ${resume.certifications && resume.certifications.length > 0 ? `
    <div class="section">
        <h2>Certifications</h2>
        <ul>
            ${resume.certifications.map(cert => `<li>${cert}</li>`).join('')}
        </ul>
    </div>
    ` : ''}
    
    ${resume.awards && resume.awards.length > 0 ? `
    <div class="section">
        <h2>Awards</h2>
        <ul>
            ${resume.awards.map(award => `<li>${award}</li>`).join('')}
        </ul>
    </div>
    ` : ''}
</body>
</html>
    `;

    // Create a data URI for Word-compatible HTML
    // Word can open HTML files, so we'll use HTML with proper MIME type
    const blob = new Blob(['\ufeff' + htmlContent], { type: 'application/msword' });
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    // Use .doc extension for better Word compatibility
    const docFilename = filename.endsWith('.docx') ? filename.replace('.docx', '.doc') : 
                        filename.endsWith('.doc') ? filename : `${filename}.doc`;
    link.download = docFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Word export failed:', error);
    throw new Error('Failed to generate Word document. Please try again.');
  }
}

