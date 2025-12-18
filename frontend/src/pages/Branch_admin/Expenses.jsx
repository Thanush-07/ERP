import React, { useState, useEffect } from "react";
import axios from "axios";
import "../Company_admin/styles/CompanyDashboard.css";

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({ description: "", amount: "", date: "", category: "Utilities", customCategory: "" });
  const [offlineMode, setOfflineMode] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const branchId = user.branch_id;

  useEffect(() => { load(); }, []);

  const load = async () => {
    if (!branchId) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/branch/${branchId}/expenses`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      setExpenses(res.data || []);
      setOfflineMode(false);
    } catch (e) {
      console.warn("Expenses API not available, switching to local fallback", e.response?.status);
      if (e.response?.status === 404 || e.code === 'ERR_BAD_REQUEST') {
        const local = JSON.parse(localStorage.getItem(`expenses_local_${branchId}`) || "[]");
        setExpenses(local);
        setOfflineMode(true);
      } else {
        console.error(e);
      }
    }
  };

  const handleChange = (e) => { const { name, value } = e.target; setForm(prev => ({ ...prev, [name]: value })); };

  const submit = async () => {
    if (!form.description || !form.amount) return alert('Description and amount required');
    const payload = { ...form, amount: Number(form.amount), date: form.date || new Date().toISOString() };
    // if category is Other and customCategory provided, use that value
    if (payload.category === 'Other' && payload.customCategory && payload.customCategory.trim() !== '') {
      payload.category = payload.customCategory.trim();
    }
    delete payload.customCategory;
    try {
      await axios.post(`http://localhost:5000/api/branch/${branchId}/expenses`, payload, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      alert('Expense recorded');
      setForm({ description: "", amount: "", date: "", category: "Utilities", customCategory: "" });
      load();
    } catch (e) {
      console.warn('Backend save failed, storing locally', e.response?.status);
      if (e.response?.status === 404 || e.code === 'ERR_BAD_REQUEST') {
        const key = `expenses_local_${branchId}`;
        const local = JSON.parse(localStorage.getItem(key) || "[]");
        const item = { ...payload, _id: `local_${Date.now()}` };
        local.unshift(item);
        localStorage.setItem(key, JSON.stringify(local));
        setExpenses(prev => [item, ...prev]);
        setForm({ description: "", amount: "", date: "", category: "Utilities" });
        setOfflineMode(true);
        alert('Expense saved locally (backend endpoint not found)');
      } else {
        console.error(e);
        alert(e.response?.data?.message || 'Failed');
      }
    }
  };

  return (
    <div className="dash-panel">
      <div className="dash-panel-head">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <h2>Expenses</h2>
            <p>Track branch expenses</p>
          </div>
          {offlineMode && <div style={{color:'#b91c1c',fontWeight:600}}>Offline mode: using local data</div>}
        </div>
      </div>

      <div className="dash-panel-body">
        <div style={{display:'grid',gridTemplateColumns:'1fr 1.2fr',gap:20}}>
          <div style={{padding:12,border:'1px solid #e5e7eb',borderRadius:10,background:'#fff'}}>
            <h4 style={{marginTop:0}}>Add Expense</h4>
            <label style={{display:'block',marginTop:8}}>Category</label>
            <select name="category" value={form.category} onChange={handleChange} style={{width:'100%',padding:8,borderRadius:6}}>
              <option>Utilities</option>
              <option>Maintenance</option>
              <option>Bus</option>
              <option>Office Supplies</option>
              <option>Events</option>
              <option>Other</option>
            </select>
            {form.category === 'Other' && (
              <div style={{marginTop:8}}>
                <label style={{display:'block'}}>Specify Category</label>
                <input name="customCategory" value={form.customCategory} onChange={handleChange} style={{width:'100%',padding:8,borderRadius:6}} />
              </div>
            )}
            <label style={{display:'block',marginTop:8}}>Description</label>
            <input name="description" value={form.description} onChange={handleChange} style={{width:'100%',padding:8,borderRadius:6}} />
            <div style={{display:'flex',gap:8,marginTop:8}}>
              <div style={{flex:1}}>
                <label>Amount</label>
                <input name="amount" type="number" value={form.amount} onChange={handleChange} style={{width:'100%',padding:8,borderRadius:6}} />
              </div>
              <div style={{flex:1}}>
                <label>Date</label>
                <input name="date" type="date" value={form.date} onChange={handleChange} style={{width:'100%',padding:8,borderRadius:6}} />
              </div>
            </div>
            <div style={{marginTop:12}}>
              <button className="submit-btn" onClick={submit}>Add Expense</button>
            </div>
          </div>

          <div>
            <h4 style={{marginTop:0}}>Recent Expenses</h4>
            <div className="table-scroll">
              <table className="dash-table">
                <thead><tr><th>Date</th><th>Category</th><th>Description</th><th style={{textAlign:'right'}}>Amount</th></tr></thead>
                <tbody>
                  {expenses.map(e => (
                    <tr key={e._id}><td>{e.date ? new Date(e.date).toLocaleDateString() : ''}</td><td>{e.category}</td><td>{e.description}</td><td style={{textAlign:'right'}}>₹ {e.amount}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
   