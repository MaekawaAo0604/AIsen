export function MaintenancePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
            <svg
              className="w-10 h-10 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-slate-900 mb-4">メンテナンス中</h1>

          <p className="text-lg text-slate-600 mb-2">
            現在、システムのメンテナンス作業を行っております。
          </p>

          <p className="text-slate-500">
            ご不便をおかけして申し訳ございません。
            <br />
            しばらくしてから再度アクセスしてください。
          </p>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-sm border border-slate-200">
          <p className="text-sm text-slate-600">
            お急ぎの方は、以下までお問い合わせください：
          </p>
          <a
            href="mailto:support@aisen.app"
            className="mt-3 inline-block text-blue-600 hover:underline font-medium"
          >
            support@aisen.app
          </a>
        </div>

        <p className="mt-8 text-xs text-slate-400">
          © 2025 AIsen. All rights reserved.
        </p>
      </div>
    </div>
  )
}
