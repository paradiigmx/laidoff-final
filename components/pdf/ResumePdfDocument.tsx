import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { StructuredResume } from '../../types';
import { 
  FitSettings, 
  DEFAULT_FIT_SETTINGS, 
  getDisplaySkills, 
  trimToWordLimit,
  trimToCharLimit,
  getBulletsPerRole 
} from '../../services/fitEngine';

Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff2', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hjp-Ek-_EeA.woff2', fontWeight: 700 },
  ],
});

const createStyles = (fitSettings: FitSettings) => StyleSheet.create({
  page: {
    fontFamily: 'Inter',
    fontSize: fitSettings.baseFontSize - 2,
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 36,
    lineHeight: fitSettings.lineHeight,
    color: '#1e293b',
  },
  header: {
    marginBottom: 20,
  },
  name: {
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 4,
    color: '#0f172a',
  },
  title: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8,
  },
  contactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    fontSize: 9,
    color: '#64748b',
  },
  contactItem: {
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 4,
    marginBottom: 10,
    marginTop: 16,
  },
  summary: {
    fontSize: 10,
    lineHeight: 1.5,
    color: '#475569',
    marginBottom: 4,
  },
  experienceItem: {
    marginBottom: 14,
  },
  expHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  expRole: {
    fontSize: 11,
    fontWeight: 700,
    color: '#1e293b',
  },
  expDates: {
    fontSize: 9,
    color: '#64748b',
  },
  expCompany: {
    fontSize: 10,
    color: '#475569',
    marginBottom: 6,
  },
  bulletList: {
    paddingLeft: 12,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  bulletPoint: {
    width: 10,
    fontSize: 10,
  },
  bulletText: {
    flex: 1,
    fontSize: 9,
    lineHeight: 1.4,
    color: '#475569',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  skillTag: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
    fontSize: 9,
    color: '#475569',
    marginRight: 6,
    marginBottom: 4,
  },
  twoColumn: {
    flexDirection: 'row',
    gap: 20,
  },
  column: {
    flex: 1,
  },
  educationItem: {
    marginBottom: 8,
  },
  eduSchool: {
    fontSize: 10,
    fontWeight: 700,
    color: '#1e293b',
  },
  eduDegree: {
    fontSize: 9,
    color: '#475569',
  },
  eduDates: {
    fontSize: 8,
    color: '#94a3b8',
  },
  certItem: {
    fontSize: 9,
    color: '#475569',
    marginBottom: 3,
  },
});

interface ResumePdfDocumentProps {
  data: StructuredResume;
  accentColor?: string;
  fitSettings?: FitSettings;
}

export const ResumePdfDocument: React.FC<ResumePdfDocumentProps> = ({ data, accentColor = '#0f172a', fitSettings }) => {
  const fs = fitSettings || DEFAULT_FIT_SETTINGS;
  const styles = createStyles(fs);
  
  const roleCount = data.experience?.length || 0;
  const maxBullets = Math.min(fs.maxBulletsPerRole, getBulletsPerRole(roleCount));
  const { visible: visibleSkills, overflow: skillsOverflow } = getDisplaySkills(data.skills, fs.maxSkillsShown);
  const displaySummary = data.summary ? trimToWordLimit(data.summary, fs.summaryMaxWords) : '';
  
  const maxCertsPage1 = roleCount >= 5 ? 1 : (data.certifications?.length || 0);
  const displayCerts = data.certifications?.slice(0, maxCertsPage1).map(c => trimToCharLimit(c, fs.certMaxChars)) || [];
  const compactEducation = roleCount >= 5;

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <Text style={[styles.name, { color: accentColor }]}>{data.fullName}</Text>
          {data.title && <Text style={styles.title}>{data.title}</Text>}
          <View style={styles.contactRow}>
            {data.contact?.email && <Text style={styles.contactItem}>{data.contact.email}</Text>}
            {data.contact?.phone && <Text style={styles.contactItem}>{data.contact.phone}</Text>}
            {data.contact?.location && <Text style={styles.contactItem}>{data.contact.location}</Text>}
            {data.contact?.linkedin && <Text style={styles.contactItem}>{data.contact.linkedin}</Text>}
          </View>
        </View>

        {displaySummary && (
          <View>
            <Text style={[styles.sectionTitle, { color: accentColor }]}>Profile</Text>
            <Text style={styles.summary}>{displaySummary}</Text>
          </View>
        )}

        {data.experience && data.experience.length > 0 && (
          <View>
            <Text style={[styles.sectionTitle, { color: accentColor }]}>Experience</Text>
            {data.experience.map((exp, idx) => {
              const bullets = exp.description?.slice(0, maxBullets).map(b => trimToWordLimit(b, fs.bulletMaxWords)) || [];
              return (
                <View key={idx} style={styles.experienceItem} wrap={false}>
                  <View style={styles.expHeader}>
                    <Text style={styles.expRole}>{exp.role}</Text>
                    <Text style={styles.expDates}>{exp.dates}</Text>
                  </View>
                  <Text style={styles.expCompany}>{exp.company}</Text>
                  <View style={styles.bulletList}>
                    {bullets.map((bullet, bidx) => (
                      <View key={bidx} style={styles.bulletItem}>
                        <Text style={styles.bulletPoint}>•</Text>
                        <Text style={styles.bulletText}>{bullet}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <View style={styles.twoColumn}>
          <View style={styles.column}>
            {visibleSkills.length > 0 && (
              <View>
                <Text style={[styles.sectionTitle, { color: accentColor }]}>Skills</Text>
                <View style={styles.skillsContainer}>
                  {visibleSkills.map((skill, idx) => (
                    <Text key={idx} style={styles.skillTag}>{skill}</Text>
                  ))}
                  {skillsOverflow > 0 && (
                    <Text style={[styles.skillTag, { backgroundColor: '#cbd5e1' }]}>+{skillsOverflow} more</Text>
                  )}
                </View>
              </View>
            )}

            {data.software && data.software.length > 0 && (
              <View>
                <Text style={[styles.sectionTitle, { color: accentColor }]}>Software & Tools</Text>
                <View style={styles.skillsContainer}>
                  {data.software.map((item, idx) => (
                    <Text key={idx} style={styles.skillTag}>{item}</Text>
                  ))}
                </View>
              </View>
            )}
          </View>

          <View style={styles.column}>
            {data.education && data.education.length > 0 && (
              <View>
                <Text style={[styles.sectionTitle, { color: accentColor }]}>Education</Text>
                {data.education.map((edu, idx) => (
                  <View key={idx} style={styles.educationItem}>
                    <Text style={styles.eduSchool}>{edu.school}</Text>
                    <Text style={styles.eduDegree}>{edu.degree}</Text>
                    {!compactEducation && edu.dates && <Text style={styles.eduDates}>{edu.dates}</Text>}
                  </View>
                ))}
              </View>
            )}

            {displayCerts.length > 0 && (
              <View>
                <Text style={[styles.sectionTitle, { color: accentColor }]}>Certifications</Text>
                {displayCerts.map((cert, idx) => (
                  <Text key={idx} style={styles.certItem}>• {cert}</Text>
                ))}
              </View>
            )}

            {data.awards && data.awards.length > 0 && (
              <View>
                <Text style={[styles.sectionTitle, { color: accentColor }]}>Awards</Text>
                {data.awards.map((award, idx) => (
                  <Text key={idx} style={styles.certItem}>★ {award}</Text>
                ))}
              </View>
            )}
          </View>
        </View>
      </Page>
    </Document>
  );
};
