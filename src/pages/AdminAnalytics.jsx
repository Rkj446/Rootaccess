import { Layout } from '../components/Layout';
import AnalyticsDashboard from '../components/AnalyticsDashboard';

export default function AdminAnalytics() {
  return (
    <Layout role="ADMIN">
      <AnalyticsDashboard title="Institution Analytics" role="ADMIN" />
    </Layout>
  );
}
