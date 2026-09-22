import { Layout } from '../components/Layout';

export default function StudentResults() {
  return (
    <Layout role="STUDENT">
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Exam Results</h1>
        <div className="card p-6">
          <p className="text-gray-600">Exam results coming soon...</p>
        </div>
      </div>
    </Layout>
  );
}
