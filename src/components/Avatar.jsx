import studentDefault from '../assets/avatars/student-default.svg';
import teacherDefault from '../assets/avatars/teacher-default.svg';
import adminDefault from '../assets/avatars/admin-default.svg';

const defaultAvatars = {
  STUDENT: studentDefault,
  TEACHER: teacherDefault,
  ADMIN: adminDefault,
};

const getImageSource = (profileImage) => {
  if (!/^\/uploads\/profile-images\/[0-9a-f-]{36}\.(?:jpg|png|webp)$/i.test(profileImage || '')) return null;
  const apiUrl = new URL(import.meta.env.VITE_API_URL || 'http://localhost:5000/api', window.location.origin);
  return new URL(profileImage, `${apiUrl.origin}/`).toString();
};

export default function Avatar({ user, className = 'h-8 w-8' }) {
  const fallback = defaultAvatars[user?.role] || studentDefault;
  const source = getImageSource(user?.profileImage) || fallback;

  return (
    <img
      src={source}
      alt={`${user?.name || 'User'} profile`}
      className={`${className} rounded-full object-cover flex-shrink-0`}
      onError={(event) => {
        event.currentTarget.onerror = null;
        event.currentTarget.src = fallback;
      }}
    />
  );
}
