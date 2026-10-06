import { Layout } from '../components/Layout';
import ChangePasswordForm from '../components/ChangePasswordForm';
import ProfilePhotoSection from '../components/ProfilePhotoSection';
import { useAuth } from '../context/AuthContext';

export default function AdminProfile() {
  const { user } = useAuth();

  return (
    <Layout role="ADMIN">
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">Administrator account overview</p>
        </div>

        <ProfilePhotoSection />
        {user && (
          <div className="grid grid-cols-1 xl:grid-cols-[1.3fr_0.7fr] gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="card p-6">
                <p className="text-sm text-gray-500">Admin name</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">{user.name}</p>
              </div>
              <div className="card p-6">
                <p className="text-sm text-gray-500">Email</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">{user.email}</p>
              </div>
              <div className="card p-6">
                <p className="text-sm text-gray-500">Role</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">{user.role}</p>
              </div>
              <div className="card p-6">
                <p className="text-sm text-gray-500">Account status</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">{user.status}</p>
              </div>
            </div>

            <ChangePasswordForm />
          </div>
        )}
      </div>
    </Layout>
  );
}
