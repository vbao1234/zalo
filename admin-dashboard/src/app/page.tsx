'use client';

import React, { useState, useEffect } from 'react';
import { getUsers, getDevices, getActiveSessions } from '../services/api';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDevices: 0,
    activeSessions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [users, devices, sessions] = await Promise.all([
        getUsers(),
        getDevices(),
        getActiveSessions(),
      ]);

      setStats({
        totalUsers: users?.length || 0,
        totalDevices: devices?.length || 0,
        activeSessions: sessions?.length || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <h1 className="text-3xl font-bold text-gray-900">
            Zalo Account Manager - Admin Dashboard
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-6 w-6 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Tổng số Users
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {loading ? '...' : stats.totalUsers}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-6 w-6 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Tổng số Devices
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {loading ? '...' : stats.totalDevices}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-6 w-6 text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Phiên đang hoạt động
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {loading ? '...' : stats.activeSessions}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Quản lý nhanh</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <a
                href="/users"
                className="block p-6 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
              >
                <h3 className="text-lg font-medium text-blue-900">
                  👤 Quản lý Users
                </h3>
                <p className="mt-2 text-sm text-blue-700">
                  Tạo, chỉnh sửa và xóa tài khoản người dùng
                </p>
              </a>

              <a
                href="/devices"
                className="block p-6 bg-green-50 hover:bg-green-100 rounded-lg transition"
              >
                <h3 className="text-lg font-medium text-green-900">
                  📱 Quản lý Devices
                </h3>
                <p className="mt-2 text-sm text-green-700">
                  Xem và gán devices cho users
                </p>
              </a>

              <a
                href="/sessions"
                className="block p-6 bg-purple-50 hover:bg-purple-100 rounded-lg transition"
              >
                <h3 className="text-lg font-medium text-purple-900">
                  🔐 Phiên đăng nhập
                </h3>
                <p className="mt-2 text-sm text-purple-700">
                  Theo dõi và quản lý sessions
                </p>
              </a>

              <a
                href="/logs"
                className="block p-6 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition"
              >
                <h3 className="text-lg font-medium text-yellow-900">
                  📊 Logs & Reports
                </h3>
                <p className="mt-2 text-sm text-yellow-700">
                  Xem logs và báo cáo hoạt động
                </p>
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
