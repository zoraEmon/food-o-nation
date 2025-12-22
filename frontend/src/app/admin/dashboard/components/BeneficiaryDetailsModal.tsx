
import React from "react";
import { useNotification } from '@/components/ui/NotificationProvider';
import { SURVEY_OPTIONS } from '@/constants/surveyOptions';

function getImageUrl(path?: string) {
  if (!path) return 'https://placehold.co/128x128?text=No+Image';
  if (path.startsWith('http')) return path;
  if (path.startsWith('/uploads/')) return `http://localhost:5000${path}`;
  if (path.startsWith('uploads/')) return `http://localhost:5000/uploads/${path.replace(/^uploads\//, '')}`;
  if (path.startsWith('/')) return path;
  return `http://localhost:5000/uploads/${path}`;
}

interface HouseholdMember {
  id: string;
  fullName: string;
  birthDate?: string;
  age: number;
  relationship: string;
}

interface Address {
  streetNumber: string;
  barangay: string;
  municipality: string;
  region: string;
  country: string;
  zipCode: string;
}

interface User {
  id: string;
  email: string;
  status: string;
  createdAt: string;
  profileImage?: string;
}

interface BeneficiaryDetailsModalProps {
  beneficiary: {
    id: string;
    firstName: string;
    lastName: string;
    contactNumber: string;
    occupation: string;
    email?: string;
    status: string;
    createdAt?: string;
    updatedAt?: string;
    address?: Address;
    user?: User;
    signatureUrl?: string;
    governmentIdFileUrl?: string;
    governmentIdType?: string;
    householdMembers?: HouseholdMember[];
    profileImage?: string;
  };
  onClose: () => void;
}

