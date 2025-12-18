import React, { useState } from "react";
import axios from "axios";

export default function CreateStructure({ branchId, onSaved }) {
  const [structClass, setStructClass] = useState("");
  const [applyAll, setApplyAll] = useState(false);
  const [structCategories, setStructCategories] = useState([
    { name: "Tuition", amount: 0 },
    { name: "Bus", amount: 0 },
    { name: "Books", amount: 0 },
    { name: "Uniform", amount: 0 },
    { name: "Misc", amount: 0 },
  ]);

  const postOrLocal = async (path, payload, localKey) => {
    try {
      await axios.post(path, payload, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      return { ok: true };
    } catch (err) {
      if (err.response?.status === 404 || err.code === "ERR_BAD_REQUEST") {
        const key = `${localKey}_${branchId}`;
        const local = JSON.parse(localStorage.getItem(key) || "[]");
        const item = { ...payload, _id: `local_${Date.now()}` };
        local.unshift(item);
        localStorage.setItem(key, JSON.stringify(local));
        return { ok: false, local: true };
      }
      throw err;
    }
  };

  const save = async () => {
    const cats = {};
    structCategories.forEach((c) => { if (c.name) cats[c.name] = Number(c.amount || 0); });
    if (!applyAll && !structClass) return alert("Select class or apply to all");
    try {
      if (applyAll) {
        for (let k = 1; k <= 12; k++) {
          await postOrLocal(`http://localhost:5000/api/branch/${branchId}/fee-structures`, { class: k, categories: cats }, "fee_structures_local");
        }
      } else {
        await postOrLocal(`http://localhost:5000/api/branch/${branchId}/fee-structures`, { class: structClass, categories: cats }, "fee_structures_local");
      }
      alert("Fee structure(s) saved");
      setStructClass(""); setApplyAll(false);
      setStructCategories([{ name: "Tuition", amount: 0 },{ name: "Bus", amount: 0 },{ name: "Books", amount: 0 },{ name: "Uniform", amount: 0 },{ name: "Misc", amount: 0 }]);
      if (onSaved) onSaved();
    } catch (err) {
      console.error("Save failed", err);
      alert(err.response?.data?.message || "Failed to save");
    }
  };

  return (
    <div>
      <div style={{display:'flex',gap:8,marginBottom:8,alignItems:'center'}}>
        <select value={structClass} onChange={e=>setStructClass(e.target.value)} style={{padding:8,borderRadius:6}} disabled={applyAll}>
          <option value="">Select Class</option>
          {[...Array(12)].map((_,i)=>(<option key={i+1} value={i+1}>Class {i+1}</option>))}
        </select>
        <label style={{display:'flex',alignItems:'center',gap:6}}><input type="checkbox" checked={applyAll} onChange={e=>setApplyAll(e.target.checked)} /> Apply to all classes</label>
      </div>

      <div style={{marginTop:8}}>
        {structCategories.map((c,idx)=> (
          <div key={idx} style={{display:'flex',gap:8,alignItems:'center',marginBottom:8}}>
            <input value={c.name} onChange={e=>{ const v=e.target.value; setStructCategories(prev=>prev.map((x,i)=>i===idx?{...x,name:v}:x)); }} style={{flex:1,padding:8,borderRadius:6}} />
            <input type="number" value={c.amount} onChange={e=>{ const v=e.target.value; setStructCategories(prev=>prev.map((x,i)=>i===idx?{...x,amount:v}:x)); }} style={{width:120,padding:8,borderRadius:6}} />
            <button className="cancel-btn" onClick={()=>setStructCategories(prev=>prev.filter((_,i)=>i!==idx))}>Remove</button>
          </div>
        ))}
        <div style={{marginTop:6}}>
          <button className="submit-btn" onClick={()=>setStructCategories(prev=>[...prev,{name:'New',amount:0}])}>+ Add Category</button>
        </div>
      </div>

      <div style={{marginTop:10,display:'flex',gap:8}}>
        <button className="submit-btn" onClick={save}>Save Structure</button>
        <button className="cancel-btn" onClick={()=>{ setStructClass(''); setApplyAll(false); setStructCategories([{ name: 'Tuition', amount:0 },{ name: 'Bus', amount:0 },{ name: 'Books', amount:0 },{ name: 'Uniform', amount:0 },{ name: 'Misc', amount:0 }]); }}>Reset</button>
      </div>
    </div>
  );
}
