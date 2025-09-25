// src/pages/NoAccess.jsx
export default function NoAccess() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="p-6 bg-white rounded shadow">
        <h1 className="text-lg font-semibold mb-2">No access</h1>
        <p className="text-sm text-gray-600">
          You must be an admin to access this panel.
          Thank you
        </p>
      </div>
    </div>
  );
}