export const BeneficiaryDetailsModal: React.FC<BeneficiaryDetailsModalProps> = ({ beneficiary, onClose }) => {
  const [showSurvey, setShowSurvey] = React.useState(false);
  const [imageModalSrc, setImageModalSrc] = React.useState('');
  const { showNotification } = useNotification();

  const formatEnum = (val?: string) => {
    if (!val) return 'N/A';
    return String(val).replace(/_/g, ' ').toLowerCase().split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const formatCurrency = (value?: number | string) => {
    if (value === null || value === undefined || value === '') return 'N/A';
    const num = typeof value === 'number' ? value : Number(String(value).replace(/[^0-9.-]+/g, ''));
    if (Number.isNaN(num)) return 'N/A';
    return num.toLocaleString('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 });
  };

  const mapSurveyAnswerToLabel = (answer: any) => {
    if (!answer) return 'N/A';
    const qType = answer.question?.type;
    const val = answer.foodFrequencyResponse || answer.foodSeverityResponse || null;
    if (!val) return 'N/A';
    const opts = SURVEY_OPTIONS[qType] || [];
    const match = opts.find((o: any) => o.value === val || o.value === String(val).toUpperCase());
    if (match) return match.label;
    // fallback to formatted enum
    return formatEnum(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div style={{ background: 'var(--card-bg)', color: 'var(--card-fg)' }} className="rounded-2xl shadow-2xl w-full max-w-2xl relative custom-scrollbar overflow-y-auto max-h-[95vh] border border-gray-200 dark:border-[#1a2a2a]">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-yellow-400 text-2xl">&times;</button>
        <div className="p-8 flex flex-col gap-8">
          {/* Personal Info */}
          <section>
            <div className="flex flex-col items-center gap-2 mb-4">
              <img src={getImageUrl(beneficiary.profileImage || beneficiary.user?.profileImage)} alt="Profile" className="w-28 h-28 rounded-full object-cover border-4 border-yellow-400 dark:border-[#FFB000] shadow-lg" />
              <h2 className="text-2xl font-bold text-[var(--primary)] dark:text-[var(--secondary)] font-heading">{beneficiary.firstName} {beneficiary.lastName}</h2>
              <span className="text-sm text-gray-700 dark:text-gray-300">{beneficiary.email || beneficiary.user?.email}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">ID: {beneficiary.id}</span>
              <div className="mt-2 inline-flex items-center gap-3 text-xs text-gray-600 dark:text-gray-300 bg-white/50 dark:bg-white/5 px-3 py-1 rounded-full">
                <div className="inline-flex items-center gap-2">
                  <span className="font-semibold">Applied:</span>
                  <span>{beneficiary.dateApplied ? new Date(beneficiary.dateApplied).toLocaleDateString() : (beneficiary.user?.createdAt ? new Date(beneficiary.user.createdAt).toLocaleDateString() : 'N/A')}</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-semibold text-gray-500 mb-1">Gender</div>
                <div className="text-sm"><span className="px-3 py-1 rounded bg-gray-100 dark:bg-[#13321e] text-sm text-[#004225] dark:text-[#FFB000] font-semibold">{formatEnum(beneficiary.gender)}</span></div>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-500 mb-1">Civil Status</div>
                <div className="text-sm text-gray-700 dark:text-gray-200">{beneficiary.civilStatus || 'N/A'}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-500 mb-1">Birth Date</div>
                <div className="text-sm text-gray-700 dark:text-gray-200">{beneficiary.birthDate ? (typeof beneficiary.birthDate === 'string' ? beneficiary.birthDate.split('T')[0] : new Date(beneficiary.birthDate).toISOString().split('T')[0]) : 'N/A'}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-500 mb-1">Age</div>
                <div className="text-sm text-gray-700 dark:text-gray-200">{beneficiary.age ?? 'N/A'}</div>
              </div>
            </div>
          </section>
          {/* Contact & Address */}
          <section>
            <h3 className="text-lg font-bold text-[#004225] dark:text-[#FFB000] mb-2">Contact & Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>

                <div className="text-xs font-semibold text-gray-500 mb-1">Primary Phone</div>
                <div className="text-sm text-gray-700 dark:text-gray-200">{beneficiary.primaryPhone || 'N/A'}</div>
              </div>
              <div className="md:col-span-2">
                <div className="text-xs font-semibold text-gray-500 mb-1">Address</div>
                <div className="text-sm text-gray-700 dark:text-gray-200">
                  {beneficiary.address ? `${beneficiary.address.streetNumber}, ${beneficiary.address.barangay}, ${beneficiary.address.municipality}, ${beneficiary.address.region}, ${beneficiary.address.country} ${beneficiary.address.zipCode}` : 'N/A'}
                </div>
              </div>
            </div>
          </section>
          {/* Household Info */}
          <section>
            <h3 className="text-lg font-bold text-[#004225] dark:text-[#FFB000] mb-2">Household</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-semibold text-gray-500 mb-1">Household Number</div>
                <div className="text-sm text-gray-700 dark:text-gray-200">{beneficiary.householdNumber ?? 'N/A'}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-500 mb-1">Annual Salary</div>
                <div className="text-sm text-gray-700 dark:text-gray-200">{formatCurrency(beneficiary.householdAnnualSalary)}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-500 mb-1">Adult Count</div>
                <div className="text-sm text-gray-700 dark:text-gray-200">{beneficiary.adultCount ?? 'N/A'}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-500 mb-1">Children Count</div>
                <div className="text-sm text-gray-700 dark:text-gray-200">{beneficiary.childrenCount ?? 'N/A'}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-500 mb-1">Senior Count</div>
                <div className="text-sm text-gray-700 dark:text-gray-200">{beneficiary.seniorCount ?? 'N/A'}</div>
              </div>
              
              {Array.isArray(beneficiary.householdMembers) && beneficiary.householdMembers.length > 0 && (
                <div className="md:col-span-2">
                  <div className="text-xs font-semibold text-gray-500 mb-1">Household Members</div>
                  <div className="rounded-lg p-4 mt-1" style={{ background: 'rgba(255,255,255,0.85)' }}>
                    <ul className="flex flex-col gap-2">
                      {beneficiary.householdMembers.map((member: any) => (
                        <li key={member.id} className="flex flex-col md:flex-row md:items-center md:gap-4 text-sm text-[#004225] dark:text-[#FFB000] bg-white/70 dark:bg-[#0f2b1f] p-2 rounded">
                          <span className="font-semibold">{member.fullName}</span>
                          <span className="ml-2 text-xs text-gray-500">({member.relationship}, Age: {member.age})</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </section>
          {/* Documents & Status */}
          <section>
            <h3 className="text-lg font-bold text-[#004225] dark:text-[#FFB000] mb-2">Documents & Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-semibold text-gray-500 mb-1">Government ID</div>
                {beneficiary.governmentIdFileUrl ? (
                  <img src={getImageUrl(beneficiary.governmentIdFileUrl)} alt="Government ID" className="w-full h-32 object-contain rounded border border-gray-200 dark:border-[#333] bg-white dark:bg-[#1a2a2a]" />
                ) : (
                  <div className="text-xs text-gray-400">No government ID uploaded.</div>
                )}
                <div className="text-xs text-gray-500 mt-1">{formatEnum(beneficiary.governmentIdType)}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-500 mb-1">Signature</div>
                {beneficiary.signatureUrl ? (
                  <img src={getImageUrl(beneficiary.signatureUrl)} alt="Signature" className="w-full h-16 object-contain rounded border border-gray-200 dark:border-[#333] bg-white dark:bg-[#1a2a2a]" />
                ) : (
                  <div className="text-xs text-gray-400">No signature uploaded.</div>
                )}
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-500 mb-1">Status</div>
                <div className="text-sm">
                  <span className="px-3 py-1 rounded bg-gray-100 dark:bg-[#13321e] text-xs text-[#004225] dark:text-[#FFB000] font-semibold">{formatEnum(beneficiary.status)}</span>
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-500 mb-1">Date Applied</div>
                <div className="text-sm text-gray-700 dark:text-gray-200">{beneficiary.dateApplied || beneficiary.user?.createdAt ? (typeof (beneficiary.dateApplied || beneficiary.user?.createdAt) === 'string' ? (beneficiary.dateApplied || beneficiary.user?.createdAt).split('T')[0] : new Date(beneficiary.dateApplied || beneficiary.user?.createdAt).toISOString().split('T')[0]) : 'N/A'}</div>
              </div>
              {beneficiary.reviewReason ? (
                <div>
                  <div className="text-xs font-semibold text-gray-500 mb-1">Review Reason</div>
                  <div className="text-sm text-gray-700 dark:text-gray-200">{beneficiary.reviewReason}</div>
                </div>
              ) : null}
              <div>
                <div className="text-xs font-semibold text-gray-500 mb-1">Reviewed At</div>
                <div className="text-sm text-gray-700 dark:text-gray-200">{beneficiary.reviewedAt ? (typeof beneficiary.reviewedAt === 'string' ? beneficiary.reviewedAt.split('T')[0] : new Date(beneficiary.reviewedAt).toISOString().split('T')[0]) : 'N/A'}</div>
              </div>

              {/* Date Approved / Rejected are shown based on view context */}
              {beneficiary.viewContext === 'official' ? (
                <div>
                  <div className="text-xs font-semibold text-gray-500 mb-1">Date Approved</div>
                  <div className="text-sm text-gray-700 dark:text-gray-200">{beneficiary.dateDecision || beneficiary.updatedAt ? (typeof (beneficiary.dateDecision || beneficiary.updatedAt) === 'string' ? (beneficiary.dateDecision || beneficiary.updatedAt).split('T')[0] : new Date(beneficiary.dateDecision || beneficiary.updatedAt).toISOString().split('T')[0]) : 'N/A'}</div>
                </div>
              ) : null}

              {beneficiary.viewContext === 'rejected' ? (
                <div>
                  <div className="text-xs font-semibold text-gray-500 mb-1">Date Rejected</div>
                  <div className="text-sm text-gray-700 dark:text-gray-200">{beneficiary.dateDecision || beneficiary.updatedAt ? (typeof (beneficiary.dateDecision || beneficiary.updatedAt) === 'string' ? (beneficiary.dateDecision || beneficiary.updatedAt).split('T')[0] : new Date(beneficiary.dateDecision || beneficiary.updatedAt).toISOString().split('T')[0]) : 'N/A'}</div>
                </div>
              ) : null}
            </div>
          </section>
          {/* Other Info */}
          <section>
            <h3 className="text-lg font-bold text-[#004225] dark:text-[#FFB000] mb-2">Other Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-semibold text-gray-500 mb-1">Declaration Accepted</div>
                <div className="text-sm text-gray-700 dark:text-gray-200">{beneficiary.declarationAccepted ? 'Yes' : 'No'}</div>
              </div>
              {beneficiary.householdPosition ? (
                <div>
                  <div className="text-xs font-semibold text-gray-500 mb-1">Household Position</div>
                  <div className="text-sm text-gray-700 dark:text-gray-200">{formatEnum(beneficiary.householdPosition)}</div>
                </div>
              ) : null}
              {beneficiary.householdPositionDetail ? (
                <div>
                  <div className="text-xs font-semibold text-gray-500 mb-1">Household Position Detail</div>
                  <div className="text-sm text-gray-700 dark:text-gray-200">{beneficiary.householdPositionDetail}</div>
                </div>
              ) : null}
              <div>
                <div className="text-xs font-semibold text-gray-500 mb-1">Monthly Income</div>
                <div className="text-sm text-gray-700 dark:text-gray-200">{formatCurrency(beneficiary.monthlyIncome)}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-500 mb-1">Privacy Accepted</div>
                <div className="text-sm text-gray-700 dark:text-gray-200">{beneficiary.privacyAccepted ? 'Yes' : 'No'}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-500 mb-1">Receiving Aid</div>
                <div className="text-sm text-gray-700 dark:text-gray-200">{beneficiary.receivingAid ? 'Yes' : 'No'}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-500 mb-1">Employment Status</div>
                <div className="text-sm text-gray-700 dark:text-gray-200">{formatEnum(beneficiary.mainEmploymentStatus)}</div>
              </div>
              {beneficiary.receivingAidDetail ? (
                <div>
                  <div className="text-xs font-semibold text-gray-500 mb-1">Receiving Aid Detail</div>
                  <div className="text-sm text-gray-700 dark:text-gray-200">{beneficiary.receivingAidDetail}</div>
                </div>
              ) : null}
              <div>
                <div className="text-xs font-semibold text-gray-500 mb-1">Special Diet Required</div>
                <div className="text-sm text-gray-700 dark:text-gray-200">{beneficiary.specialDietRequired ? 'Yes' : 'No'}</div>
              </div>
              {beneficiary.specialDietDescription ? (
                <div>
                  <div className="text-xs font-semibold text-gray-500 mb-1">Special Diet Description</div>
                  <div className="text-sm text-gray-700 dark:text-gray-200">{beneficiary.specialDietDescription}</div>
                </div>
              ) : null}
              <div>
                <div className="text-xs font-semibold text-gray-500 mb-1">Income Sources</div>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(beneficiary.incomeSources) && beneficiary.incomeSources.length > 0 ? (
                    beneficiary.incomeSources.map((src: any, idx: number) => (
                      <span key={idx} className="px-3 py-1 rounded bg-gray-100 dark:bg-[#1a2a2a] text-xs text-[#004225] dark:text-[#FFB000] border border-gray-200 dark:border-[#333]">{formatEnum(src)}</span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400">No income sources listed.</span>
                  )}
                </div>
              </div>
            </div>
          </section>
          <div className="flex justify-between mt-2">
            <div className="flex items-center gap-2">
                {/* Dev OTP helper removed */}
              </div>
            <div>
              <button onClick={() => setShowSurvey(true)} className="px-5 py-2 rounded font-semibold shadow mr-3" style={{ background: 'var(--primary)', color: 'var(--primary-fg)' }}>View Survey</button>
              <button onClick={onClose} className="px-5 py-2 rounded font-semibold shadow" style={{ background: 'var(--muted)', color: 'var(--foreground)' }}>Close</button>
            </div>
          </div>
          {showSurvey && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
              <div style={{ background: 'var(--card-bg)', color: 'var(--card-fg)' }} className="rounded-2xl shadow-2xl w-full max-w-2xl p-8 relative">
                <button onClick={() => setShowSurvey(false)} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 bg-transparent dark:bg-transparent text-2xl">&times;</button>
                <h2 className="text-2xl font-bold mb-4">Beneficiary Survey</h2>
                {Array.isArray(beneficiary.foodSecuritySurveys) && beneficiary.foodSecuritySurveys.length > 0 ? (
                  (() => {
                    const survey = beneficiary.foodSecuritySurveys[0];
                    return (
                      <div className="space-y-4">
                        <div className="text-sm">Submitted: {survey.createdAt ? (typeof survey.createdAt === 'string' ? survey.createdAt.split('T')[0] : new Date(survey.createdAt).toISOString().split('T')[0]) : 'N/A'}</div>
                        <div className="flex flex-col gap-3">
                          {Array.isArray(survey.answers) && survey.answers.length > 0 ? survey.answers.map((ans: any) => (
                            <div key={ans.id} className="rounded-md shadow-md p-4 flex gap-3 items-start" style={{ background: 'var(--card-bg)', color: 'var(--card-fg)' }}>
                              <div style={{ width: 6, minHeight: 36, borderRadius: 4, background: 'var(--secondary)' }} />
                              <div className="flex-1">
                                <div className="text-sm font-medium">{ans.question?.text || 'Question'}</div>
                                <div className="text-sm font-semibold mt-1">{mapSurveyAnswerToLabel(ans)}</div>
                              </div>
                            </div>
                          )) : (
                            <div className="text-sm">No survey answers found.</div>
                          )}
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <div className="text-sm">No survey entries for this applicant.</div>
                )}
              </div>
            </div>
          )}

          {/* Image lightbox modal */}
          {imageModalSrc && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={() => setImageModalSrc('')}>
              <img src={imageModalSrc} alt="Expanded" className="max-w-[90%] max-h-[90%] object-contain rounded" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
