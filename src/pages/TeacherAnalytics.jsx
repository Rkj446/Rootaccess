import { Layout } from '../components/Layout';
import AnalyticsDashboard from '../components/AnalyticsDashboard';

export default function TeacherAnalytics() {
  return (
    <Layout role="TEACHER">
      <AnalyticsDashboard title="Academic Analytics" role="TEACHER" />
    </Layout>
  );
}
