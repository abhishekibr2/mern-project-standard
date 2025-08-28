import { useState } from 'react';
import { useForm } from 'react-hook-form';
import useAuthStore from '../hooks/useAuthStore';
import { UserIcon, EnvelopeIcon, CalendarIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, updateProfile } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      username: user?.username || '',
      email: user?.email || '',
      bio: user?.profile?.bio || '',
      location: user?.profile?.location || '',
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await updateProfile(data);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  const profileFields = [
    {
      name: 'firstName',
      label: 'First Name',
      type: 'text',
      required: true,
      icon: UserIcon,
    },
    {
      name: 'lastName',
      label: 'Last Name',
      type: 'text',
      required: true,
      icon: UserIcon,
    },
    {
      name: 'username',
      label: 'Username',
      type: 'text',
      required: true,
      icon: UserIcon,
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      required: true,
      icon: EnvelopeIcon,
    },
    {
      name: 'bio',
      label: 'Bio',
      type: 'textarea',
      required: false,
      icon: UserIcon,
    },
    {
      name: 'location',
      label: 'Location',
      type: 'text',
      required: false,
      icon: CalendarIcon,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your account settings and preferences.
          </p>
        </div>

        <div className="bg-white shadow rounded-lg">
          {/* Profile Header */}
          <div className="px-4 py-5 sm:p-6 border-b border-gray-200">
            <div className="flex items-center space-x-5">
              <div className="flex-shrink-0">
                <div className="h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl font-bold">
                    {user?.firstName?.charAt(0)}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </h3>
                <p className="text-sm text-gray-500">@{user?.username}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
              <div>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn-primary"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleCancel}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="px-4 py-5 sm:p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {profileFields.map((field) => (
                  <div key={field.name} className={field.name === 'bio' ? 'sm:col-span-2' : ''}>
                    <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <div className="relative">
                      {field.type === 'textarea' ? (
                        <textarea
                          id={field.name}
                          rows={3}
                          {...register(field.name, {
                            required: field.required ? `${field.label} is required` : false,
                          })}
                          className={`input-field ${errors[field.name] ? 'border-red-500' : ''}`}
                          placeholder={`Enter your ${field.label.toLowerCase()}`}
                          disabled={!isEditing}
                        />
                      ) : (
                        <input
                          id={field.name}
                          type={field.type}
                          {...register(field.name, {
                            required: field.required ? `${field.label} is required` : false,
                            pattern: field.name === 'email' ? {
                              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                              message: 'Invalid email address',
                            } : undefined,
                          })}
                          className={`input-field ${errors[field.name] ? 'border-red-500' : ''}`}
                          placeholder={`Enter your ${field.label.toLowerCase()}`}
                          disabled={!isEditing}
                        />
                      )}
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <field.icon className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                    {errors[field.name] && (
                      <p className="mt-1 text-sm text-red-600">{errors[field.name].message}</p>
                    )}
                  </div>
                ))}
              </div>

              {isEditing && (
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </div>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Account Actions */}
        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Account Actions
            </h3>
            <div className="space-y-4">
              <button className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200">
                Delete Account
              </button>
              <button className="w-full text-left px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 rounded-md transition-colors duration-200">
                Change Password
              </button>
              <button className="w-full text-left px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 rounded-md transition-colors duration-200">
                Export Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
