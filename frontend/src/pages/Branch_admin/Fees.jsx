import React, { useState, useEffect } from "react";
import axios from "axios";
import "../Company_admin/styles/CompanyDashboard.css";
import "./Fees.css";
import CreateStructure from "./CreateStructure";

export default function Fees() {
  const [structures, setStructures] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [pendingModalOpen, setPendingModalOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [filterSection, setFilterSection] = useState("");
  const [selected, setSelected] = useState(null);
  const [structClass, setStructClass] = useState("");
  const [applyAll, setApplyAll] = useState(false);
  const [structCategories, setStructCategories] = useState([
    { name: 'Tuition', amount: 0 },
    { name: 'Bus', amount: 0 },
    { name: 'Books', amount: 0 },
    { name: 'Uniform', amount: 0 },
    { name: 'Misc', amount: 0 },
  ]);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const branchId = user?.branch_id || user?.branchId || null;
  

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    if (!branchId) return;
    setLoading(true);
    try {
      const [sres, tres, studs] = await Promise.all([
        axios.get(`http://localhost:5000/api/branch/${branchId}/fee-structures`).catch(() => ({ data: [] })),
        axios.get(`http://localhost:5000/api/branch/${branchId}/fees`).catch(() => ({ data: [] })),
        axios.get(`http://localhost:5000/api/branch/${branchId}/students`).catch(() => ({ data: [] })),
      ]);
      let structuresData = sres.data || [];
      let transactionsData = tres.data || [];
      const studentsData = studs.data || [];

      // fallback to localStorage if backend endpoints are missing
      if ((!structuresData || structuresData.length === 0) && localStorage.getItem(`fee_structures_local_${branchId}`)) {
        structuresData = JSON.parse(localStorage.getItem(`fee_structures_local_${branchId}`));
      }
      if ((!transactionsData || transactionsData.length === 0) && localStorage.getItem(`fees_local_${branchId}`)) {
        transactionsData = JSON.parse(localStorage.getItem(`fees_local_${branchId}`));
      }

      const approvedTx = (transactionsData || []).filter(t => t.status !== 'pending' && t.status !== 'rejected');
      const pendingTx = (transactionsData || []).filter(t => t.status === 'pending');

      setStructures(structuresData);
      setTransactions(approvedTx);
      setPendingPayments(pendingTx);
      setPendingModalOpen(pendingTx.length > 0);
      setStudents(studentsData);
    } catch (err) {
      console.error("Load fees data", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(st => {
    if (filterClass && String(st.class) !== String(filterClass)) return false;
    if (filterSection && st.section !== filterSection) return false;
    if (query) {
      const q = query.toLowerCase();
      return (st.name || "").toLowerCase().includes(q) || (st.admissionNumber || "").toLowerCase().includes(q);
    }
    return true;
  });

  const paymentsFor = (student) => {
    const sid = String(student?._id || "");
    const sname = String(student?.name || "").toLowerCase();
    return transactions.filter(t => {
      const tid = String(t?.studentId || "");
      const tname = String(t?.studentName || "").toLowerCase();
      return (sid && tid && tid === sid) || (sname && tname && tname === sname);
    });
  };

  const summaryByCategory = (payments) => payments.reduce((acc, p) => { acc[p.category] = (acc[p.category] || 0) + Number(p.amount || 0); return acc; }, {});

  const updatePaymentStatus = async (paymentId, status) => {
    try {
      await axios.patch(`http://localhost:5000/api/branch/${branchId}/fees/${paymentId}/status`, { status }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      await loadAll();
    } catch (err) {
      console.error('Update payment status failed', err);
      alert(err.response?.data?.message || 'Failed to update payment status');
    }
  };

  // handle posting a payment for a student/category
  // helper to POST to API or fallback to localStorage when endpoint not present
  const postOrLocal = async (path, payload, localKey) => {
    try {
      await axios.post(path, payload, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      return { ok: true };
    } catch (err) {
      console.warn('API post failed', path, err.response?.status);
      if (err.response?.status === 404 || err.code === 'ERR_BAD_REQUEST') {
        const key = `${localKey}_${branchId}`;
        const local = JSON.parse(localStorage.getItem(key) || '[]');
        const item = { ...payload, _id: `local_${Date.now()}` };
        local.unshift(item);
        localStorage.setItem(key, JSON.stringify(local));
        return { ok: false, local: true };
      }
      throw err;
    }
  };

  const handlePay = async (student, category, amount) => {
    const amtNum = Number(amount);
    if (!amtNum || amtNum <= 0) {
      alert('Enter a valid amount');
      return;
    }
    const payload = {
      studentId: student._id,
      studentName: student.name,
      class: student.class,
      category,
      amount: amtNum,
      date: new Date().toISOString(),
      mode: 'Cash'
    };
    try {
      const res = await postOrLocal(`http://localhost:5000/api/branch/${branchId}/fees`, payload, 'fees_local');
      if (res.ok) {
        alert('Payment recorded');
      } else {
        alert('Payment saved locally (backend missing)');
      }
      await loadAll();
    } catch (err) {
      console.error('Payment failed', err);
      alert(err.response?.data?.message || 'Failed to record payment');
    }
  };

  // small widget for paying a category
  function PayWidget({ student, category, due }) {
    const [amt, setAmt] = useState('');
    return (
      <div style={{marginTop:8}}>
        <input placeholder={`Pay up to ₹ ${due}`} value={amt} onChange={e=>setAmt(e.target.value)} style={{width:'100%',padding:8,borderRadius:6,border:'1px solid #d1d5db'}} />
        <div style={{display:'flex',gap:8,marginTop:8}}>
          <button className="submit-btn" onClick={()=>{ handlePay(student, category, amt); setAmt(''); }}>Pay</button>
          <button className="cancel-btn" onClick={()=>setAmt(String(due))}>Full</button>
        </div>
      </div>
    );
  }

  return (
    <>
      {pendingModalOpen && pendingPayments.length > 0 && (
        <div className="pending-modal-backdrop" onClick={() => setPendingModalOpen(false)}>
          <div className="pending-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pending-modal-header">
              <div>
                <h3>Pending Fee Approvals</h3>
                <p className="muted">Review and approve collections sent by staff</p>
              </div>
              <button className="close-btn" onClick={() => setPendingModalOpen(false)}>Close</button>
            </div>
            <div className="pending-list">
              {pendingPayments.map((p) => (
                <div key={p._id} className="pending-item">
                  <div className="pending-item-main">
                    <div className="pending-title">{p.studentName || 'Unknown student'}</div>
                    <div className="pending-sub">Class {p.class || '-'} • {p.category || 'Uncategorized'}</div>
                    <div className="pending-note">{p.note || 'No note provided'}</div>
                  </div>
                  <div className="pending-actions">
                    <div className="pending-amount">₹ {Number(p.amount || 0).toLocaleString()}</div>
                    <button className="approve-btn" onClick={() => updatePaymentStatus(p._id, 'approved')}>Approve</button>
                    <button className="reject-btn" onClick={() => updatePaymentStatus(p._id, 'rejected')}>Reject</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <section className="dash-panel">
        <div className="dash-panel-head"><h2>Students & Search</h2><p>Find students and view payments</p></div>
        <div className="dash-panel-body">
          <div style={{display:'flex',flexDirection:'column',gap:16}}>
            <div className="panel-card" style={{padding:12}}>
              <CreateStructure branchId={branchId} onSaved={loadAll} />
            </div>

            {pendingPayments.length > 0 && (
              <div className="panel-card pending-inline">
                <div>
                  <div className="pending-inline-title">Pending fee approvals</div>
                  <div className="pending-inline-sub">You have {pendingPayments.length} request(s) from staff. Click approve to record.</div>
                </div>
                <div className="pending-inline-list">
                  {pendingPayments.slice(0,3).map((p)=> (
                    <div key={p._id} className="pending-inline-chip">
                      <span>{p.studentName}</span>
                      <span>₹ {p.amount}</span>
                      <button onClick={()=>updatePaymentStatus(p._id,'approved')}>Approve</button>
                    </div>
                  ))}
                  {pendingPayments.length > 3 && (
                    <button className="link-btn" onClick={()=>setPendingModalOpen(true)}>View all pending</button>
                  )}
                  {pendingPayments.length <= 3 && (
                    <button className="link-btn" onClick={()=>setPendingModalOpen(true)}>Open pending list</button>
                  )}
                </div>
              </div>
            )}

            {/* Top grid: left = search/list, right = created fee structures */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 360px',gap:16}}>

              {/* Left: search & student list */}
              <div className="panel-card" style={{padding:12}}>
                <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:8}}>
                  <input placeholder="Search by name or admission no" value={query} onChange={e=>setQuery(e.target.value)} style={{flex:1,padding:8,borderRadius:6}} />
                </div>

                <div style={{display:'flex',gap:8,marginBottom:8}}>
                  <select value={filterClass} onChange={e=>setFilterClass(e.target.value)} style={{flex:1,padding:8,borderRadius:6}}>
                    <option value="">All Classes</option>
                    {[...Array(12)].map((_,i)=>(<option key={i+1} value={i+1}>Class {i+1}</option>))}
                  </select>
                  <select value={filterSection} onChange={e=>setFilterSection(e.target.value)} style={{width:100,padding:8,borderRadius:6}}>
                    <option value="">All</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>

                <div style={{maxHeight:440,overflow:'auto'}}>
                  <table className="dash-table" style={{width:'100%'}}>
                    <thead><tr><th>Name</th><th>Class</th><th>Section</th><th>Paid</th></tr></thead>
                    <tbody>
                      {filteredStudents.map(st => {
                        const pays = paymentsFor(st);
                        const total = pays.reduce((s,p)=>s+Number(p.amount||0),0);
                        return (
                          <tr key={st._id} style={{cursor:'pointer'}} onClick={()=>setSelected(st)}>
                            <td>{st.name}</td>
                            <td>{st.class}</td>
                            <td>{st.section}</td>
                            <td>₹ {total}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right: created fee structures (show for selected.class or filterClass) */}
              <div className="panel-card" style={{padding:12}}>
                <h3 style={{marginTop:0}}>Fee Structures</h3>
                {(() => {
                  const classKey = selected?.class || filterClass || null;
                  const list = classKey ? structures.filter(s => String(s.class) === String(classKey)) : structures;
                  if (!list || list.length === 0) return <div style={{color:'#6b7280'}}>No fee structures found</div>;
                  return (
                    <div style={{display:'flex',flexDirection:'column',gap:8}}>
                      {list.map((s,i)=> (
                        <div key={s._id || i} style={{padding:10,borderRadius:8,background:'#f8fafc',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                          <div>
                            <div style={{fontWeight:700}}>Class {s.class}</div>
                            <div style={{fontSize:12,color:'#6b7280',marginTop:6}}>{Object.keys(s.categories||{}).map(k=>`${k}: ₹${s.categories[k]}`).join(' • ')}</div>
                          </div>
                          <div style={{display:'flex',gap:8}}>
                            <button className="cancel-btn" onClick={()=>{ navigator.clipboard?.writeText(JSON.stringify(s.categories||{})); alert('Copied categories'); }}>Copy</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

            </div>

            {/* Bottom: student details modal */}
            {!selected && <div className="panel-card" style={{padding:12}}><div style={{padding:20,color:'#6b7280'}}>Select a student to see fee details</div></div>}

            {selected && (
              <div className="fees-modal-overlay" onClick={()=>setSelected(null)}>
                <div className="fees-modal" onClick={(e)=>e.stopPropagation()}>
                  <div className="fees-modal-header">
                    <div className="fees-header-left">
                      <div className="fees-avatar header-avatar">
                        {selected.image ? (
                          <img src={selected.image} alt={selected.name} />
                        ) : (
                          <span>{(selected.name||'')[0]}</span>
                        )}
                      </div>
                      <div className="fees-header-meta">
                        <h2 className="fees-student-name">{selected.name}</h2>
                        <div className="fees-chips">
                          {selected.admissionNumber && <span className="chip">Adm No: {selected.admissionNumber}</span>}
                          <span className="chip">Class {selected.class}</span>
                          <span className="chip">Section {selected.section}</span>
                        </div>
                      </div>
                    </div>
                    <button className="close-btn" onClick={()=>setSelected(null)}>Close</button>
                  </div>

                  <div className="fees-modal-body">
                    {(() => {
                      const struct = structures.find(s => String(s.class) === String(selected.class));
                      const payments = paymentsFor(selected);
                      const paidByCat = summaryByCategory(payments);
                      const categories = struct?.categories ? Object.keys(struct.categories) : Object.keys(paidByCat);
                      const totalFee = struct?.categories ? Object.values(struct.categories).reduce((s,v)=>s+Number(v||0),0) : 0;
                      const totalPaid = payments.reduce((s,p)=>s+Number(p.amount||0),0);
                      const totalDue = Math.max(0, totalFee - totalPaid);
                      const guardianNames = [selected.motherName || selected.parentName, selected.fatherName].filter(Boolean).join(' / ') || '-';
                      const address = selected.address || '-';
                      const rollNo = selected.rollNo || '-';

                      return (
                        <div className="fees-body-grid">
                          <div className="fees-column">
                            <section className="detail-card info-card">
                              <div className="section-heading">
                                <h3>Student Snapshot</h3>
                                <p>Key contact information</p>
                              </div>
                              <div className="info-pills">
                                <div className="info-pill">
                                  <span className="pill-label">Phone</span>
                                  <span className="pill-value">{selected.phoneNo || '-'}</span>
                                </div>
                                <div className="info-pill">
                                  <span className="pill-label">Parents</span>
                                  <span className="pill-value">{guardianNames}</span>
                                </div>
                                <div className="info-pill">
                                  <span className="pill-label">Roll No</span>
                                  <span className="pill-value">{rollNo}</span>
                                </div>
                                <div className="info-pill wide">
                                  <span className="pill-label">Address</span>
                                  <span className="pill-value">{address}</span>
                                </div>
                              </div>
                            </section>

                            <section className="detail-card summary-card-wrapper">
                              <div className="section-heading">
                                <h3>Fee Summary</h3>
                                <p>Overall collection status</p>
                              </div>
                              <div className="fees-summary">
                                <div className="summary-card total">
                                  <div className="summary-label">Total Fee</div>
                                  <div className="summary-value">₹ {totalFee.toLocaleString()}</div>
                                </div>
                                <div className="summary-card paid">
                                  <div className="summary-label">Paid</div>
                                  <div className="summary-value">₹ {totalPaid.toLocaleString()}</div>
                                </div>
                                <div className="summary-card due">
                                  <div className="summary-label">Due</div>
                                  <div className="summary-value">₹ {totalDue.toLocaleString()}</div>
                                </div>
                              </div>
                            </section>

                            <section className="detail-card categories-card">
                              <div className="section-heading">
                                <h3>Fee Structure &amp; Dues</h3>
                                <p>Track collections by category</p>
                              </div>
                              <div className="fees-grid">
                                {categories.map(cat => {
                                  const total = Number(struct?.categories?.[cat] || 0);
                                  const paid = Number(paidByCat[cat] || 0);
                                  const due = Math.max(0, total - paid);
                                  const percent = total>0 ? Math.round((paid/total)*100) : 0;
                                  return (
                                    <div key={cat} className="fee-card">
                                      <div className="fee-cat">{cat}</div>
                                      <div className="fee-line"><span>Total</span><strong>₹ {total}</strong></div>
                                      <div className="fee-line"><span>Paid</span><span>₹ {paid}</span></div>
                                      <div className="fee-line"><span>Due</span><span>₹ {due}</span></div>
                                      <div className="progress">
                                        <div className="progress-track">
                                          <div className="progress-fill" style={{width: `${percent}%`}}></div>
                                        </div>
                                        <span className="progress-text">{percent}%</span>
                                      </div>
                                      {due > 0 && (
                                        <PayWidget student={selected} category={cat} due={due} />
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </section>

                            <section className="detail-card history-card">
                              <div className="section-heading history-heading">
                                <h3>Payment History</h3>
                                <span className="history-count">{payments.length} record{payments.length === 1 ? '' : 's'}</span>
                              </div>
                              <div className="history-table-scroll">
                                <table className="dash-table payment-history-table">
                                  <thead><tr><th>Date</th><th>Category</th><th>Amount</th><th>Mode</th></tr></thead>
                                  <tbody>
                                    {payments.length === 0 ? (
                                      <tr>
                                        <td colSpan="4" style={{textAlign: 'center', padding: '20px', color: '#64748b'}}>
                                          No payment history found for this student
                                        </td>
                                      </tr>
                                    ) : (
                                      payments.map(p => {
                                        const when = p.date || p.createdAt;
                                        return (
                                          <tr key={p._id}>
                                            <td>{when ? new Date(when).toLocaleDateString() : '-'}</td>
                                            <td>{p.category || 'General'}</td>
                                            <td>₹ {Number(p.amount || 0).toLocaleString()}</td>
                                            <td>{p.mode || p.paymentMode || 'N/A'}</td>
                                          </tr>
                                        );
                                      })
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </section>
                          </div>

                          
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </section>
    </>
  );
}