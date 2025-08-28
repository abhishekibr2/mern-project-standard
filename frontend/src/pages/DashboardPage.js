
import useAuthStore from '../hooks/useAuthStore';
import {
  UserIcon,
  CalendarIcon,
  ChartBarIcon,
  CogIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

const DashboardPage = () => {
  const { user } = useAuthStore();
  


  const stats = [
    { name: 'Total Users', value: '1,234', change: '+12%', changeType: 'positive' },
    { name: 'Active Sessions', value: '89', change: '+5%', changeType: 'positive' },
    { name: 'System Load', value: '67%', change: '-3%', changeType: 'negative' },
    { name: 'Response Time', value: '45ms', change: '-8%', changeType: 'positive' },
  ];

  const quickActions = [
    {
      name: 'View Profile',
      description: 'Update your personal information',
      icon: UserIcon,
      href: '/profile',
    },
    {
      name: 'System Settings',
      description: 'Configure application preferences',
      icon: CogIcon,
      href: '#',
    },
    {
      name: 'Analytics',
      description: 'View detailed reports and metrics',
      icon: ChartBarIcon,
      href: '#',
    },
    {
      name: 'Schedule',
      description: 'Manage your appointments',
      icon: CalendarIcon,
      href: '#',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back, {user?.firstName}! Here&apos;s what&apos;s happening with your account.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-primary-500 rounded-md flex items-center justify-center">
                      <ChartBarIcon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {stat.name}
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {stat.value}
                        </div>
                        <div
                          className={`ml-2 flex items-baseline text-sm font-semibold ${stat.changeType === 'positive'
                              ? 'text-green-600'
                              : 'text-red-600'
                            }`}
                        >
                          {stat.change}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {quickActions.map((action) => (
                <div
                  key={action.name}
                  className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                >
                  <div className="flex-shrink-0">
                    <action.icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <a href={action.href} className="focus:outline-none">
                      <span className="absolute inset-0" aria-hidden="true" />
                      <p className="text-sm font-medium text-gray-900">{action.name}</p>
                      <p className="text-sm text-gray-500">{action.description}</p>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Recent Activity
            </h3>
            <div className="flow-root">
              <ul className="-mb-8">
                <li className="relative pb-8">
                  <div className="relative flex space-x-3">
                    <div>
                      <span className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white">
                        <UserIcon className="h-5 w-5 text-white" />
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p className="text-sm text-gray-500">
                          Profile updated successfully
                        </p>
                      </div>
                      <div className="text-right text-sm whitespace-nowrap text-gray-500">
                        <time dateTime="2024-01-01">Just now</time>
                      </div>
                    </div>
                  </div>
                </li>
                <li className="relative pb-8">
                  <div className="relative flex space-x-3">
                    <div>
                      <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                        <ShieldCheckIcon className="h-5 w-5 text-white" />
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p className="text-sm text-gray-500">
                          Login from new device
                        </p>
                      </div>
                      <div className="text-right text-sm whitespace-nowrap text-gray-500">
                        <time dateTime="2024-01-01">2 hours ago</time>
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
