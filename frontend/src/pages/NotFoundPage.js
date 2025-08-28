
import { Link } from 'react-router-dom';
import { HomeIcon } from '@heroicons/react/24/outline';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
            <HomeIcon className="h-12 w-12" />
          </div>
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Page not found</h2>
          <p className="text-gray-500 mb-8">
            Sorry, we couldn&appointments;t find the page you&apos;re looking for.
          </p>
          <div className="space-y-4">
            <Link
              to="/"
              className="btn-primary inline-flex items-center"
            >
              <HomeIcon className="h-5 w-5 mr-2" />
              Go back home
            </Link>
            <p className="text-sm text-gray-500">
              Or{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-500">
                sign in to your account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
