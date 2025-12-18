import React, { useState, useEffect } from "react";
import axios from "axios";
import "../Company_admin/styles/CompanyDashboard.css";
import "./Fees.css";
import CreateStructure from "./CreateStructure";

export default function Fees() {
  const [structures, setStructures] = useState([]);
  const [transactions, setTransactions] = useState([]);
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
  const branchId = user.branch_id;

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

      setStructures(structuresData);
      setTransactions(transactionsData);
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

  const paymentsFor = (student) => transactions.filter(t => t.studentId === student._id || t.studentName === student.name);

  const summaryByCategory = (payments) => payments.reduce((acc, p) => { acc[p.category] = (acc[p.category] || 0) + Number(p.amount || 0); return acc; }, {});

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
    if (!amount || Number(amount) <= 0) return alert('Enter a valid amount');
    const payload = {
      studentId: student._id,
      studentName: student.name,
      class: student.class,
      category,
      amount: Number(amount),
      date: new Date().toISOString(),
      mode: 'Cash'
    };
    try {
      const res = await postOrLocal(`http://localhost:5000/api/branch/${branchId}/fees`, payload, 'fees_local');
      if (res.ok) alert('Payment recorded'); else alert('Payment saved locally (backend missing)');
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
    
      <section className="dash-panel">
        <div className="dash-panel-head"><h2>Students & Search</h2><p>Find students and view payments</p></div>
        <div className="dash-panel-body">
          <div style={{display:'flex',flexDirection:'column',gap:16}}>
            <div className="panel-card" style={{padding:12}}>
              <CreateStructure branchId={branchId} onSaved={loadAll} />
            </div>

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

            {/* Bottom: student details full width */}
            <div className="panel-card" style={{padding:12}}>
              {!selected && <div style={{padding:20,color:'#6b7280'}}>Select a student to see fee details</div>}

              {selected && (
                <div>
                  <div style={{display:'flex',gap:16,alignItems:'center'}}>
                    <div style={{width:140,flex:'none'}}>
                      <div style={{width:140,height:140,overflow:'hidden',borderRadius:8,background:'#f3f4f6',display:'flex',alignItems:'center',justifyContent:'center'}}>
                        {selected.photo ? (
                          <img src={selected.photo} alt={selected.name} style={{width:'100%',height:'100%',objectFit:'cover'}} />
                        ) : (
                          <div style={{color:'#9ca3af'}}>{(selected.name||'')[0]}</div>
                        )}
                      </div>
                    </div>
                    <div style={{flex:1}}>
                      <h2 style={{margin:0}}>{selected.name}</h2>
                      <div style={{color:'#6b7280',marginTop:6}}>{selected.admissionNumber || ''} • Class {selected.class} • Section {selected.section}</div>
                      <div style={{marginTop:8,display:'flex',gap:12}}>
                        <div><strong>Phone:</strong> {selected.phoneNo || '-'}</div>
                        <div><strong>Parent:</strong> {selected.motherName || selected.parentName || '-'}{selected.fatherName?(' / '+selected.fatherName):''}</div>
                      </div>
                    </div>
                    <div style={{flexBasis:120,flexShrink:0,textAlign:'right'}}>
                      <button className="cancel-btn" onClick={()=>setSelected(null)}>Close</button>
                    </div>
                  </div>

                  <hr style={{margin:'16px 0'}} />

                  <h3 style={{marginTop:0}}>Fee Structure & Dues</h3>
                  {(() => {
                    const struct = structures.find(s => String(s.class) === String(selected.class));
                    const pays = paymentsFor(selected);
                    const paidByCat = summaryByCategory(pays);
                    const categories = struct?.categories ? Object.keys(struct.categories) : Object.keys(paidByCat);
                    return (
                      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:12}}>
                        {categories.map(cat => {
                          const total = Number(struct?.categories?.[cat] || 0);
                          const paid = Number(paidByCat[cat] || 0);
                          const due = Math.max(0, total - paid);
                          return (
                            <div key={cat} style={{padding:12,borderRadius:8,background:'#f8fafc'}}>
                              <div style={{fontSize:12,color:'#6b7280'}}>{cat}</div>
                              <div style={{fontWeight:700,fontSize:16}}>Total: ₹ {total}</div>
                              <div style={{marginTop:6}}>Paid: ₹ {paid}</div>
                              <div style={{marginTop:6}}>Due: ₹ {due}</div>
                              {due > 0 && (
                                <PayWidget student={selected} category={cat} due={due} onPaid={async (amt)=>{ /* will be replaced below */ }} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}

                  <hr style={{margin:'16px 0'}} />

                  <h3>Payment History</h3>
                  <div className="table-scroll">
                    <table className="dash-table">
                      <thead><tr><th>Date</th><th>Category</th><th>Amount</th><th>Mode</th></tr></thead>
                      <tbody>
                        {paymentsFor(selected).map(p=> (
                          <tr key={p._id}><td>{p.date?new Date(p.date).toLocaleDateString():''}</td><td>{p.category}</td><td>₹ {p.amount}</td><td>{p.mode||p.paymentMode||'N/A'}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>
    
  );
}