import { Layout } from '../components/Layout';

export default function StudentProfile() {
  return (
    <Layout role="STUDENT">
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">My Profile</h1>
        <div className="card p-6">
          <p className="text-gray-600">Profile page coming soon...</p>
        </div>
      </div>
    </Layout>
  );
}
