import React, { useEffect, useState } from 'react';

export default function Dashboard() {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({ name: '', phone: '', email: '', role: '', schedule: '' });
  const [showForm, setShowForm] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [activeTab, setActiveTab] = useState('employee');

  useEffect(() => {
    if (activeTab === 'employee') fetchEmployees();
  }, [activeTab]);

  const fetchEmployees = async () => {
    const res = await fetch('http://localhost:3001/GetEmployees');
    const data = await res.json();
    setEmployees(data.employees || []);
  };

  // Sửa hàm handleAdd:
const handleAdd = async () => {
  const res = await fetch('http://localhost:3001/AddEmployee', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(form),
  });
  const data = await res.json();
  if (data.id) {
    setForm({ name: '', phone: '', email: '', role: '', schedule: '' });
    setShowForm(false);
    fetchEmployees();
  }
};

// Sửa hàm handleDelete:
const handleDelete = async (id) => {
  await fetch(`http://localhost:3001/DeleteEmployee/${id}`, {
    method: 'DELETE',
  });
  fetchEmployees();
};


const filteredEmployees = (employees || []).filter(emp =>
  (emp.name || '').toLowerCase().includes(filterText.toLowerCase()) ||
  (emp.email || '').toLowerCase().includes(filterText.toLowerCase())
);

  return (
  <div className="flex min-h-screen bg-gray-50">
    {/* Sidebar bên trái */}
    <div className="w-64 bg-white border-r shadow-sm p-4">
      <h2 className="text-lg font-semibold mb-4">Dashboard</h2>
      <div className="flex flex-col space-y-2">
        <button
          onClick={() => setActiveTab('employee')}
          className={`text-left px-3 py-2 rounded-md ${
            activeTab === 'employee' ? 'bg-blue-100 text-blue-600 border-l-4 border-blue-500 font-medium' : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          Manage Employee
        </button>
        <button
          onClick={() => setActiveTab('task')}
          className={`text-left px-3 py-2 rounded-md ${
            activeTab === 'task' ? 'bg-blue-100 text-blue-600 border-l-4 border-blue-500 font-medium' : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          Manage Task
        </button>
        <button
          onClick={() => setActiveTab('message')}
          className={`text-left px-3 py-2 rounded-md ${
            activeTab === 'message' ? 'bg-blue-100 text-blue-600 border-l-4 border-blue-500 font-medium' : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          Message
        </button>
      </div>
    </div>

    {/* Nội dung bên phải */}
    <div className="flex-1 p-8">
      {activeTab === 'employee' && (
        <>
          <h1 className="text-3xl font-bold mb-1">Manage Employee</h1>
          <p className="text-green-600 font-medium text-lg mb-6">{filteredEmployees.length} Employee</p>

          <div className="flex items-center justify-between mb-4">
            <input
              type="text"
              placeholder="🔍 Search name or email"
              className="border px-4 py-2 rounded w-1/2"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              + Create Employee
            </button>
          </div>

          {showForm && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-white p-4 rounded shadow">
              <input
                value={form.name}
                placeholder="👤 Name"
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="border rounded px-3 py-2"
              />
              <input
                value={form.phone}
                placeholder="📞 Phone"
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="border rounded px-3 py-2"
              />
              <input
                value={form.email}
                placeholder="📧 Email"
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="border rounded px-3 py-2"
              />
              <input
                value={form.role}
                placeholder="🧑‍💼 Role"
                onChange={e => setForm({ ...form, role: e.target.value })}
                className="border rounded px-3 py-2"
              />
              <input
                value={form.schedule}
                placeholder="🕒 Schedule (e.g., 9h-17h T2-T6)"
                onChange={e => setForm({ ...form, schedule: e.target.value })}
                className="border rounded px-3 py-2 md:col-span-2"
              />
              <button
                onClick={handleAdd}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-fit"
              >
                ✅ Add
              </button>
            </div>
          )}

          <div className="overflow-x-auto bg-white rounded shadow">
            <table className="min-w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left">Employee Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map(emp => (
                  <tr key={emp.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">{emp.name}</td>
                    <td className="px-4 py-2">{emp.email}</td>
                    <td className="px-4 py-2">
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm">Active</span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex gap-2">
                        <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">Edit</button>
                        <button onClick={() => handleDelete(emp.id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === 'task' && (
        <div className="text-gray-500 text-center py-20">🛠️ Task Management content coming soon...</div>
      )}
      {activeTab === 'message' && (
        <div className="text-gray-500 text-center py-20">💬 Messaging content coming soon...</div>
      )}
    </div>
  </div>
);
}