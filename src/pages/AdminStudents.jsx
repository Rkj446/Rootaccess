import { Layout } from '../components/Layout';

export default function AdminStudents() {
  return (
    <Layout role="ADMIN">
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Student Management</h1>
        <div className="card p-6">
          <p className="text-gray-600">Student management tools coming soon...</p>
        </div>
      </div>
    </Layout>
  );
}
