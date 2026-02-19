import PageHeader from '@/pages/student/components/layout/PageHeader';
import SectionCard from '@/pages/student/components/common/SectionCard';
import Badge from '@/pages/student/components/common/Badge';
import { AlertTriangle, CheckCircle, FileText, Calendar, User } from 'lucide-react';
import { formatDate } from '@/pages/student/utils/formatDate';

interface DisciplinaryRecord {
  id: string;
  date: string;
  type: 'warning' | 'suspension' | 'fine' | 'counseling';
  description: string;
  actionTaken: string;
  staffRemarks: string;
  staffName: string;
  resolved: boolean;
}

const disciplinaryRecords: DisciplinaryRecord[] = [
  {
    id: '1',
    date: '2024-02-15',
    type: 'warning',
    description: 'Late submission of assignment for Database Systems course.',
    actionTaken: 'Written warning issued. Student counseled on time management.',
    staffRemarks: 'First offense. Student showed understanding and commitment to improvement.',
    staffName: 'Prof. Patel',
    resolved: true,
  },
  {
    id: '2',
    date: '2023-11-20',
    type: 'counseling',
    description: 'Attendance falling below required threshold in Operating Systems.',
    actionTaken: 'Counseling session conducted. Attendance improvement plan created.',
    staffRemarks: 'Student explained personal circumstances. Showing improvement since counseling.',
    staffName: 'Dr. Kumar',
    resolved: true,
  },
];

const getTypeVariant = (type: DisciplinaryRecord['type']): 'warning' | 'danger' | 'info' => {
  switch (type) {
    case 'suspension': return 'danger';
    case 'fine': return 'danger';
    case 'warning': return 'warning';
    default: return 'info';
  }
};

const getTypeLabel = (type: DisciplinaryRecord['type']): string => {
  switch (type) {
    case 'suspension': return 'Suspension';
    case 'fine': return 'Fine';
    case 'warning': return 'Warning';
    case 'counseling': return 'Counseling';
    default: return type;
  }
};

export default function Disciplinary() {
  const hasRecords = disciplinaryRecords.length > 0;
  const allResolved = disciplinaryRecords.every(r => r.resolved);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Disciplinary Records"
        subtitle="View your disciplinary history"
        breadcrumbs={[
          { label: 'Records', path: '/student/records/disciplinary' },
          { label: 'Disciplinary' },
        ]}
      />

      {/* Status Banner */}
      <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${!hasRecords
          ? 'bg-success/10 border border-success/20'
          : allResolved
            ? 'bg-warning/10 border border-warning/20'
            : 'bg-destructive/10 border border-destructive/20'
        }`}>
        {!hasRecords ? (
          <>
            <CheckCircle className="w-5 h-5 text-success" />
            <div>
              <p className="font-medium text-success">Clean Record</p>
              <p className="text-sm text-muted-foreground">No disciplinary records found.</p>
            </div>
          </>
        ) : allResolved ? (
          <>
            <CheckCircle className="w-5 h-5 text-warning" />
            <div>
              <p className="font-medium text-warning">All Issues Resolved</p>
              <p className="text-sm text-muted-foreground">You have {disciplinaryRecords.length} record(s), all resolved.</p>
            </div>
          </>
        ) : (
          <>
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <div>
              <p className="font-medium text-destructive">Pending Issues</p>
              <p className="text-sm text-muted-foreground">Some disciplinary matters are still pending resolution.</p>
            </div>
          </>
        )}
      </div>

      {/* Records */}
      {hasRecords ? (
        <div className="space-y-4">
          {disciplinaryRecords.map((record, index) => (
            <SectionCard
              key={record.id}
              title={`Record #${disciplinaryRecords.length - index}`}
              actions={
                <Badge variant={record.resolved ? 'success' : 'danger'}>
                  {record.resolved ? 'Resolved' : 'Pending'}
                </Badge>
              }
            >
              <div className="space-y-4">
                {/* Header Info */}
                <div className="flex flex-wrap items-center gap-4 pb-4 border-b border-border">
                  <Badge variant={getTypeVariant(record.type)}>
                    {getTypeLabel(record.type)}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {formatDate(record.date)}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <User className="w-4 h-4" />
                    {record.staffName}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-sm font-medium mb-1">Issue Description</h4>
                  <p className="text-muted-foreground">{record.description}</p>
                </div>

                {/* Action Taken */}
                <div>
                  <h4 className="text-sm font-medium mb-1">Action Taken</h4>
                  <p className="text-muted-foreground">{record.actionTaken}</p>
                </div>

                {/* Staff Remarks */}
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium mb-1">Staff Remarks</h4>
                      <p className="text-sm text-muted-foreground">{record.staffRemarks}</p>
                    </div>
                  </div>
                </div>
              </div>
            </SectionCard>
          ))}
        </div>
      ) : (
        <SectionCard title="Disciplinary History">
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Records Found</h3>
            <p className="text-muted-foreground">You have maintained a clean disciplinary record. Keep it up!</p>
          </div>
        </SectionCard>
      )}

      {/* Disclaimer */}
      <div className="mt-6 p-4 rounded-lg bg-muted/30 text-sm text-muted-foreground">
        <p>
          <strong>Note:</strong> This page displays read-only information. If you believe any record is incorrect,
          please contact the Student Affairs Office for clarification.
        </p>
      </div>
    </div>
  );
}


