import { useLocation } from 'react-router-dom';
import PageHeader from '@/pages/student/components/layout/PageHeader';
import ExtraactivityNavBar from '@/pages/student/components/layout/ExtraactivityNavBar';
import Sports from './Sports';
import Events from './Events';

export default function Extracurricular() {
  const location = useLocation();

  // Determine which sub-page to show based on current path
  const getContent = () => {
    if (location.pathname === '/student/extracurricular/events') {
      return <Events />;
    }
    if (location.pathname === '/student/extracurricular/sports') {
      return <Sports />;
    }
    // Default to Sports if at /extracurricular
    return <Sports />;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Extra-curricular Activity"
        subtitle="Participate in sports and events"
        breadcrumbs={[
          { label: 'Extra-curricular', path: '/student/extracurricular/sports' },
        ]}
      />

      <ExtraactivityNavBar />

      {getContent()}
    </div>
  );
}


