import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { useAuthStore } from '../../stores/authStore';
import SidebarHR from '../../components/SidebarHR';
import { HRToastStack, useHRToast } from '../../components/HRToast';
import { LoadingSpinner } from '../../components/LoadingSpinner';

const IC = {
  Search:       () => <svg width='15' height='15' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><circle cx='11' cy='11' r='8'/><line x1='21' y1='21' x2='16.65' y2='16.65'/></svg>,
  MapPin:       () => <svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z'></path><circle cx='12' cy='10' r='3'></circle></svg>,
  ChevronDown:  () => <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><polyline points='6 9 12 15 18 9'/></svg>,
  FileText:     () => <svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'/><polyline points='14 2 14 8 20 8'/><line x1='16' y1='13' x2='8' y2='13'/><line x1='16' y1='17' x2='8' y2='17'/><polyline points='10 9 9 9 8 9'/></svg>,
  Video:        () => <svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><polygon points='23 7 16 12 23 17 23 7'></polygon><rect x='1' y='5' width='15' height='14' rx='2' ry='2'></rect></svg>,
  Folder:       () => <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z'/></svg>,
  ExternalLink: () => <svg width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6'/><polyline points='15 3 21 3 21 9'/><line x1='10' y1='14' x2='21' y2='3'/></svg>,
  X:            () => <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><line x1='18' y1='6' x2='6' y2='18'/><line x1='6' y1='6' x2='18' y2='18'/></svg>,
  Sparkles:     () => <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z'/><path d='M5 3l.9 2.1L8 6l-2.1.9L5 9l-.9-2.1L2 6l2.1-.9z'/><path d='M19 15l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9z'/></svg>,
  AlignLeft:    () => <svg width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><line x1='17' y1='10' x2='3' y2='10'/><line x1='21' y1='6' x2='3' y2='6'/><line x1='21' y1='14' x2='3' y2='14'/><line x1='17' y1='18' x2='3' y2='18'/></svg>,
  BarChart2:    () => <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><line x1='18' y1='20' x2='18' y2='10'/><line x1='12' y1='20' x2='12' y2='4'/><line x1='6' y1='20' x2='6' y2='14'/><line x1='2' y1='20' x2='22' y2='20'/></svg>,
  Info:         () => <svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><circle cx='12' cy='12' r='10'/><line x1='12' y1='16' x2='12' y2='12'/><line x1='12' y1='8' x2='12.01' y2='8'/></svg>,
  ChevronUp:    () => <svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><polyline points='18 15 12 9 6 15'/></svg>,
  Zap:          () => <svg width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><polygon points='13 2 3 14 12 14 11 22 21 10 12 10 13 2'/></svg>,
  Send:         () => <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><line x1='22' y1='2' x2='11' y2='13'></line><polygon points='22 2 15 22 11 13 2 9 22 2'></polygon></svg>,
  MessageSquare: () => <svg width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'></path></svg>,
};

function todayStr() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });
}

const MONTHS_FULL  = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS_SHORT   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

// ─── Suggestion config ────────────────────────────────────────────────────────
const SUGGESTION_CFG = {
  Pass:   { bg: '#f0fdf4', color: '#15803d', border: '#86efac' },
  Review: { bg: '#fefce8', color: '#a16207', border: '#fde68a' },
  Reject: { bg: '#fff1f2', color: '#be123c', border: '#fecdd3' },
};

// ─── Existing helpers (unchanged) ────────────────────────────────────────────
function DocBtn({ label, onClick }) {
  return (
    <button type='button' onClick={onClick}
      style={{ display:'flex',alignItems:'center',gap:'5px',padding:'4px 10px',borderRadius:'7px',border:'1px solid #bfdbfe',background:'#eff6ff',color:'#1d4ed8',fontSize:'11.5px',fontWeight:'600',cursor:'pointer',fontFamily:'inherit',transition:'all 0.15s' }}
      onMouseEnter={e=>{e.currentTarget.style.borderColor='#93c5fd';e.currentTarget.style.background='#dbeafe'}}
      onMouseLeave={e=>{e.currentTarget.style.borderColor='#bfdbfe';e.currentTarget.style.background='#eff6ff'}}
    ><IC.FileText />{label}</button>
  );
}

function formatDateToFrontend(dateStr) {
  if (!dateStr) return 'Select date…';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const [y,m,d] = parts;
  return `${parseInt(d)} ${MONTHS_SHORT[parseInt(m)-1]} ${y}`;
}

function CalendarPicker({ value, onChange }) {
  const [open, setOpen]   = useState(false);
  const [year, setYear]   = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const ref = useRef(null);
  useEffect(()=>{ const fn=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false)};document.addEventListener('mousedown',fn);return()=>document.removeEventListener('mousedown',fn) },[]);
  const now=new Date();now.setHours(0,0,0,0);
  const totalDays=new Date(year,month+1,0).getDate();
  const startDay=new Date(year,month,1).getDay();
  const pickDate=d=>{const mm=month+1<10?`0${month+1}`:month+1;const dd=d<10?`0${d}`:d;onChange(`${year}-${mm}-${dd}`);setOpen(false)};
  const days=[];for(let i=0;i<startDay;i++)days.push(null);for(let d=1;d<=totalDays;d++)days.push(d);
  return (
    <div ref={ref} style={{position:'relative',width:'220px'}}>
      <div onClick={()=>setOpen(!open)} style={{display:'flex',alignItems:'center',border:`1.5px solid ${open?'#3b82f6':'#cbd5e1'}`,borderRadius:8,overflow:'hidden',cursor:'pointer',background:'#fff',boxShadow:open?'0 0 0 3px rgba(59,130,246,.12)':'none',transition:'all .15s'}}>
        <div style={{flex:1,padding:'9px 13px',textAlign:'left',fontSize:13,color:value?'#0f172a':'#cbd5e1',fontFamily:'inherit'}}>{formatDateToFrontend(value)}</div>
        <div style={{width:38,display:'flex',alignItems:'center',justifyContent:'center',color:'#64748b'}}><svg width='16' height='16' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'><rect x='3' y='4' width='18' height='18' rx='2'/><line x1='16' y1='2' x2='16' y2='6'/><line x1='8' y1='2' x2='8' y2='6'/><line x1='3' y1='10' x2='21' y2='10'/></svg></div>
      </div>
      {open&&(
        <div style={{position:'absolute',top:'calc(100% + 6px)',left:0,zIndex:400,background:'#fff',border:'1px solid #e2e8f0',borderRadius:12,boxShadow:'0 8px 32px rgba(0,0,0,.14)',padding:12,width:'220px',boxSizing:'border-box'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
            <button onClick={()=>{if(month===0){setMonth(11);setYear(y=>y-1)}else setMonth(m=>m-1)}} style={{width:28,height:28,border:'1px solid #e2e8f0',borderRadius:6,background:'#fff',cursor:'pointer',fontSize:13,color:'#64748b',display:'flex',alignItems:'center',justifyContent:'center'}}>‹</button>
            <span style={{fontSize:14,fontWeight:700,color:'#0f172a'}}>{MONTHS_FULL[month]} {year}</span>
            <button onClick={()=>{if(month===11){setMonth(0);setYear(y=>y+1)}else setMonth(m=>m+1)}} style={{width:28,height:28,border:'1px solid #e2e8f0',borderRadius:6,background:'#fff',cursor:'pointer',fontSize:13,color:'#64748b',display:'flex',alignItems:'center',justifyContent:'center'}}>›</button>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:2,marginBottom:2}}>{DAYS_SHORT.map(d=><div key={d} style={{fontSize:10,fontWeight:700,color:'#94a3b8',textAlign:'center',padding:'4px 0'}}>{d}</div>)}</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:2}}>
            {days.map((d,i)=>{if(!d)return<div key={i}/>;const date=new Date(year,month,d);const isPast=date<now;const isToday=date.getTime()===now.getTime();const mm=month+1<10?`0${month+1}`:month+1;const dd=d<10?`0${d}`:d;const dateStr=`${year}-${mm}-${dd}`;const isSel=value===dateStr;return(<div key={i} onClick={()=>!isPast&&pickDate(d)} style={{fontSize:12.5,textAlign:'center',padding:'6px 2px',borderRadius:6,cursor:isPast?'default':'pointer',color:isSel?'#fff':isPast?'#cbd5e1':isToday?'#3b82f6':'#334155',background:isSel?'#3b82f6':'transparent',fontWeight:isSel||isToday?700:400}} onMouseEnter={e=>{if(!isPast&&!isSel)e.currentTarget.style.background='#eff6ff'}} onMouseLeave={e=>{if(!isSel)e.currentTarget.style.background='transparent'}}>{d}</div>);})}
          </div>
        </div>
      )}
    </div>
  );
}

function CustomTimePicker({ value, onChange }) {
  const [open,setOpen]=useState(false);const [selectedHour,setSelectedHour]=useState('09');const [selectedMinute,setSelectedMinute]=useState('00');const [selectedPeriod,setSelectedPeriod]=useState('AM');const ref=useRef(null);
  useEffect(()=>{if(value){const parts=value.split(':');if(parts.length===2){let h=parseInt(parts[0],10);let m=parts[1];let p='AM';if(h>=12){p='PM';if(h>12)h-=12}if(h===0)h=12;setSelectedHour(h<10?`0${h}`:`${h}`);setSelectedMinute(m);setSelectedPeriod(p)}}},[value]);
  useEffect(()=>{const fn=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false)};document.addEventListener('mousedown',fn);return()=>document.removeEventListener('mousedown',fn)},[]);
  const hours=Array.from({length:12},(_,i)=>{const h=i+1;return h<10?`0${h}`:`${h}`});
  const minutes=Array.from({length:60},(_,i)=>i<10?`0${i}`:`${i}`);
  const updateTime=(h,m,p)=>{let hour24=parseInt(h,10);if(p==='PM'&&hour24<12)hour24+=12;if(p==='AM'&&hour24===12)hour24=0;const h24Str=hour24<10?`0${hour24}`:`${hour24}`;onChange(`${h24Str}:${m}`)};
  return (
    <div ref={ref} style={{position:'relative',width:'220px'}}>
      <style>{`.tsc::-webkit-scrollbar{width:5px}.tsc::-webkit-scrollbar-track{background:#fff}.tsc::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:10px}`}</style>
      <div onClick={()=>setOpen(!open)} style={{display:'flex',alignItems:'center',border:`1.5px solid ${open?'#3b82f6':'#cbd5e1'}`,borderRadius:8,overflow:'hidden',cursor:'pointer',background:'#fff',transition:'all .15s'}}>
        <div style={{flex:1,padding:'10px 12px',textAlign:'left',fontSize:13,color:value?'#0f172a':'#cbd5e1',fontFamily:'inherit'}}>{value?`${selectedHour}:${selectedMinute} ${selectedPeriod}`:'Select time…'}</div>
        <div style={{width:38,display:'flex',alignItems:'center',justifyContent:'center',color:'#64748b'}}><svg width='16' height='16' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'><circle cx='12' cy='12' r='10'/><polyline points='12 6 12 12 16 14'/></svg></div>
      </div>
      {open&&(
        <div style={{position:'absolute',top:'calc(100% + 6px)',left:0,zIndex:400,background:'#fff',border:'1px solid #e2e8f0',borderRadius:12,boxShadow:'0 8px 32px rgba(0,0,0,.14)',padding:'16px',width:'220px',boxSizing:'border-box'}}>
          <div style={{marginBottom:'16px',display:'flex',alignItems:'center',gap:'6px'}}>
            <div style={{flex:1}}><label style={{fontSize:'10px',fontWeight:'700',color:'#64748b',display:'block',marginBottom:'4px',textTransform:'uppercase'}}>Hour</label><input type='text' maxLength='2' value={selectedHour} onChange={e=>{const val=e.target.value.replace(/\D/g,'');if(val.length<=2){setSelectedHour(val);const hNum=parseInt(val,10);if(hNum>=1&&hNum<=12){const hStr=hNum<10?`0${hNum}`:`${hNum}`;updateTime(hStr,selectedMinute,selectedPeriod)}}}} style={{width:'100%',padding:'6px',border:'1px solid #cbd5e1',borderRadius:'6px',fontSize:'13px',background:'#fff',color:'#1e293b',boxSizing:'border-box',outline:'none',textAlign:'center'}}/></div>
            <div style={{fontSize:'16px',fontWeight:'bold',color:'#cbd5e1',marginTop:'14px'}}>:</div>
            <div style={{flex:1}}><label style={{fontSize:'10px',fontWeight:'700',color:'#64748b',display:'block',marginBottom:'4px',textTransform:'uppercase'}}>Minute</label><input type='text' maxLength='2' value={selectedMinute} onChange={e=>{const val=e.target.value.replace(/\D/g,'');if(val.length<=2){setSelectedMinute(val);const mNum=parseInt(val,10);if(mNum>=0&&mNum<=59){const mStr=mNum<10?`0${mNum}`:`${mNum}`;updateTime(selectedHour,mStr,selectedPeriod)}}}} style={{width:'100%',padding:'6px',border:'1px solid #cbd5e1',borderRadius:'6px',fontSize:'13px',background:'#fff',color:'#1e293b',boxSizing:'border-box',outline:'none',textAlign:'center'}}/></div>
            <div style={{flex:1}}><label style={{fontSize:'10px',fontWeight:'700',color:'#64748b',display:'block',marginBottom:'4px',textTransform:'uppercase'}}>AM/PM</label><div onClick={()=>{const nextP=selectedPeriod==='AM'?'PM':'AM';setSelectedPeriod(nextP);updateTime(selectedHour,selectedMinute,nextP)}} style={{padding:'6px',border:'1px solid #cbd5e1',borderRadius:'6px',fontSize:'13px',background:'#f8fafc',color:'#1e293b',cursor:'pointer',textAlign:'center',userSelect:'none',marginTop:'2px'}}>{selectedPeriod}</div></div>
          </div>
          <div style={{display:'flex',gap:'8px',height:'180px'}}>
            <div className='tsc' style={{flex:1,overflowY:'auto',border:'1px solid #f1f5f9',borderRadius:'6px',background:'#fff'}}><div style={{fontSize:'10px',fontWeight:'800',textAlign:'center',color:'#94a3b8',padding:'4px 0',position:'sticky',top:0,background:'#fff'}}>HR</div>{hours.map(h=>{const isSel=selectedHour===h;return(<div key={h} onClick={()=>{setSelectedHour(h);updateTime(h,selectedMinute,selectedPeriod)}} style={{fontSize:'12px',padding:'6px 0',textAlign:'center',cursor:'pointer',background:isSel?'#3b82f6':'transparent',color:isSel?'#fff':'#475569',fontWeight:isSel?'700':'500'}}>{h}</div>)})}</div>
            <div className='tsc' style={{flex:1,overflowY:'auto',border:'1px solid #f1f5f9',borderRadius:'6px',background:'#fff'}}><div style={{fontSize:'10px',fontWeight:'800',textAlign:'center',color:'#94a3b8',padding:'4px 0',position:'sticky',top:0,background:'#fff'}}>MIN</div>{minutes.map(m=>{const isSel=selectedMinute===m;return(<div key={m} onClick={()=>{setSelectedMinute(m);updateTime(selectedHour,m,selectedPeriod)}} style={{fontSize:'12px',padding:'6px 0',textAlign:'center',cursor:'pointer',background:isSel?'#3b82f6':'transparent',color:isSel?'#fff':'#475569',fontWeight:isSel?'700':'500'}}>{m}</div>)})}</div>
            <div className='tsc' style={{width:'60px',overflowY:'auto',border:'1px solid #f1f5f9',borderRadius:'6px',background:'#fff',display:'flex',flexDirection:'column',justifyContent:'center'}}>{['AM','PM'].map(p=>{const isSel=selectedPeriod===p;return(<div key={p} onClick={()=>{setSelectedPeriod(p);updateTime(selectedHour,selectedMinute,p)}} style={{fontSize:'12px',padding:'12px 0',textAlign:'center',cursor:'pointer',background:isSel?'#3b82f6':'transparent',color:isSel?'#fff':'#475569',fontWeight:isSel?'700':'500',borderRadius:'4px',margin:'2px'}}>{p}</div>)})}</div>
          </div>
        </div>
      )}
    </div>
  );
}

const VARIANT = {
  green: { bg:'#f0fdf4',color:'#15803d',border:'#86efac' },
  red:   { bg:'#fff1f2',color:'#be123c',border:'#fecdd3' },
  blue:  { bg:'#eff6ff',color:'#1d4ed8',border:'#bfdbfe' },
};

const DOC_TYPES = [
  { key:'has_cv',                  label:'CV / Resume',         type:'cv' },
  { key:'has_supporting_document', label:'Supporting Document', type:'supporting_document' },
  { key:'has_portfolio',           label:'Additional Portfolio', type:'portfolio' },
];

function IconBtn({ icon, title, onClick, color='#475569', bgHov='#f1f5f9', active=false }) {
  const [hov,setHov]=useState(false);
  return (
    <button title={title} onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ width:'28px',height:'28px',display:'flex',alignItems:'center',justifyContent:'center',borderRadius:'7px',border:`1px solid ${active?'#bfdbfe':'#e2e8f0'}`,background:active?'#eff6ff':hov?bgHov:'#fff',color:active?'#1d4ed8':color,cursor:'pointer',transition:'all 0.15s',flexShrink:0 }}>
      {icon}
    </button>
  );
}

function DocItem({ label, onView }) {
  const [hov,setHov]=useState(false);
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 14px',borderRadius:'10px',border:'1px solid #e2e8f0',background:hov?'#f8fafc':'#fff',transition:'background 0.15s'}}>
      <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
        <div style={{width:'30px',height:'30px',borderRadius:'8px',background:'#eff6ff',color:'#3b82f6',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><IC.FileText /></div>
        <span style={{fontSize:'13px',fontWeight:'600',color:'#1e293b'}}>{label}</span>
      </div>
      <button onClick={onView} style={{display:'flex',alignItems:'center',gap:'4px',padding:'5px 10px',borderRadius:'7px',fontSize:'11.5px',fontWeight:'600',cursor:'pointer',border:'1px solid #bfdbfe',background:'#eff6ff',color:'#1d4ed8',fontFamily:'inherit',transition:'all 0.15s'}}>
        <IC.ExternalLink /> Open
      </button>
    </div>
  );
}

function DocListModal({ candidate, onClose, onViewDoc }) {
  if (!candidate) return null;
  const available = DOC_TYPES.filter(d => candidate[d.key]);
  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{position:'fixed',inset:0,background:'rgba(10,22,40,0.5)',zIndex:400,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}>
      <div style={{background:'#fff',borderRadius:'16px',width:'100%',maxWidth:'380px',overflow:'hidden'}}>
        <div style={{padding:'18px 22px',borderBottom:'1px solid #f1f5f9',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div><h3 style={{margin:0,fontSize:'14px',fontWeight:'700',color:'#0f172a'}}>Documents</h3><p style={{margin:'2px 0 0',fontSize:'11.5px',color:'#94a3b8'}}>{candidate.name}</p></div>
          <IconBtn icon={<IC.X/>} title='Close' onClick={onClose}/>
        </div>
        <div style={{padding:'16px 22px',display:'flex',flexDirection:'column',gap:'8px'}}>
          {available.length===0?<p style={{margin:0,fontSize:'13px',color:'#94a3b8',textAlign:'center',padding:'24px 0'}}>No documents uploaded.</p>:available.map(d=><DocItem key={d.type} label={d.label} onView={()=>{onViewDoc(candidate,d.type);onClose()}}/>)}
        </div>
      </div>
    </div>
  );
}

function DocsIconBtn({ candidate, onOpen, hasAny }) {
  const [hov,setHov]=useState(false);
  return (
    <button title={hasAny?'View documents':'No documents'} onClick={hasAny?onOpen:undefined} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{display:'flex',alignItems:'center',gap:'5px',padding:'4px 10px',borderRadius:'7px',fontSize:'11.5px',fontWeight:'600',cursor:hasAny?'pointer':'default',border:`1px solid ${hasAny?(hov?'#93c5fd':'#bfdbfe'):'#e2e8f0'}`,background:hasAny?(hov?'#dbeafe':'#eff6ff'):'#f8fafc',color:hasAny?'#1d4ed8':'#cbd5e1',fontFamily:'inherit',transition:'all 0.15s'}}>
      <IC.Folder/>{hasAny?'See Docs':'None'}
    </button>
  );
}

function ActionBtn({ label, variant='blue', onClick }) {
  const v=VARIANT[variant];const [hov,setHov]=useState(false);
  return (
    <button onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{padding:'5px 12px',borderRadius:'7px',fontSize:'11.5px',fontWeight:'600',cursor:'pointer',border:`1px solid ${v.border}`,background:hov?v.border:v.bg,color:v.color,whiteSpace:'nowrap',fontFamily:'inherit',transition:'background 0.15s'}}>
      {label}
    </button>
  );
}

function TabBtn({ children, active, onClick }) {
  return (
    <button onClick={onClick} style={{padding:'16px 20px',border:'none',borderBottom:active?'2px solid #3b82f6':'2px solid transparent',background:'transparent',color:active?'#3b82f6':'#64748b',fontSize:'13.5px',fontWeight:active?'700':'600',cursor:'pointer',transition:'all 0.15s',fontFamily:'inherit'}}>
      {children}
    </button>
  );
}

// ─── NEW: Suggestion Badge ────────────────────────────────────────────────────
function SuggestionBadge({ suggestion }) {
  if (!suggestion) return null;
  const cfg = SUGGESTION_CFG[suggestion] || SUGGESTION_CFG.Review;
  return (
    <span style={{ fontSize:'10.5px', fontWeight:'700', padding:'2px 8px', borderRadius:'20px', background:cfg.bg, color:cfg.color, border:`1px solid ${cfg.border}`, whiteSpace:'nowrap' }}>
      {suggestion}
    </span>
  );
}

// ─── NEW: Smart Rank Badge ────────────────────────────────────────────────────
function RankBadge({ rank }) {
  if (!rank) return null;
  let bg, color, border;
  
  if (rank === 1) {
    bg = '#f0fdf4'; // Light green
    color = '#15803d'; // Green
    border = '#86efac';
  } else if (rank === 2) {
    bg = '#eff6ff'; // Light blue
    color = '#1d4ed8'; // Blue
    border = '#bfdbfe';
  } else if (rank === 3) {
    bg = '#fffbeb'; // Light amber
    color = '#b45309'; // Amber
    border = '#fde68a';
  } else {
    bg = '#f8fafc'; // Gray
    color = '#64748b';
    border = '#cbd5e1';
  }

  return (
    <span style={{ 
      display:'inline-flex', 
      alignItems:'center', 
      gap:'4px', 
      fontSize:'11px', 
      fontWeight:'700', 
      padding:'3px 9px', 
      borderRadius:'12px', 
      background: bg, 
      color: color, 
      border: `1px solid ${border}`, 
      whiteSpace:'nowrap'
    }}>
      Rank #{rank}
    </span>
  );
}

// ─── NEW: Format Markdown Text for Chatbot ─────────────────────────────────────
function formatMarkdownText(text) {
  if (!text) return '';
  let escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  escaped = escaped.replace(/__(.*?)__/g, '<strong>$1</strong>');

  escaped = escaped.split('\n').map(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
      return `<li style="margin-left: 16px; margin-bottom: 4px; list-style-type: disc;">${trimmed.substring(2)}</li>`;
    }
    const numMatch = trimmed.match(/^(\d+)\.\s(.*)/);
    if (numMatch) {
      return `<li style="margin-left: 16px; margin-bottom: 4px; list-style-type: decimal;">${numMatch[2]}</li>`;
    }
    return line;
  }).join('\n');

  escaped = escaped.replace(/\n/g, '<br />');
  return escaped;
}

// ─── NEW: Inline Summary Panel ────────────────────────────────────────────────
function SummaryPanel({ summary, keyTerms, loading, onClose }) {
  return (
    <div style={{ gridColumn:'1/-1', background:'linear-gradient(135deg,#f8fafc,#f0f7ff)', border:'1px solid #bfdbfe', borderRadius:'10px', padding:'14px 18px', margin:'0 0 4px', position:'relative', animation:'fadeSlide 0.2s ease' }}>
      <button onClick={onClose} style={{ position:'absolute', top:'10px', right:'10px', background:'none', border:'none', cursor:'pointer', color:'#94a3b8', display:'flex' }}><IC.X /></button>
      <div style={{ display:'flex', alignItems:'center', gap:'7px', marginBottom:'8px' }}>
        <IC.AlignLeft />
        <span style={{ fontSize:'11px', fontWeight:'700', color:'#1d4ed8', textTransform:'uppercase', letterSpacing:'0.05em' }}>Quick Summary</span>
        <span style={{ fontSize:'10px', color:'#94a3b8' }}> auto generated from profile</span>
      </div>
      {loading ? (
        <div style={{ display:'flex', alignItems:'center', gap:'8px', color:'#64748b', fontSize:'12.5px' }}>
          <div style={{ width:'14px', height:'14px', border:'2px solid #bfdbfe', borderTopColor:'#3b82f6', borderRadius:'50%', animation:'spin 0.6s linear infinite' }} />
          Reading candidate profile…
        </div>
      ) : (
        <>
          <p style={{ margin:'0 0 10px', fontSize:'13px', color:'#1e293b', lineHeight:'1.65' }}>{summary || 'Not enough profile information to summarize.'}</p>
          {keyTerms && keyTerms.length > 0 && (
            <div style={{ display:'flex', alignItems:'center', gap:'6px', flexWrap:'wrap' }}>
              <span style={{ fontSize:'10.5px', fontWeight:'700', color:'#94a3b8' }}>Key terms:</span>
              {keyTerms.map((t,i) => (
                <span key={i} style={{ fontSize:'10.5px', padding:'2px 7px', borderRadius:'4px', background:'#eff6ff', color:'#3b82f6', fontWeight:'600' }}>{t}</span>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── NEW: Smart Rank Button ───────────────────────────────────────────────────
function SmartRankBtn({ active, loading, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display:'flex', alignItems:'center', gap:'6px',
        padding:'7px 14px', borderRadius:'8px', cursor:'pointer',
        fontSize:'12px', fontWeight:'700', fontFamily:'inherit',
        border: active ? '1px solid #4f46e5' : '1px solid #cbd5e1',
        background: active ? '#4f46e5' : hov ? '#f8fafc' : '#fff',
        color: active ? '#fff' : '#475569',
        transition:'all 0.15s',
        boxShadow: active ? '0 4px 6px rgba(79,70,229,0.15)' : 'none',
      }}
      title='Rank candidates by profile strength using AI scoring'
    >
      {loading
        ? <div style={{ width:'14px', height:'14px', border:'2px solid #c7d2fe', borderTopColor: active ? '#fff' : '#6366f1', borderRadius:'50%', animation:'spin 0.6s linear infinite' }} />
        : <IC.Sparkles />
      }
      {loading ? 'Ranking…' : active ? 'Ranked ✓' : 'Smart Rank'}
    </button>
  );
}

// ─── NEW: AI Info Banner ──────────────────────────────────────────────────────
function AIBanner({ mode, count }) {
  return (
    <div style={{ padding:'9px 20px', background:'linear-gradient(90deg,#eef2ff,#eff6ff)', borderBottom:'1px solid #e2e8f0', display:'flex', alignItems:'center', gap:'10px' }}>
      <IC.Sparkles />
      <span style={{ fontSize:'12px', fontWeight:'600', color:'#4f46e5' }}>Smart Rank active</span>
      <span style={{ fontSize:'12px', color:'#64748b' }}>— {count} candidates ranked by profile strength for this stage</span>
      <span style={{ marginLeft:'auto', fontSize:'11px', color:'#94a3b8', display:'flex', alignItems:'center', gap:'4px' }}>
        <IC.Info /> Suggestion badges powered by profile analysis
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function SelectionHR() {
    const { toasts, pushToast, removeToast } = useHRToast();
  const navigate = useNavigate();
  const user     = useAuthStore(s => s.user);

  const [loading,            setLoading]            = useState(true);
  const [positions,          setPositions]          = useState([]);
  const [activePositionId,   setActivePositionId]   = useState('');
  const [activeTab,          setActiveTab]          = useState(null);
  const [activeSubStageIndex,setActiveSubStageIndex]= useState(null);
  const [finalStatusFilter,  setFinalStatusFilter]  = useState('accepted');
  const [expandedStageIndex, setExpandedStageIndex] = useState(null);
  const [candidates,         setCandidates]         = useState([]);
  const [search,             setSearch]             = useState('');
  const [tableLoading,       setTableLoading]       = useState(false);
  const [showLogoutModal,    setShowLogoutModal]     = useState(false);
  const [confirmAction,      setConfirmAction]      = useState(null);
  const [notesCandidate,     setNotesCandidate]     = useState(null);
  const [assignTestCandidate,setAssignTestCandidate]= useState(null);
  const [testName,           setTestName]           = useState('');
  const [testLink,           setTestLink]           = useState('');
  const [testDate,           setTestDate]           = useState('');
  const [testTime,           setTestTime]           = useState('');
  const [testDeadline,       setTestDeadline]       = useState('');
  const [testNotes,          setTestNotes]          = useState('');
  const [showBulkTestModal,  setShowBulkTestModal]  = useState(false);
  const [globalTestDeadline, setGlobalTestDeadline] = useState('');
  const [showAddTestTypeModal,setShowAddTestTypeModal]=useState(false);
  const [editingTemplateId,  setEditingTemplateId]  = useState(null);
  const [deleteTemplateConfirm,setDeleteTemplateConfirm]=useState(null);
  const [newTestName,        setNewTestName]        = useState('');
  const [newTestFormat,      setNewTestFormat]      = useState('coding_test');
  const [newTestFile,        setNewTestFile]        = useState(null);
  const [bulkTestId,         setBulkTestId]         = useState('');
  const [bulkTestLocation,   setBulkTestLocation]   = useState('Online');
  const [bulkTestDate,       setBulkTestDate]       = useState('');
  const [bulkTestTime,       setBulkTestTime]       = useState('');
  const [configuredTests,    setConfiguredTests]    = useState([]);
  const [pickTestCandidate,  setPickTestCandidate]  = useState(null);
  const [assignInterviewCandidate, setAssignInterviewCandidate] = useState(null);
  const [interviewDate,      setInterviewDate]      = useState('');
  const [interviewTime,      setInterviewTime]      = useState('');
  const [interviewLink,      setInterviewLink]      = useState('');
  const [interviewNotes,     setInterviewNotes]     = useState('');
  const [interviewType,      setInterviewType]      = useState('Online');
  const [offlinePlace,       setOfflinePlace]       = useState('');
  const [onlinePlatform,     setOnlinePlatform]     = useState('Google Meet');
  const [onlineLink,         setOnlineLink]         = useState('');

  // ── NEW: AI state ──────────────────────────────────────────────────────────
  // smartRankMap: { id_submission → { rank, smart_rank_percent, suggestion, suggestion_reason } }
  const [smartRankMap,    setSmartRankMap]    = useState({});
  const [smartRankActive, setSmartRankActive] = useState(false);
  const [smartRankLoading,setSmartRankLoading]= useState(false);
  // summaryMap: { id_submission → { text, keyTerms, loading } }
  const [summaryMap,      setSummaryMap]      = useState({});
  // which rows have summary panel open
  const [openSummaryId,   setOpenSummaryId]   = useState(null);
  const [rankReasonModal, setRankReasonModal] = useState(null);

  // Chatbot (RAG) state
  const [isChatOpen,      setIsChatOpen]      = useState(false);
  const [chatMessages,    setChatMessages]    = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Halo! Saya AI Selection Assistant. Tanyakan apa saja mengenai kandidat di tahap ini (misalnya: *"Siapa yang memiliki pengalaman React?"* atau *"Bandingkan motivasi kandidat"*).'
    }
  ]);
  const [chatInput,       setChatInput]       = useState('');
  const [chatLoading,     setChatLoading]     = useState(false);
  const chatEndRef = useRef(null);

  // ── Interview prefill ──────────────────────────────────────────────────────
  useEffect(() => {
    if (assignInterviewCandidate) {
      // Try new format first (from new endpoint)
      if (assignInterviewCandidate.interview_date || assignInterviewCandidate.interview_link) {
        setInterviewDate(assignInterviewCandidate.interview_date || '');
        setInterviewTime(assignInterviewCandidate.interview_time || '');
        setInterviewLink(assignInterviewCandidate.interview_link || '');
        setInterviewNotes(assignInterviewCandidate.interview_notes || '');
        setInterviewType('Online');
      }
      // Fall back to old format
      else {
        const iv = assignInterviewCandidate.interview;
        if (iv) {
          setInterviewDate(iv.interview_date || '');
          setInterviewTime(iv.interview_time || '');
          const isOffline = iv.media === 'Offline';
          setInterviewType(isOffline ? 'Offline' : 'Online');
          if (isOffline) { setOfflinePlace(iv.notes || ''); setOnlinePlatform('Google Meet'); setOnlineLink(''); }
          else { setOnlinePlatform(iv.media || 'Google Meet'); setOnlineLink(iv.link || ''); setOfflinePlace(''); }
        } else {
          setInterviewDate(''); setInterviewTime(''); setInterviewType('Online');
          setOfflinePlace(''); setOnlinePlatform('Google Meet'); setOnlineLink('');
        }
      }
      setInterviewLink(''); setInterviewNotes('');
    }
  }, [assignInterviewCandidate]);

  // ── Reset AI state on stage/tab change ────────────────────────────────────
  useEffect(() => {
    setSmartRankMap({});
    setSmartRankActive(false);
    setOpenSummaryId(null);
    setRankReasonModal(null);
    setSummaryMap({});
    setSearch('');
    setChatMessages([
      {
        id: 'welcome',
        sender: 'ai',
        text: 'Halo! Saya AI Selection Assistant. Tanyakan apa saja mengenai kandidat di tahap ini (misalnya: *"Siapa yang memiliki pengalaman React?"* atau *"Bandingkan motivasi kandidat"*).'
      }
    ]);
  }, [activePositionId, activeTab, activeSubStageIndex]);

  // ── NEW: Fetch Test Templates ──────────────────────────────────────────────
  const fetchTestTemplates = () => {
    if (!activePositionId) return;
    api(`/hr/positions/${activePositionId}/test-templates`)
      .then(res => setConfiguredTests(res || []))
      .catch(err => console.error('Fetch test templates error:', err));
  };

  useEffect(() => {
    fetchTestTemplates();
  }, [activePositionId]);

  // ── Fetch Positions ────────────────────────────────────────────────────────
  useEffect(() => {
    api('/positions/catalog')
      .then(res => {
        const dataArr = Array.isArray(res) ? res : (res.data || []);
        if (dataArr.length > 0) { setPositions(dataArr); setActivePositionId(dataArr[0].id_position); }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const activePosition = useMemo(() => positions.find(p => p.id_position === activePositionId), [positions, activePositionId]);

  const selectionFlow = useMemo(() => {
    if (!activePosition?.selection_flow) return [];
    try { const f = typeof activePosition.selection_flow === 'string' ? JSON.parse(activePosition.selection_flow) : activePosition.selection_flow; return Array.isArray(f) ? f : []; }
    catch { return []; }
  }, [activePosition]);

  const stageTabs = useMemo(() => {
    if (!selectionFlow.length) return [];
    const typeCounts = {};
    return selectionFlow.map((stage, i) => {
      typeCounts[stage.type] = (typeCounts[stage.type] || 0) + 1;
      const count = typeCounts[stage.type];
      const totalOfType = selectionFlow.filter(s => s.type === stage.type).length;
      
      let label = stage.type.replace('-',' ').replace(/\b\w/g,l=>l.toUpperCase());
      if (totalOfType > 1) label += ` ${count}`;
      
      return { ...stage, globalIndex: i, label };
    });
  }, [selectionFlow]);

  useEffect(() => {
  if (stageTabs.length > 0) {
    // Hanya set default kalau belum ada tab aktif, atau index yang aktif sudah out-of-range
    setActiveTab(prev => prev ?? 'stage');
    setActiveSubStageIndex(prev => {
      if (prev !== null && prev < stageTabs.length) return prev; // preserve
      return 0; // fallback ke index 0 kalau invalid
    });
  } else {
    setActiveTab('final');
    setActiveSubStageIndex(null);
  }
  setExpandedStageIndex(null);
}, [stageTabs]);

  const handleTabChange = (tab, index = null) => {
    setActiveTab(tab);
    if (tab === 'stage') {
      setActiveSubStageIndex(index);
    } else {
      setActiveSubStageIndex(null);
    }
  };

  // ── Fetch Candidates ───────────────────────────────────────────────────────
  const fetchCandidates = (isSearch = false) => {
    if (!activePositionId) return;
    if (isSearch) setTableLoading(true);
    const params = new URLSearchParams();
    params.set('id_position', activePositionId);
    if (search) params.set('search', search);
    if (activeTab === 'final') params.set('status', finalStatusFilter);
    else params.set('status', `stage_${activeSubStageIndex}`);
    api(`/hr/candidates?${params}`)
      .then(res => setCandidates(res.candidates || res.data?.candidates || []))
      .catch(err => console.error(err))
      .finally(() => setTableLoading(false));
  };

  useEffect(() => {
    if (activePositionId && activeTab) {
      if (activeTab === 'final' || activeSubStageIndex !== null) fetchCandidates();
    }
  }, [activePositionId, activeTab, activeSubStageIndex, finalStatusFilter]);

  useEffect(() => {
    const t = setTimeout(() => { if (search !== undefined) fetchCandidates(true); }, 500);
    return () => clearTimeout(t);
  }, [search]);

  // Scroll to bottom effect for Chatbot
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  // Chatbot send query function
  const sendQuery = async (queryText) => {
    const query = queryText.trim();
    if (!query) return;

    // Add user message
    const userMsg = { id: Date.now() + '-user', sender: 'user', text: query };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);

    // Add temporary AI loading message
    const aiTempId = Date.now() + '-ai-loading';
    setChatMessages(prev => [...prev, { id: aiTempId, sender: 'ai', loading: true }]);

    try {
      const stage = activeTab === 'final' ? finalStatusFilter : `stage_${activeSubStageIndex}`;
      const params = new URLSearchParams({
        q:           query,
        retriever:   'tfidf',
        top_k:       '5',
        id_position: activePositionId || '',
        status:      stage || '',
      });
      
      const res = await api(`/hr/candidates/rag-search?${params}`);
      
      // Remove loading message and add AI response
      setChatMessages(prev => prev.filter(m => m.id !== aiTempId).concat({
        id: Date.now() + '-ai',
        sender: 'ai',
        text: res.answer || 'Maaf, saya tidak dapat menganalisis data saat ini.',
        results: res.results || []
      }));
    } catch (err) {
      console.error(err);
      setChatMessages(prev => prev.filter(m => m.id !== aiTempId).concat({
        id: Date.now() + '-ai',
        sender: 'ai',
        text: 'Terjadi kesalahan saat memanggil AI: ' + (err.message || err)
      }));
    } finally {
      setChatLoading(false);
    }
  };

  const handleSendChatMessage = (e) => {
    if (e) e.preventDefault();
    sendQuery(chatInput);
  };

  const handleHighlightCandidate = (idSubmission) => {
    const el = document.getElementById(`candidate-row-${idSubmission}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Apply background color highlight
      const originalBg = el.style.background || 'transparent';
      el.style.background = '#dbeafe'; // light blue highlight
      el.style.transition = 'background-color 0.3s ease';
      
      setTimeout(() => {
        el.style.transition = 'background-color 1s ease';
        el.style.background = originalBg;
      }, 2000);
    } else {
      pushToast('Kandidat tidak ditemukan di daftar tabel tahap ini', 'info');
    }
  };

  // ── NEW: Smart Rank ────────────────────────────────────────────────────────
  const handleSmartRank = async () => {
    if (smartRankActive) { setSmartRankActive(false); setSmartRankMap({}); return; }
    if (candidates.length === 0) return;
    setSmartRankLoading(true);
    try {
      const stage = activeTab === 'final' ? finalStatusFilter : `stage_${activeSubStageIndex}`;
      const res = await api('/hr/selection/rank-stage', {
        method: 'POST',
        data: {
          id_position:    activePositionId,
          stage,
          id_submissions: candidates.map(c => c.id_submission),
        },
      });
      if (res.success) {
        const map = {};
        (res.rankings || []).forEach(r => { map[r.id_submission] = r; });
        setSmartRankMap(map);
        setSmartRankActive(true);
      }
    } catch (err) { console.error('Smart Rank error:', err); pushToast('Smart Rank failed', 'error'); }
    finally { setSmartRankLoading(false); }
  };

  // ── NEW: Quick Summary ─────────────────────────────────────────────────────
  const handleSummary = async (candidateId) => {
    // Toggle off
    if (openSummaryId === candidateId) { setOpenSummaryId(null); return; }
    setOpenSummaryId(candidateId);
    // Already fetched
    if (summaryMap[candidateId]?.text) return;
    // Mark loading
    setSummaryMap(prev => ({ ...prev, [candidateId]: { loading: true } }));
    try {
      const res = await api(`/hr/selection/summarize/${candidateId}`);
      if (res.success) {
        setSummaryMap(prev => ({ ...prev, [candidateId]: { text: res.summary, keyTerms: res.key_terms || [], loading: false } }));
      }
    } catch (err) {
      setSummaryMap(prev => ({ ...prev, [candidateId]: { text: 'Could not generate summary.', keyTerms: [], loading: false } }));
    }
  };

  // ── Sorted candidates (by smart rank if active) ────────────────────────────
  const displayCandidates = useMemo(() => {
    if (!smartRankActive || Object.keys(smartRankMap).length === 0) return candidates;
    return [...candidates].sort((a, b) => {
      const ra = smartRankMap[a.id_submission]?.rank ?? 999;
      const rb = smartRankMap[b.id_submission]?.rank ?? 999;
      return ra - rb;
    });
  }, [candidates, smartRankMap, smartRankActive]);

  // ── Actions ────────────────────────────────────────────────────────────────
  const handlePass = c => {
    const currentIdx = activeSubStageIndex;
    const isLastStage = currentIdx === selectionFlow.length - 1;
    if (isLastStage) setConfirmAction({ type:'accept', candidate:c });
    else setConfirmAction({ type:'pass', candidate:c, nextStageIndex:currentIdx+1 });
  };

  const executeAction = async () => {
    if (!confirmAction) return;
    const { type, candidate, nextStageIndex } = confirmAction;
    try {
      if (type==='accept') await api(`/hr/candidates/${candidate.id_submission}/accept`,{method:'PATCH'});
      else if (type==='reject') await api(`/hr/candidates/${candidate.id_submission}/reject`,{method:'PATCH'});
      else if (type==='pass') await api(`/hr/candidates/${candidate.id_submission}/stage`,{method:'PATCH',data:{stage:`stage_${nextStageIndex}`}});
      setConfirmAction(null);
      fetchCandidates();
      pushToast('Candidate status updated successfully', 'success');
    } catch(err){ console.error(err); pushToast('Action failed', 'error'); }
  };

  const handleSaveNotes = async (id, note) => {
    const old=[...candidates];
    try {
      setCandidates(prev=>prev.map(c=>c.id_submission===id?{...c,hr_notes:note}:c));
      await api(`/hr/candidates/${id}/notes`,{method:'PATCH',data:{hr_notes:note}});
    } catch(err){ console.error(err); setCandidates(old); pushToast('Failed to save notes', 'error'); }
  };

const handleLogout = () => {
  const theme = localStorage.getItem('theme');
  localStorage.clear();
  if (theme) localStorage.setItem('theme', theme);
  useAuthStore.setState({ isAuthenticated:false, token:null, user:null, company:null });
  navigate('/login');
};

  const viewDoc = async (c, type) => {
    try {
      const directUrlMap = {
        cv: c.cv_url,
        supporting_document: c.supporting_document_url || c.cover_letter_url || c.institution_letter_url,
        portfolio: c.portfolio_url,
      };
      if (directUrlMap[type]) { window.open(directUrlMap[type],'_blank'); return; }
      const res = await api(`/hr/candidates/${c.id_submission}/documents/${type}`);
      const url = res.url || res.data?.url;
      if (url) window.open(url,'_blank');
    } catch { pushToast('Document not found', 'error'); }
  };

  if (loading) return (
  <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc", fontFamily: "'Poppins', sans-serif" }}>
    <SidebarHR user={user} onLogout={() => setShowLogoutModal(true)} />
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <LoadingSpinner fullScreen={false} message="Loading selection..." />
    </div>
  </div>
);

  // Table column config
  const currentStage = activeSubStageIndex !== null ? selectionFlow[activeSubStageIndex] : null;
  const isInterview = currentStage?.type === 'interview';
  const isTest      = currentStage?.type === 'test';
  const isScreening = currentStage?.type === 'screening';

  const aiActive = smartRankActive;
  let gridCols, headerCols;
  if (isInterview) {
    gridCols   = aiActive ? '1.4fr 1fr 1.5fr 1.5fr 1fr 1.5fr' : '1.4fr 1fr 1.5fr 1.5fr 1.2fr 1.5fr';
    headerCols = aiActive ? ['CANDIDATE','UNIVERSITY','SCHEDULE','LOCATION','RANK & MATCH','ACTION'] : ['CANDIDATE','UNIVERSITY','SCHEDULE','LOCATION','NOTES','ACTION'];
  } else if (isTest) {
    gridCols   = aiActive ? '1.4fr 1.2fr 1fr 1.4fr 1.2fr 0.8fr 1fr 1.5fr' : '1.4fr 1.2fr 1fr 1.4fr 1.2fr 0.8fr 1.2fr 1.5fr';
    headerCols = aiActive ? ['CANDIDATE','UNIVERSITY','LOCATIONS','SCHEDULE','SUBMISSIONS','SCORE','RANK & MATCH','ACTION'] : ['CANDIDATE','UNIVERSITY','LOCATIONS','SCHEDULE','SUBMISSIONS','SCORE','NOTES','ACTION'];
  } else {
    gridCols   = aiActive ? '1.4fr 1fr 0.6fr 0.6fr 0.9fr 0.9fr 1fr 1.5fr' : '1.4fr 1fr 0.6fr 0.6fr 0.9fr 0.9fr 1.2fr 1.5fr';
    headerCols = aiActive ? ['CANDIDATE','UNIVERSITY','CV','ADDITIONAL PORTFOLIO','SUPPORTING DOCUMENT','APPLIED DATE','RANK & MATCH','ACTION'] : ['CANDIDATE','UNIVERSITY','CV','ADDITIONAL PORTFOLIO','SUPPORTING DOCUMENT','APPLIED DATE','NOTES','ACTION'];
  }

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#f8fafc', fontFamily:"'Poppins', sans-serif" }}>
      <SidebarHR user={user} onLogout={() => setShowLogoutModal(true)} />
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeSlide{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:0.6}50%{opacity:1}}
        @media (max-width: 768px) {
          .sel-main-wrap { padding-top: 56px !important; }
          .sel-main { padding: 16px 12px 32px !important; }
          .sel-topbar { padding: 0 12px !important; }
          .sel-topbar-date { display: none !important; }
          .sel-page-header { flex-direction: column !important; align-items: flex-start !important; gap: 10px !important; }
          .sel-subfilter { flex-direction: column !important; align-items: flex-start !important; gap: 8px !important; }
          .sel-table-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
          .sel-table-inner { min-width: 820px; }
        }
        /* Responsive clamp fonts for all table content */
        .sel-table-inner { font-size: clamp(11px, 1.1vw, 13px); }
        .sel-cell-name { font-size: clamp(11.5px, 1.1vw, 13px); font-weight: 700; color: #1e293b; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .sel-cell-email { font-size: clamp(10px, 0.9vw, 11.5px); color: #94a3b8; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .sel-cell-uni { font-size: clamp(10.5px, 1vw, 12.5px); color: #475569; font-weight: 500; overflow-wrap: break-word; word-break: break-word; white-space: normal; line-height: 1.35; }
        .sel-action-btn { padding: clamp(4px,0.4vw,6px) clamp(8px,0.8vw,12px) !important; font-size: clamp(10px,0.95vw,11.5px) !important; white-space: nowrap; }
        .sel-doc-btn { padding: clamp(3px,0.35vw,5px) clamp(6px,0.7vw,10px) !important; font-size: clamp(10px,0.9vw,11.5px) !important; }
      `}</style>

      <div className="sel-main-wrap" style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>
        {/* Header */}
        <header className="sel-topbar" style={{ height:'56px', background:'#fff', borderBottom:'1px solid #e2e8f0', display:'flex', alignItems:'center', padding:'0 28px', gap:'16px', position:'sticky', top:0, zIndex:50 }}>
          <div style={{ flex:1, display:'flex', alignItems:'center', gap:'6px', flexWrap:'wrap' }}>
            <span style={{ fontSize:'15px', fontWeight:'700', color:'#1e293b' }}>Selection Flow</span>
            <span style={{ fontSize:'13px', color:'#94a3b8', margin:'0 6px' }}>/</span>
            <span style={{ fontSize:'13px', color:'#94a3b8' }}>Selection</span>
          </div>
          <span className="sel-topbar-date" style={{ fontSize:'12px', color:'#94a3b8' }}>{todayStr()}</span>
        </header>

        <main className="sel-main" style={{ flex:1, padding:'28px', overflowY:'auto' }}>
          <div className="sel-page-header" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'24px' }}>
            <div>
              <h1 style={{ fontSize:'22px', fontWeight:'800', color:'#0f172a', margin:0 }}>Selection Management</h1>
              <p style={{ fontSize:'13px', color:'#64748b', marginTop:'4px' }}>Manage candidate stages dynamically based on position requirements.</p>
            </div>
          </div>

          {/* Flow Visualizer */}
          {stageTabs.length > 0 && (
          <div style={{ background:'#fff', padding:'16px 20px', borderRadius:'12px', marginBottom:'24px', border:'1px solid #e2e8f0' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'12px' }}>
              
              {/* Kiri: Flow Path */}
              <div style={{ display:'flex', alignItems:'center', gap:'8px', overflowX:'auto', flex:1 }}>
                <div style={{ fontSize:'11px', fontWeight:'700', color:'#94a3b8', textTransform:'uppercase', marginRight:'8px', flexShrink:0 }}>Flow Path:</div>
                {stageTabs.map((s,idx)=>(
                  <div key={idx} style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                    {idx>0&&<span style={{ color:'#cbd5e1' }}>→</span>}
                    <button onClick={() => handleTabChange('stage', idx)}
                      style={{ display:'flex',alignItems:'center',gap:'6px',cursor:'pointer',border:'none',fontSize:'12.5px',fontWeight:'600',
                        color:activeSubStageIndex===idx?'#1d4ed8':'#3b82f6',
                        background:activeSubStageIndex===idx?'#dbeafe':'#eff6ff',
                        padding:'4px 12px',borderRadius:'20px',whiteSpace:'nowrap',transition:'all 0.2s',fontFamily:'inherit' }}>
                      {s.label}
                    </button>
                  </div>
                ))}
                <span style={{ color:'#cbd5e1' }}>→</span>
                <span onClick={() => handleTabChange('final')}
                  style={{ fontSize:'12.5px',fontWeight:'600',color:activeTab==='final'?'#059669':'#10b981',background:activeTab==='final'?'#d1fae5':'#ecfdf5',padding:'4px 10px',borderRadius:'20px',cursor:'pointer',flexShrink:0 }}>
                  Final
                </span>
              </div>

              {/* Kanan: Position Dropdown */}
              <div style={{ display:'flex', alignItems:'center', gap:'8px', flexShrink:0 }}>
                <span style={{ fontSize:'11px', fontWeight:'700', color:'#94a3b8', textTransform:'uppercase', whiteSpace:'nowrap' }}>Position</span>
                <div style={{ position:'relative' }}>
                  <select value={activePositionId} onChange={e=>setActivePositionId(e.target.value)}
                    style={{ appearance:'none', background:'#fff', border:'1px solid #cbd5e1', borderRadius:'8px', padding:'6px 28px 6px 12px', fontSize:'13px', fontWeight:'600', color:'#1e293b', outline:'none', cursor:'pointer', minWidth:'180px', fontFamily:'inherit' }}>
                    <option value=''>All Positions</option>
                    {positions.map(p=><option key={p.id_position} value={p.id_position}>{p.name}</option>)}
                  </select>
                  <div style={{ position:'absolute', right:'8px', top:'50%', transform:'translateY(-50%)', pointerEvents:'none', color:'#64748b' }}>
                    <IC.ChevronDown />
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

          {/* Test Types Panel — show if current stage is 'test' */}
          {currentStage?.type === 'test' && (
            <div style={{ background:'#fff', borderRadius:'16px', border:'1px solid #cbd5e1', padding:'16px 20px', marginBottom:'20px', boxShadow:'0 4px 6px -1px rgba(0,0,0,0.02)' }}>
              <div onClick={()=>setExpandedStageIndex(expandedStageIndex==='test-setup'?null:'test-setup')} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                  <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#3b82f6' strokeWidth='2'><path d='M12 20h9'/><path d='M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z'/></svg>
                  <h4 style={{ margin:0, fontSize:'14px', fontWeight:'700', color:'#1e293b' }}>Test Types</h4>
                  <span style={{ fontSize:'11px', color:'#64748b', background:'#f1f5f9', padding:'2px 8px', borderRadius:'12px', fontWeight:'700' }}>{configuredTests.length} Rules Available</span>
                </div>
                <div style={{ transform:expandedStageIndex==='test-setup'?'rotate(180deg)':'none', transition:'all 0.2s', color:'#64748b' }}><svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M6 9l6 6 6-6'/></svg></div>
              </div>
              {expandedStageIndex==='test-setup'&&(
                <div style={{ marginTop:'16px', borderTop:'1px solid #f1f5f9', paddingTop:'16px' }}>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'14px', marginBottom:'16px' }}>
                    {configuredTests.map(t=>(
                      <div key={t.id} style={{ border:'1px solid #cbd5e1', borderRadius:'12px', padding:'16px', background:'#fff', position:'relative' }}>
                        <button onClick={()=>setDeleteTemplateConfirm(t)} style={{ position:'absolute', top:'14px', right:'14px', background:'none', border:'none', color:'#ef4444', cursor:'pointer', padding:'4px', borderRadius:'6px' }}><svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2'/></svg></button>
                        <div style={{ fontSize:'14px', fontWeight:'700', color:'#0f172a', paddingRight:'24px' }}>{t.name}</div>
                        <div style={{ fontSize:'11.5px', color:'#64748b', marginTop:'6px' }}>Format: <strong style={{ color:'#3b82f6' }}>{t.format==='coding_test'?'Coding Test':t.format==='aptitude_test'?'Aptitude Test':t.format==='essay_project'?'Case Study':'Written Essay'}</strong></div>
                        {t.instructions&&<div style={{ fontSize:'11.5px', color:'#64748b', marginTop:'4px', fontStyle:'italic' }}>"{t.instructions}"</div>}
                        <div style={{ display:'flex', gap:'8px', marginTop:'14px' }}>
                          <button onClick={()=>{setEditingTemplateId(t.id);setNewTestName(t.name);setNewTestFormat(t.format||'coding_test');setTestNotes(t.instructions||'');setShowAddTestTypeModal(true)}} style={{ padding:'6px 12px', fontSize:'11.5px', fontWeight:'600', color:'#475569', background:'#fff', border:'1px solid #cbd5e1', borderRadius:'8px', cursor:'pointer', flex:1 }}>Edit Template</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={()=>{setEditingTemplateId(null);setNewTestName('');setNewTestFormat('coding_test');setTestNotes('');setNewTestFile(null);setShowAddTestTypeModal(true)}} style={{ display:'flex', alignItems:'center', gap:'6px', padding:'8px 16px', background:'#fff', color:'#3b82f6', border:'1px dashed #3b82f6', borderRadius:'8px', fontSize:'13px', fontWeight:'600', cursor:'pointer' }} onMouseEnter={e=>e.currentTarget.style.background='#eff6ff'} onMouseLeave={e=>e.currentTarget.style.background='#fff'}>+ Add New Test Type</button>
                </div>
              )}
            </div>
          )}

          {/* Main Card */}
          <div style={{ background:'#fff', borderRadius:'16px', border:'1px solid #e2e8f0', boxShadow:'0 4px 6px -1px rgba(0,0,0,0.02)' }}>

            {/* Tabs */}
            <div style={{ borderBottom:'1px solid #e2e8f0' }}>
              <div style={{ display:'flex', overflowX:'auto', padding:'0 8px' }}>
                {stageTabs.map(s => (
                  <TabBtn 
                    key={s.globalIndex} 
                    active={activeTab === 'stage' && activeSubStageIndex === s.globalIndex} 
                    onClick={() => handleTabChange('stage', s.globalIndex)}
                  >
                    {s.label}
                  </TabBtn>
                ))}
                <TabBtn active={activeTab === 'final'} onClick={() => handleTabChange('final')}>Final</TabBtn>
              </div>

              {/* Sub-filters row */}
              <div className="sel-subfilter" style={{ padding:'12px 20px', background:'#f8fafc', display:'flex', alignItems:'center', justifyContent:'space-between', borderTop:'1px solid #f1f5f9' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                  {activeTab === 'stage' && currentStage && (
                    <div style={{ fontSize:'13px', fontWeight:'600', color:'#64748b' }}>
                      Stage {activeSubStageIndex + 1}: <span style={{ color:'#0f172a' }}>{currentStage.name || currentStage.type}</span>
                    </div>
                  )}
                  {activeTab==='final'&&(
                    <select value={finalStatusFilter} onChange={e=>setFinalStatusFilter(e.target.value)} style={{ padding:'6px 12px', borderRadius:'8px', border:'1px solid #cbd5e1', background:'#fff', fontSize:'13px', fontWeight:'600', outline:'none' }}>
                      <option value='accepted'>Accepted</option>
                      <option value='rejected'>Rejected</option>
                    </select>
                  )}
                </div>

                <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                  
                  {/* Smart Rank Button */}
                  {activeTab!=='final' && (
                    <SmartRankBtn active={smartRankActive} loading={smartRankLoading} onClick={handleSmartRank} />
                  )}

                  {/* AI Chat Assistant Button */}
                  {activeTab!=='final' && (
                    <button
                      onClick={() => setIsChatOpen(!isChatOpen)}
                      style={{
                        display:'flex', alignItems:'center', gap:'6px',
                        padding:'7px 14px', borderRadius:'8px', cursor:'pointer',
                        fontSize:'12px', fontWeight:'700', fontFamily:'inherit',
                        border: isChatOpen ? '1px solid #0f172a' : '1px solid #cbd5e1',
                        background: isChatOpen ? '#0f172a' : '#fff',
                        color: isChatOpen ? '#fff' : '#475569',
                        transition:'all 0.15s',
                        boxShadow: isChatOpen ? '0 4px 6px rgba(15,23,42,0.15)' : 'none'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = isChatOpen ? '#1e293b' : '#f8fafc';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = isChatOpen ? '#0f172a' : '#fff';
                      }}
                    >
                      <IC.MessageSquare /> AI Assistant
                    </button>
                  )}

                  {isTest && (
                    <button onClick={()=>setShowBulkTestModal(true)} style={{ display:'flex', alignItems:'center', gap:'6px', padding:'7px 14px', background:'#3b82f6', color:'#fff', border:'none', borderRadius:'8px', fontSize:'12px', fontWeight:'700', cursor:'pointer', transition:'all 0.2s', boxShadow:'0 4px 10px rgba(59,130,246,0.2)' }} onMouseEnter={e=>e.currentTarget.style.background='#2563eb'} onMouseLeave={e=>e.currentTarget.style.background='#3b82f6'}>
                      <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M12 20h9'/><path d='M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z'/></svg>
                      Bulk Assign Test
                    </button>
                  )}

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    width: '220px',
                    transition: 'all 0.2s',
                  }}>
                    <IC.Search />
                    <input
                      placeholder='Search candidate...'
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      style={{ border: 'none', outline: 'none', fontSize: '12.5px', width: '100%', background: 'transparent', color: '#1e293b', fontFamily: 'inherit' }}
                    />
                    {search && (
                      <button
                        onClick={() => setSearch('')}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0, display: 'flex' }}
                      >
                        <IC.X />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Chatbot Inline Section ── */}
            {isChatOpen && (
              <div 
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '420px',
                  background: '#fff',
                  borderBottom: '1px solid #e2e8f0',
                  fontFamily: "'Poppins', sans-serif"
                }}
              >
                {/* Chat Header */}
                <div style={{ padding: '12px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: '#fff' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <IC.Sparkles />
                    </div>
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: '700' }}>AI Selection Assistant</div>
                      <div style={{ fontSize: '10.5px', color: '#94a3b8' }}>Powered by Llama 3.3</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsChatOpen(false)}
                    style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '6px', borderRadius: '50%', display: 'flex', transition: 'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                    onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                  >
                    <IC.X />
                  </button>
                </div>

                {/* Chat Messages */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px', background: '#f8fafc' }}>
                  {chatMessages.map((msg, index) => {
                    const isUser = msg.sender === 'user';
                    return (
                      <div key={msg.id || index} style={{ display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start', width: '100%' }}>
                        {/* Bubble */}
                        <div style={{
                          maxWidth: '75%',
                          padding: '10px 14px',
                          borderRadius: isUser ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                          background: isUser ? '#3b82f6' : '#fff',
                          color: isUser ? '#fff' : '#1e293b',
                          fontSize: '12.5px',
                          lineHeight: '1.5',
                          boxShadow: isUser ? '0 3px 8px rgba(59,130,246,0.12)' : '0 1px 2px rgba(0,0,0,0.02)',
                          border: isUser ? 'none' : '1px solid #e2e8f0',
                          position: 'relative'
                        }}>
                          {msg.loading ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '2px 4px' }}>
                              <span style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic' }}>Menganalisis data...</span>
                              <div style={{ display: 'flex', gap: '4px' }}>
                                <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#3b82f6', animation: 'pulse 1.2s infinite ease-in-out', animationDelay: '0s' }} />
                                <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#3b82f6', animation: 'pulse 1.2s infinite ease-in-out', animationDelay: '0.2s' }} />
                                <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#3b82f6', animation: 'pulse 1.2s infinite ease-in-out', animationDelay: '0.4s' }} />
                              </div>
                            </div>
                          ) : (
                            <div 
                              dangerouslySetInnerHTML={{ __html: formatMarkdownText(msg.text) }} 
                              style={{ overflowWrap: 'break-word', wordBreak: 'break-word' }}
                            />
                          )}
                        </div>

                        {/* Candidate recommendations cards inside chat */}
                        {!isUser && msg.results && msg.results.length > 0 && (
                          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', padding: '6px 2px', width: '100%', scrollbarWidth: 'none' }}>
                            {msg.results.map((c, idx) => (
                              <div 
                                key={idx}
                                onClick={() => handleHighlightCandidate(c.id_submission)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '8px 12px',
                                  background: '#fff',
                                  border: '1px solid #e2e8f0',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s',
                                  boxShadow: '0 1px 2px rgba(0,0,0,0.01)',
                                  minWidth: '200px',
                                  flexShrink: 0
                                }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = '#3b82f6'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; }}
                                title="Klik untuk melihat dan menyorot baris di tabel"
                              >
                                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, marginRight: '8px' }}>
                                  <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
                                  <span style={{ fontSize: '10px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.university}</span>
                                </div>
                                <RankBadge rank={c.rank} />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <div ref={chatEndRef} />
                </div>

                {/* Chat Input form */}
                <form onSubmit={handleSendChatMessage} style={{ padding: '12px 20px', borderTop: '1px solid #e2e8f0', background: '#fff' }}>
                  {/* Quick suggestions */}
                  <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '8px', paddingBottom: '4px', scrollbarWidth: 'none' }}>
                    {[
                      "Rekomendasi kandidat terbaik",
                      "Bandingkan profil kandidat",
                      "Kandidat yang ahli React/Frontend",
                      "Kandidat yang aktif organisasi"
                    ].map((s, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => sendQuery(s)}
                        disabled={chatLoading}
                        style={{ padding: '5px 10px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '20px', fontSize: '10.5px', color: '#475569', fontWeight: '600', whiteSpace: 'nowrap', cursor: 'pointer', transition: 'all 0.2s', outline: 'none' }}
                        onMouseEnter={e => { if(!chatLoading) { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#0f172a'; } }}
                        onMouseLeave={e => { if(!chatLoading) { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#475569'; } }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder={activePositionId ? "Tanya AI mengenai kandidat..." : "Pilih posisi terlebih dahulu"}
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      disabled={chatLoading || !activePositionId}
                      style={{ flex: 1, padding: '8px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '12.5px', outline: 'none', fontFamily: 'inherit', background: !activePositionId ? '#f1f5f9' : '#fff' }}
                    />
                    <button
                      type="submit"
                      disabled={chatLoading || !chatInput.trim() || !activePositionId}
                      style={{ padding: '8px 12px', background: chatLoading || !chatInput.trim() || !activePositionId ? '#cbd5e1' : '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', display: 'flex', cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                      <IC.Send />
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ── NEW: AI Banner ── */}
            {smartRankActive && <AIBanner count={displayCandidates.length} />}

            {/* Table Header */}
            <div className="sel-table-scroll">
            <div className="sel-table-inner">
            <div style={{ display:'grid', gridTemplateColumns:gridCols, gap:'8px', padding:'9px 16px', background:'#fcfcfd', borderBottom:'1px solid #f1f5f9' }}>
              {headerCols.map(h=>(
                <div key={h} style={{ 
                  fontSize:'10px', fontWeight:'700', color: h==='RANK & MATCH'?'#6366f1':'#94a3b8', 
                  letterSpacing:'0.05em', 
                  display:'flex', alignItems:'center', gap:'4px',
                  justifyContent: 'center'
                }}>
                  {h==='RANK & MATCH'&&<IC.Sparkles />}{h}
                </div>
              ))}
            </div>

            {/* Table Body */}
            <div style={{ minHeight:'300px' }}>
              {tableLoading ? (
                <div style={{ padding:'40px', textAlign:'center', color:'#94a3b8', fontSize:'13px' }}>Loading...</div>
              ) : displayCandidates.length===0 ? (
                <div style={{ padding:'60px 20px', textAlign:'center', color:'#94a3b8', fontSize:'13.5px' }}>No candidates in this stage.</div>
              ) : (
                displayCandidates.map((c,i) => {
                  const aiData    = smartRankMap[c.id_submission];
                  const summData  = summaryMap[c.id_submission];
                  const isSumOpen = openSummaryId === c.id_submission;

                  return (
                    <div key={c.id_submission}>
                      <div id={`candidate-row-${c.id_submission}`} style={{ display:'grid', gridTemplateColumns:gridCols, gap:'8px', padding:'9px 16px', alignItems:'center', borderBottom: !isSumOpen&&i<displayCandidates.length-1?'1px solid #f1f5f9':'none', background: aiData?.rank===1?'rgba(99,102,241,0.02)':'transparent' }}>

                        {/* Candidate — no avatar bubble */}
                        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', minWidth:0 }}>
                            <div style={{ display:'flex', alignItems:'center', gap:'5px', flexWrap:'wrap' }}>
                              <span className="sel-cell-name" style={{ textAlign:'center', display:'block' }}>{c.name}</span>
                              {aiData?.suggestion && <SuggestionBadge suggestion={aiData.suggestion} />}
                            </div>
                            <div className="sel-cell-email" style={{ textAlign:'center' }}>{c.email}</div>
                        </div>

                        {/* University — word-wrap, prefer 1 line, clamp font */}
                        <div className="sel-cell-uni" style={{ textAlign:'center' }}>
                          {c.university || '-'}
                        </div>

                        {/* Stage-specific columns — unchanged from original */}
                        {isInterview ? (
                          <>
                          {(c.interview || c.interview_date) ? (
                              <>
                                <div onClick={()=>setAssignInterviewCandidate(c)} style={{ fontSize:'12.5px', color:'#475569', textAlign:'center', cursor:'pointer', padding:'6px', borderRadius:'8px', border:'1px solid transparent', transition:'all 0.15s', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }} onMouseEnter={e=>{e.currentTarget.style.borderColor='#3b82f6';e.currentTarget.style.background='#f0fdf4'}} onMouseLeave={e=>{e.currentTarget.style.borderColor='transparent';e.currentTarget.style.background='transparent'}}>
                                  {new Date(c.interview_date || c.interview?.interview_date).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'})}<br/>
                                  <span style={{ fontSize:'11.5px', color:'#64748b' }}>{(c.interview_time || c.interview?.interview_time || '').substring(0,5)} WIB</span>
                                </div>
                                <div onClick={()=>setAssignInterviewCandidate(c)} style={{ fontSize:'12.5px', color:'#475569', textAlign:'center', cursor:'pointer', padding:'6px', borderRadius:'8px', border:'1px solid transparent', transition:'all 0.15s' }} onMouseEnter={e=>{e.currentTarget.style.borderColor='#3b82f6';e.currentTarget.style.background='#f0fdf4'}} onMouseLeave={e=>{e.currentTarget.style.borderColor='transparent';e.currentTarget.style.background='transparent'}}>
                                  {(c.interview_link || c.interview?.link) ? (
                                    <div style={{ display:'flex', flexDirection:'column', gap:'4px', alignItems:'center' }}>
                                      <span style={{ display:'inline-flex', alignItems:'center', gap:'4px', color:'#3b82f6' }}><IC.Video/> Online</span>
                                      <a href={c.interview_link || c.interview?.link} target='_blank' rel='noreferrer' onClick={e=>e.stopPropagation()} style={{ fontSize:'10.5px', color:'#2563eb', background:'#eff6ff', padding:'2px 8px', borderRadius:'12px', textDecoration:'none' }}>Join Meet</a>
                                    </div>
                                  ) : (
                                    <span style={{ display:'inline-flex', alignItems:'center', gap:'4px', justifyContent:'center' }}><IC.MapPin/> {c.interview?.notes || c.interview_notes || 'Offline'}</span>
                                  )}
                                </div>
                              </>
                            ) : (
                              <>
                                <div style={{ display:'flex', justifyContent:'center', alignItems:'center' }}>
                                  <button onClick={()=>setAssignInterviewCandidate(c)} style={{ display:'flex', alignItems:'center', gap:'6px', padding:'6px 14px', borderRadius:'8px', border:'1px dashed #cbd5e1', background:'#fff', color:'#64748b', fontSize:'11.5px', fontWeight:'600', cursor:'pointer', transition:'all 0.15s' }} onMouseEnter={e=>{e.currentTarget.style.borderColor='#3b82f6';e.currentTarget.style.color='#3b82f6';e.currentTarget.style.background='#f0f7ff'}} onMouseLeave={e=>{e.currentTarget.style.borderColor='#cbd5e1';e.currentTarget.style.color='#64748b';e.currentTarget.style.background='#fff'}}>
                                    <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><rect x='3' y='4' width='18' height='18' rx='2'/><line x1='16' y1='2' x2='16' y2='6'/><line x1='8' y1='2' x2='8' y2='6'/><line x1='3' y1='10' x2='21' y2='10'/></svg>
                                    Assign Interview
                                  </button>
                                </div>
                                <div style={{ display:'flex', justifyContent:'center', alignItems:'center' }}>
                                  <span style={{ fontSize:'12px', color:'#cbd5e1' }}>-</span>
                                </div>
                              </>
                            )}
                          </>
                        ) : isTest ? (
                          <>
                            <div style={{ display:'flex', justifyContent:'center', alignItems:'center', fontSize:'13px', color:'#475569', fontWeight:'500' }}>{c.test_location||'Online'}</div>
                            <div style={{ display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', gap:'2px' }}>
                              {c.test_date?<><span style={{ fontSize:'12.5px', fontWeight:'600', color:'#1e293b' }}>{formatDateToFrontend(c.test_date)}</span><span style={{ fontSize:'11px', color:'#64748b' }}>{c.test_time||'09:00'} WIB</span></>:<span style={{ fontSize:'12px', color:'#94a3b8' }}>Not Scheduled</span>}
                            </div>
                            <div style={{ display:'flex', justifyContent:'center', alignItems:'center' }}>
                              {c.test_link||c.test_submission?<a href={c.test_submission||c.test_link} target='_blank' rel='noreferrer' style={{ fontSize:'12px', color:'#2563eb', background:'#eff6ff', padding:'4px 12px', borderRadius:'8px', textDecoration:'none', fontWeight:'600' }}>View</a>:<span style={{ fontSize:'12px', color:'#94a3b8' }}>-</span>}
                            </div>
                            <div style={{ fontSize:'13px', color:'#0f172a', fontWeight:'700', textAlign:'center', display:'flex', justifyContent:'center', alignItems:'center' }}>
                              {c.test_score?<span style={{ color:'#10b981', background:'#ecfdf5', padding:'2px 8px', borderRadius:'12px', cursor:'pointer' }} onClick={()=>{setAssignTestCandidate(c);setTestName(c.test_name||'');setTestLink(c.test_link||'');setTestDate(c.test_date||'');setTestTime(c.test_time||'');setTestNotes(c.test_notes||'')}}>{c.test_score}/100</span>:<button style={{ display:'flex', alignItems:'center', gap:'4px', padding:'4px 10px', borderRadius:'6px', border:'1px solid #cbd5e1', background:'#fff', color:'#64748b', fontSize:'11px', fontWeight:'600', cursor:'pointer', transition:'all 0.15s' }} onMouseEnter={e=>{e.currentTarget.style.borderColor='#3b82f6';e.currentTarget.style.color='#3b82f6';e.currentTarget.style.background='#f0f7ff'}} onMouseLeave={e=>{e.currentTarget.style.borderColor='#cbd5e1';e.currentTarget.style.color='#64748b';e.currentTarget.style.background='#fff'}} onClick={()=>{setAssignTestCandidate(c);setTestName(c.test_name||'');setTestLink(c.test_link||'');setTestDate(c.test_date||'');setTestTime(c.test_time||'');setTestNotes(c.test_notes||'')}}>Grade</button>}
                            </div>
                          </>
                        ) : (
                          <>
                            <div style={{ display:'flex', justifyContent:'center', alignItems:'center' }}>{c.has_cv?<DocBtn label='View' onClick={()=>viewDoc(c,'cv')}/>:<span style={{ fontSize:'12px', color:'#cbd5e1' }}>-</span>}</div>
                            <div style={{ display:'flex', justifyContent:'center', alignItems:'center' }}>{c.has_portfolio?<DocBtn label='View' onClick={()=>viewDoc(c,'portfolio')}/>:<span style={{ fontSize:'12px', color:'#cbd5e1' }}>-</span>}</div>
                            <div style={{ display:'flex', justifyContent:'center', alignItems:'center' }}>{c.has_supporting_document?<DocBtn label='View' onClick={()=>viewDoc(c,'supporting_document')}/>:<span style={{ fontSize:'12px', color:'#cbd5e1' }}>-</span>}</div>
                            <div style={{ fontSize:'12.5px', color:'#64748b', display:'flex', justifyContent:'center', alignItems:'center' }}>{c.submitted_at?new Date(c.submitted_at).toLocaleDateString():'-'}</div>
                          </>
                        )}

                        {aiActive ? (
                          // When AI Active (Smart Rank): show rank
                          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'4px' }}>
                            {aiData ? (
                              <>
                                <RankBadge rank={aiData.rank} />
                                {aiData.suggestion_reason && (
                                  <button
                                    onClick={() => setRankReasonModal({
                                      name: c.name,
                                      rank: aiData.rank,
                                      score: aiData.smart_rank_score,
                                      reason: aiData.suggestion_reason
                                    })}
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      padding: '4px 8px',
                                      background: '#f5f3ff',
                                      border: '1px solid #ddd6fe',
                                      borderRadius: '6px',
                                      color: '#6d28d9',
                                      fontSize: '11px',
                                      fontWeight: '600',
                                      cursor: 'pointer',
                                      marginTop: '4px',
                                      transition: 'all 0.15s',
                                      outline: 'none',
                                      fontFamily: 'inherit'
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = '#ede9fe'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = '#f5f3ff'; }}
                                    title="View AI suitability analysis"
                                  >
                                    <IC.Info /> Reason
                                  </button>
                                )}
                              </>
                            ) : <span style={{ fontSize:'12px', color:'#cbd5e1' }}>-</span>}
                          </div>
                        ) : (
                          // Normal notes column
                          <div style={{ display:'flex', alignItems:'center', justifyContent:'center' }}>
                            {c.hr_notes ? (
                              <div style={{ fontSize:'11px', color:'#475569', whiteSpace:'pre-wrap', wordBreak:'break-word', background:'#f8fafc', border:'1px solid #e2e8f0', padding:'4px 8px', borderRadius:'6px', cursor:'pointer', maxWidth:'120px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }} onClick={()=>setNotesCandidate(c)} title={c.hr_notes}>{c.hr_notes}</div>
                            ) : (
                              <button onClick={()=>setNotesCandidate(c)} style={{ display:'flex', alignItems:'center', gap:'4px', padding:'4px 8px', borderRadius:'6px', border:'1px dashed #cbd5e1', background:'#fff', color:'#64748b', fontSize:'10.5px', fontWeight:'600', cursor:'pointer', transition:'all 0.15s', whiteSpace:'nowrap' }} onMouseEnter={e=>{e.currentTarget.style.borderColor='#3b82f6';e.currentTarget.style.color='#3b82f6';e.currentTarget.style.background='#f0f7ff'}} onMouseLeave={e=>{e.currentTarget.style.borderColor='#cbd5e1';e.currentTarget.style.color='#64748b';e.currentTarget.style.background='#fff'}}>
                                <svg width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7'/><path d='M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z'/></svg>
                                Add Notes
                              </button>
                            )}
                          </div>
                        )}

                        {/* Actions — centered, Pass+Reject inline, summary icon below centered */}
                        <div style={{ display:'flex', flexDirection:'column', gap:'4px', alignItems:'center', justifyContent:'center' }}>
                          {activeTab!=='final' && (
                            <div style={{ display:'flex', gap:'4px', justifyContent:'center', alignItems:'center' }}>
                              <ActionBtn label={activeSubStageIndex===selectionFlow.length-1?'Accept':'Pass'} variant='green' onClick={()=>handlePass(c)} />
                              <ActionBtn label='Reject' variant='red' onClick={()=>setConfirmAction({type:'reject',candidate:c})} />
                            </div>
                          )}
                          {activeTab!=='final' && (
                            <div style={{ display:'flex', justifyContent:'center' }}>
                              <IconBtn
                                icon={<IC.AlignLeft />}
                                title='Quick Summary'
                                onClick={() => handleSummary(c.id_submission)}
                                active={isSumOpen}
                                bgHov='#eff6ff'
                                color='#64748b'
                              />
                            </div>
                          )}
                          {activeTab==='final'&&c.status==='accepted'&&<span style={{ fontSize:'11px', fontWeight:'600', color:'#10b981', background:'#ecfdf5', padding:'3px 8px', borderRadius:'20px', whiteSpace:'nowrap' }}>Accepted</span>}
                          {activeTab==='final'&&c.status==='rejected'&&<span style={{ fontSize:'11px', fontWeight:'600', color:'#ef4444', background:'#fef2f2', padding:'3px 8px', borderRadius:'20px', whiteSpace:'nowrap' }}>Rejected</span>}
                        </div>
                      </div>

                      {/* ── NEW: Inline Summary Panel ── */}
                      {isSumOpen && (
                        <div style={{ padding:'0 24px 12px', borderBottom:i<displayCandidates.length-1?'1px solid #f1f5f9':'none' }}>
                          <SummaryPanel
                            summary={summData?.text}
                            keyTerms={summData?.keyTerms}
                            loading={summData?.loading ?? true}
                            onClose={() => setOpenSummaryId(null)}
                          />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>{/* end table body */}
            </div>{/* end sel-table-inner */}
            </div>{/* end sel-table-scroll */}
          </div>
        </main>
      </div>

      {/* ── All existing modals below — unchanged ── */}

      {showLogoutModal&&(
        <div style={{ position:'fixed',inset:0,background:'rgba(10,22,40,0.5)',zIndex:300,display:'flex',alignItems:'center',justifyContent:'center' }}>
          <div style={{ background:'#fff',borderRadius:'16px',padding:'28px',width:'360px',boxShadow:'0 20px 60px rgba(0,0,0,0.18)',fontFamily:"'Poppins','Segoe UI',sans-serif" }}>
            <div style={{ fontSize:'16px',fontWeight:'700',color:'#0f172a',marginBottom:'6px' }}>Sign Out?</div>
            <div style={{ fontSize:'13px',color:'#64748b',lineHeight:1.6,marginBottom:'24px' }}>Are you sure you want to sign out from your HR account?</div>
            <div style={{ display:'flex',gap:'10px',justifyContent:'flex-end' }}>
              <button onClick={()=>setShowLogoutModal(false)} style={{ padding:'9px 18px',borderRadius:'10px',border:'1px solid #e2e8f0',background:'#fff',fontSize:'13px',fontWeight:'600',color:'#64748b',cursor:'pointer',fontFamily:'inherit' }}>Cancel</button>
              <button onClick={handleLogout} style={{ padding:'9px 18px',borderRadius:'10px',border:'none',background:'#ef4444',fontSize:'13px',fontWeight:'700',color:'#fff',cursor:'pointer',fontFamily:'inherit' }}>Yes, Sign Out</button>
            </div>
          </div>
        </div>
      )}

      {notesCandidate&&(
        <div onClick={e=>e.target===e.currentTarget&&setNotesCandidate(null)} style={{ position:'fixed',inset:0,background:'rgba(10,22,40,0.5)',zIndex:300,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px' }}>
          <div style={{ background:'#fff',borderRadius:'16px',width:'100%',maxWidth:'440px',boxShadow:'0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ padding:'20px 24px',borderBottom:'1px solid #f1f5f9',display:'flex',alignItems:'center',justifyContent:'space-between' }}>
              <div><h3 style={{ margin:0,fontSize:'15px',fontWeight:'700',color:'#0f172a' }}>Add/Edit Notes</h3><p style={{ margin:'2px 0 0',fontSize:'12px',color:'#94a3b8' }}>{notesCandidate.name}</p></div>
              <button onClick={()=>setNotesCandidate(null)} style={{ background:'none',border:'none',cursor:'pointer',color:'#64748b' }}><IC.X/></button>
            </div>
            <div style={{ padding:'20px 24px',display:'flex',flexDirection:'column',gap:'16px' }}>
              <textarea defaultValue={notesCandidate.hr_notes||''} id='hr_notes_area' placeholder='Add internal notes about this candidate...' rows={5} style={{ width:'100%',padding:'10px 12px',borderRadius:'8px',border:'1px solid #e2e8f0',background:'#fff',fontSize:'13px',fontFamily:'inherit',color:'#1e293b',resize:'vertical',outline:'none',lineHeight:'1.6',boxSizing:'border-box' }}/>
              <div style={{ display:'flex',gap:'10px',justifyContent:'flex-end' }}>
                <button onClick={()=>setNotesCandidate(null)} style={{ padding:'8px 16px',borderRadius:'8px',border:'1px solid #e2e8f0',background:'#fff',cursor:'pointer',fontSize:'13px' }}>Cancel</button>
                <button onClick={async()=>{const note=document.getElementById('hr_notes_area').value;await handleSaveNotes(notesCandidate.id_submission,note);setNotesCandidate(null)}} style={{ padding:'8px 18px',borderRadius:'8px',border:'none',background:'#3b82f6',color:'#fff',cursor:'pointer',fontSize:'13px',fontWeight:'600' }}>Save Note</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddTestTypeModal&&(
        <div style={{ position:'fixed',inset:0,background:'rgba(10,22,40,0.5)',zIndex:300,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px' }}>
          <div style={{ background:'#fff',borderRadius:'16px',width:'100%',maxWidth:'440px',boxShadow:'0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <style>{`.cfi::file-selector-button{background:#f8fafc;color:#475569;border:1px solid #cbd5e1;border-radius:6px;padding:6px 12px;font-weight:600;cursor:pointer;margin-right:10px;font-size:11.5px}.cfi::file-selector-button:hover{background:#3b82f6;color:#fff;border-color:#3b82f6}`}</style>
            <div style={{ padding:'20px 24px',borderBottom:'1px solid #f1f5f9',display:'flex',alignItems:'center',justifyContent:'space-between' }}>
              <div><h3 style={{ margin:0,fontSize:'16px',fontWeight:'700',color:'#0f172a' }}>Create Test Template</h3><p style={{ margin:'2px 0 0',fontSize:'12.5px',color:'#94a3b8' }}>Create evaluation guidelines for this position</p></div>
              <button onClick={()=>setShowAddTestTypeModal(false)} style={{ background:'none',border:'none',cursor:'pointer',color:'#64748b' }}><IC.X/></button>
            </div>
            <div style={{ padding:'24px',display:'flex',flexDirection:'column',gap:'16px' }}>
              <div><label style={{ fontSize:'12px',fontWeight:'600',color:'#475569',display:'block',marginBottom:'6px' }}>Test Name</label><input type='text' placeholder='e.g. Backend Algorithm Challenge' value={newTestName} onChange={e=>setNewTestName(e.target.value)} style={{ width:'100%',padding:'10px 12px',borderRadius:'8px',border:'1px solid #cbd5e1',fontSize:'13px',background:'#fff',color:'#1e293b',boxSizing:'border-box',outline:'none' }}/></div>
              <div><label style={{ fontSize:'12px',fontWeight:'600',color:'#475569',display:'block',marginBottom:'6px' }}>Format</label><select value={newTestFormat} onChange={e=>setNewTestFormat(e.target.value)} style={{ width:'100%',padding:'10px 12px',borderRadius:'8px',border:'1px solid #cbd5e1',fontSize:'13px',background:'#fff',color:'#1e293b',boxSizing:'border-box',outline:'none' }}><option value='coding_test'>Coding Test</option><option value='aptitude_test'>Aptitude & Logic</option><option value='essay_project'>Case Study</option><option value='written_test'>Written Essay</option></select></div>
              <div><label style={{ fontSize:'12px',fontWeight:'600',color:'#475569',display:'block',marginBottom:'6px' }}>Question File (Optional)</label><input type='file' className='cfi' onChange={e=>setNewTestFile(e.target.files[0]||null)} style={{ width:'100%',padding:'8px',fontSize:'12px',color:'#64748b',background:'#fff',border:'1px dashed #cbd5e1',borderRadius:'8px',cursor:'pointer' }}/></div>
              <div><label style={{ fontSize:'12px',fontWeight:'600',color:'#475569',display:'block',marginBottom:'6px' }}>Instructions</label><textarea placeholder='Instructions...' value={testNotes} onChange={e=>setTestNotes(e.target.value)} style={{ width:'100%',padding:'10px 12px',borderRadius:'8px',border:'1px solid #cbd5e1',fontSize:'13px',fontFamily:'inherit',background:'#fff',color:'#1e293b',resize:'vertical',boxSizing:'border-box',outline:'none' }} rows={3}/></div>
              <div style={{ display:'flex',gap:'10px',justifyContent:'flex-end',marginTop:'8px' }}>
                <button onClick={()=>setShowAddTestTypeModal(false)} style={{ padding:'8px 16px',borderRadius:'8px',border:'1px solid #e2e8f0',background:'#fff',color:'#64748b',cursor:'pointer',fontSize:'13px',fontWeight:'600' }}>Cancel</button>
                <button onClick={async()=>{if(!newTestName)return pushToast('Test name is required!', 'error');try{const formData=new FormData();formData.append('name',newTestName);formData.append('format',newTestFormat);formData.append('instructions',testNotes);if(newTestFile)formData.append('file',newTestFile);if(editingTemplateId)formData.append('template_id',editingTemplateId);const res=await api(`/hr/positions/${activePositionId}/test-templates`,{method:'POST',body:formData});if(res.success){setConfiguredTests(res.data);setNewTestName('');setNewTestFile(null);setTestNotes('');setEditingTemplateId(null);setShowAddTestTypeModal(false);pushToast(editingTemplateId ? 'Template updated successfully' : 'Template created successfully','success')}}catch(err){pushToast('Failed: '+(err.message||err),'error')}}} style={{ padding:'8px 20px',borderRadius:'8px',border:'none',background:'#3b82f6',color:'#fff',cursor:'pointer',fontSize:'13px',fontWeight:'600' }}>{editingTemplateId?'Update Template':'Save Draft'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteTemplateConfirm&&(
        <div style={{ position:'fixed',inset:0,background:'rgba(10,22,40,0.5)',zIndex:310,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px' }}>
          <div style={{ background:'#fff',borderRadius:'16px',width:'100%',maxWidth:'400px',boxShadow:'0 20px 25px -5px rgba(0,0,0,0.1)',padding:'24px',textAlign:'center' }}>
            <div style={{ width:'48px',height:'48px',background:'#fef2f2',color:'#ef4444',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px' }}><svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2'/></svg></div>
            <h3 style={{ margin:'0 0 8px',fontSize:'16px',fontWeight:'700',color:'#0f172a' }}>Delete Test Template?</h3>
            <p style={{ margin:'0 0 24px',fontSize:'13px',color:'#64748b',lineHeight:'1.5' }}>Are you sure you want to delete <strong>{deleteTemplateConfirm.name}</strong>? This cannot be undone.</p>
            <div style={{ display:'flex',gap:'12px',justifyContent:'center' }}>
              <button onClick={()=>setDeleteTemplateConfirm(null)} style={{ padding:'8px 16px',borderRadius:'8px',border:'1px solid #cbd5e1',background:'#fff',color:'#64748b',fontSize:'13px',fontWeight:'600',cursor:'pointer' }}>Cancel</button>
              <button onClick={async()=>{try{const res=await api(`/hr/positions/${activePositionId}/test-templates/${deleteTemplateConfirm.id}`,{method:'DELETE'});if(res.success){setConfiguredTests(res.data);setDeleteTemplateConfirm(null);pushToast('Test template deleted successfully','success')}}catch(err){pushToast('Failed: '+(err.message||err),'error')}}} style={{ padding:'8px 16px',borderRadius:'8px',border:'none',background:'#ef4444',color:'#fff',fontSize:'13px',fontWeight:'600',cursor:'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {showBulkTestModal&&(
        <div style={{ position:'fixed',inset:0,background:'rgba(10,22,40,0.5)',zIndex:300,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px' }}>
          <div style={{ background:'#fff',borderRadius:'16px',width:'100%',maxWidth:'440px',boxShadow:'0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ padding:'20px 24px',borderBottom:'1px solid #f1f5f9',display:'flex',alignItems:'center',justifyContent:'space-between' }}>
              <div><h3 style={{ margin:0,fontSize:'16px',fontWeight:'700',color:'#0f172a' }}>Bulk Assign Test</h3><p style={{ margin:'2px 0 0',fontSize:'12.5px',color:'#94a3b8' }}>Push assessments to current applicant groups</p></div>
              <button onClick={()=>setShowBulkTestModal(false)} style={{ background:'none',border:'none',cursor:'pointer',color:'#64748b' }}><IC.X/></button>
            </div>
            <div style={{ padding:'24px',display:'flex',flexDirection:'column',gap:'16px' }}>
              <div><label style={{ fontSize:'12px',fontWeight:'600',color:'#475569',display:'block',marginBottom:'6px' }}>Test Type</label><select value={bulkTestId} onChange={e=>setBulkTestId(e.target.value)} style={{ width:'100%',padding:'10px 12px',borderRadius:'8px',border:'1px solid #cbd5e1',fontSize:'13px',background:'#fff',color:'#1e293b',boxSizing:'border-box',outline:'none' }}><option value=''>-- Choose Test Template --</option>{configuredTests.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
              <div><label style={{ fontSize:'12px',fontWeight:'600',color:'#475569',display:'block',marginBottom:'6px' }}>Location Type</label><div style={{ display:'flex',gap:'20px' }}>{['Online','Offline'].map(type=>{const isSel=bulkTestLocation===type;return(<div key={type} onClick={()=>setBulkTestLocation(type)} style={{ fontSize:'13px',display:'flex',alignItems:'center',gap:'8px',cursor:'pointer',userSelect:'none',color:isSel?'#1e293b':'#64748b',fontWeight:isSel?'600':'500' }}><div style={{ width:'16px',height:'16px',borderRadius:'50%',border:`2px solid ${isSel?'#3b82f6':'#cbd5e1'}`,background:'#fff',display:'flex',alignItems:'center',justifyContent:'center',boxSizing:'border-box' }}>{isSel&&<div style={{ width:'8px',height:'8px',borderRadius:'50%',background:'#3b82f6' }}/>}</div>{type}</div>)})}</div></div>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px' }}>
                <div><label style={{ fontSize:'12px',fontWeight:'600',color:'#475569',display:'block',marginBottom:'6px' }}>Date</label><CalendarPicker value={bulkTestDate} onChange={setBulkTestDate}/></div>
                <div><label style={{ fontSize:'12px',fontWeight:'600',color:'#475569',display:'block',marginBottom:'6px' }}>Time</label><CustomTimePicker value={bulkTestTime} onChange={setBulkTestTime}/></div>
              </div>
              <div><label style={{ fontSize:'12px',fontWeight:'600',color:'#475569',display:'block',marginBottom:'6px' }}>Deadline (Optional)</label><CalendarPicker value={globalTestDeadline} onChange={setGlobalTestDeadline}/></div>
              <div style={{ display:'flex',gap:'10px',justifyContent:'flex-end',marginTop:'8px' }}>
                <button onClick={()=>setShowBulkTestModal(false)} style={{ padding:'8px 16px',borderRadius:'8px',border:'1px solid #e2e8f0',background:'#fff',color:'#64748b',cursor:'pointer',fontSize:'13px',fontWeight:'600' }}>Cancel</button>
                <button onClick={async()=>{const selObj=configuredTests.find(t=>String(t.id)===String(bulkTestId));if(!selObj)return pushToast('Please select a test type!', 'error');if(!bulkTestDate||!bulkTestTime)return pushToast('Date and time are required!', 'error');try{const id_submissions=candidates.map(c=>c.id_submission);if(id_submissions.length===0)return pushToast('No candidates in this stage!', 'error');const res=await api('/hr/candidates/bulk-assign-test',{method:'POST',data:{id_submissions,test_name:selObj.name,test_location:bulkTestLocation,test_date:bulkTestDate,test_time:bulkTestTime,test_deadline:globalTestDeadline||null}});if(res.success){pushToast(res.message || 'Tests assigned successfully','success');fetchCandidates();setShowBulkTestModal(false)}}catch(err){pushToast('Failed: '+(err.message||err),'error')}}} style={{ padding:'8px 20px',borderRadius:'8px',border:'none',background:'#3b82f6',color:'#fff',cursor:'pointer',fontSize:'13px',fontWeight:'600' }}>Assign Tests Now</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {assignTestCandidate&&(
        <div style={{ position:'fixed',inset:0,background:'rgba(10,22,40,0.5)',zIndex:300,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px' }}>
          <div style={{ background:'#fff',borderRadius:'16px',width:'100%',maxWidth:'440px',boxShadow:'0 20px 25px -5px rgba(0,0,0,0.1)',overflow:'hidden' }}>
            <div style={{ padding:'20px 24px',borderBottom:'1px solid #f1f5f9',display:'flex',alignItems:'center',justifyContent:'space-between' }}>
              <div><h3 style={{ margin:0,fontSize:'16px',fontWeight:'700',color:'#0f172a' }}>Assign & Grade Test</h3><p style={{ margin:'2px 0 0',fontSize:'12.5px',color:'#94a3b8' }}>{assignTestCandidate.name}</p></div>
              <button onClick={()=>setAssignTestCandidate(null)} style={{ background:'none',border:'none',cursor:'pointer',color:'#64748b' }}><IC.X/></button>
            </div>
            <div style={{ padding:'24px',display:'flex',flexDirection:'column',gap:'16px' }}>
              <div><label style={{ fontSize:'12px',fontWeight:'600',color:'#475569',display:'block',marginBottom:'6px' }}>Test Name</label><input type='text' placeholder='e.g. Logical Reasoning' value={testName} onChange={e=>setTestName(e.target.value)} style={{ width:'100%',padding:'10px 12px',borderRadius:'8px',border:'1px solid #cbd5e1',fontSize:'13px',background:'#fff',color:'#1e293b',boxSizing:'border-box',outline:'none' }}/></div>
              <div><label style={{ fontSize:'12px',fontWeight:'600',color:'#475569',display:'block',marginBottom:'6px' }}>Test Link / URL</label><input type='url' placeholder='https://...' value={testLink} onChange={e=>setTestLink(e.target.value)} style={{ width:'100%',padding:'10px 12px',borderRadius:'8px',border:'1px solid #cbd5e1',fontSize:'13px',background:'#fff',color:'#1e293b',boxSizing:'border-box',outline:'none' }}/></div>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px' }}>
                <div><label style={{ fontSize:'12px',fontWeight:'600',color:'#475569',display:'block',marginBottom:'6px' }}>Date</label><input type='date' value={testDate} onChange={e=>setTestDate(e.target.value)} style={{ width:'100%',padding:'10px 12px',borderRadius:'8px',border:'1px solid #cbd5e1',fontSize:'13px',background:'#fff',color:'#1e293b',boxSizing:'border-box',outline:'none' }}/></div>
                <div><label style={{ fontSize:'12px',fontWeight:'600',color:'#475569',display:'block',marginBottom:'6px' }}>Time</label><input type='time' value={testTime} onChange={e=>setTestTime(e.target.value)} style={{ width:'100%',padding:'10px 12px',borderRadius:'8px',border:'1px solid #cbd5e1',fontSize:'13px',background:'#fff',color:'#1e293b',boxSizing:'border-box',outline:'none' }}/></div>
              </div>
              <div><label style={{ fontSize:'12px',fontWeight:'600',color:'#475569',display:'block',marginBottom:'6px' }}>Score (Optional)</label><input type='number' min='0' max='100' placeholder='e.g. 85' value={assignTestCandidate.test_score||''} onChange={e=>setAssignTestCandidate(prev=>({...prev,test_score:e.target.value}))} style={{ width:'100%',padding:'10px 12px',borderRadius:'8px',border:'1px solid #cbd5e1',fontSize:'13px',background:'#fff',color:'#1e293b',boxSizing:'border-box',outline:'none' }}/></div>
              <div><label style={{ fontSize:'12px',fontWeight:'600',color:'#475569',display:'block',marginBottom:'6px' }}>Instructions</label><textarea placeholder='Passcodes, rules...' value={testNotes} onChange={e=>setTestNotes(e.target.value)} style={{ width:'100%',padding:'10px 12px',borderRadius:'8px',border:'1px solid #cbd5e1',fontSize:'13px',fontFamily:'inherit',background:'#fff',color:'#1e293b',resize:'vertical',boxSizing:'border-box',outline:'none' }} rows={3}/></div>
              <div style={{ display:'flex',gap:'10px',justifyContent:'flex-end',marginTop:'8px' }}>
                <button onClick={()=>setAssignTestCandidate(null)} style={{ padding:'8px 16px',borderRadius:'8px',border:'1px solid #e2e8f0',background:'#fff',color:'#64748b',cursor:'pointer',fontSize:'13px',fontWeight:'600' }}>Cancel</button>
                <button onClick={async()=>{
                  try {
                    console.log("🚀 Save Test clicked. Candidate ID:", assignTestCandidate.id_submission);
                    console.log("📝 Test Data:", {testName, testLink, testDate, testTime, testNotes, testScore: assignTestCandidate.test_score});
                    
                    // If test already exists (has score or name), just update score/notes
                    // Otherwise, send full test details
                    const isEditingExisting = assignTestCandidate.test_name || assignTestCandidate.test_score;
                    
                    const payload = isEditingExisting ? {
                      test_score: assignTestCandidate.test_score ? parseInt(assignTestCandidate.test_score) : null,
                      test_notes: testNotes
                    } : {
                      test_name: testName,
                      test_link: testLink,
                      test_date: testDate,
                      test_time: testTime,
                      test_notes: testNotes
                    };
                    console.log("📤 Sending payload:", payload);
                    
                    const response = await api(`/hr/candidates/${assignTestCandidate.id_submission}/assign-test`, {
                      method: 'PATCH',
                      data: payload
                    });
                    console.log("✅ API Response:", response);
                    
                    setCandidates(prev=>prev.map(c=>c.id_submission===assignTestCandidate.id_submission?{...c,test_name:testName||c.test_name,test_link:testLink||c.test_link,test_date:testDate||c.test_date,test_time:testTime||c.test_time,test_score:assignTestCandidate.test_score||c.test_score,test_notes:testNotes||c.test_notes}:c));
                    setAssignTestCandidate(null);
                    setTestName(''); setTestLink(''); setTestDate(''); setTestTime(''); setTestNotes('');
                    pushToast('Test ' + (isEditingExisting ? 'graded' : 'assigned') + ' successfully!', 'success');
                  } catch(err) {
                    console.error("❌ Error:", err);
                    pushToast('Failed to save test: ' + (err.message || err), 'error');
                  }
                }} style={{ padding:'8px 20px',borderRadius:'8px',border:'none',background:'#3b82f6',color:'#fff',cursor:'pointer',fontSize:'13px',fontWeight:'600' }}>Save Test Info</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {assignInterviewCandidate&&(
        <div style={{ position:'fixed',inset:0,background:'rgba(10,22,40,0.5)',zIndex:300,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px' }}>
          <div style={{ background:'#fff',borderRadius:'16px',width:'100%',maxWidth:'480px',boxShadow:'0 20px 25px -5px rgba(0,0,0,0.1)',overflow:'hidden' }}>
            <div style={{ padding:'20px 24px',borderBottom:'1px solid #f1f5f9',display:'flex',alignItems:'center',justifyContent:'space-between' }}>
              <div><h3 style={{ margin:0,fontSize:'16px',fontWeight:'700',color:'#0f172a' }}>Schedule Interview</h3><p style={{ margin:'2px 0 0',fontSize:'12.5px',color:'#94a3b8' }}>{assignInterviewCandidate.name}</p></div>
              <button onClick={()=>setAssignInterviewCandidate(null)} style={{ background:'none',border:'none',cursor:'pointer',color:'#64748b' }}><IC.X/></button>
            </div>
            <div style={{ padding:'24px',display:'flex',flexDirection:'column',gap:'16px' }}>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px' }}>
                <div><label style={{ fontSize:'12px',fontWeight:'600',color:'#475569',display:'block',marginBottom:'6px' }}>Date</label><input type='date' value={interviewDate} onChange={e=>setInterviewDate(e.target.value)} style={{ width:'100%',padding:'10px 12px',borderRadius:'8px',border:'1px solid #cbd5e1',fontSize:'13px',background:'#fff',color:'#1e293b',boxSizing:'border-box',outline:'none' }}/></div>
                <div><label style={{ fontSize:'12px',fontWeight:'600',color:'#475569',display:'block',marginBottom:'6px' }}>Time</label><input type='time' value={interviewTime} onChange={e=>setInterviewTime(e.target.value)} style={{ width:'100%',padding:'10px 12px',borderRadius:'8px',border:'1px solid #cbd5e1',fontSize:'13px',background:'#fff',color:'#1e293b',boxSizing:'border-box',outline:'none' }}/></div>
              </div>
              <div><label style={{ fontSize:'12px',fontWeight:'600',color:'#475569',display:'block',marginBottom:'6px' }}>Interview Link / URL</label><input type='url' placeholder='https://meet.google.com/... or Zoom link' value={interviewLink} onChange={e=>setInterviewLink(e.target.value)} style={{ width:'100%',padding:'10px 12px',borderRadius:'8px',border:'1px solid #cbd5e1',fontSize:'13px',background:'#fff',color:'#1e293b',boxSizing:'border-box',outline:'none' }}/></div>
              <div><label style={{ fontSize:'12px',fontWeight:'600',color:'#475569',display:'block',marginBottom:'6px' }}>Notes / Instructions</label><textarea placeholder='e.g. Meeting room location, platform details, preparation notes' value={interviewNotes} onChange={e=>setInterviewNotes(e.target.value)} style={{ width:'100%',padding:'10px 12px',borderRadius:'8px',border:'1px solid #cbd5e1',fontSize:'13px',fontFamily:'inherit',background:'#fff',color:'#1e293b',resize:'vertical',boxSizing:'border-box',outline:'none' }} rows={3}/></div>
              <div style={{ display:'flex',gap:'10px',justifyContent:'flex-end',marginTop:'8px' }}>
                <button onClick={()=>setAssignInterviewCandidate(null)} style={{ padding:'8px 16px',borderRadius:'8px',border:'1px solid #e2e8f0',background:'#fff',color:'#64748b',cursor:'pointer',fontSize:'13px',fontWeight:'600' }}>Cancel</button>
                <button onClick={async()=>{
                  try {
                    console.log("🚀 Save Interview clicked. Candidate ID:", assignInterviewCandidate.id_submission);
                    console.log("📅 Interview Data:", {interviewDate, interviewTime, interviewLink, interviewNotes});
                    console.log("🔍 Is date valid?", interviewDate ? "YES: " + interviewDate : "NO - EMPTY");
                    console.log("🔍 Is time valid?", interviewTime ? "YES: " + interviewTime : "NO - EMPTY");
                    console.log("🔍 Is link valid?", interviewLink ? "YES: " + interviewLink : "NO - EMPTY");
                    
                    const isEditing = assignInterviewCandidate.interview_date || assignInterviewCandidate.id_interview;
                    
                    const payload = {
                      interview_date: interviewDate,
                      interview_time: interviewTime,
                      interview_link: interviewLink,
                      interview_notes: interviewNotes
                    };
                    console.log("📤 Sending payload to:", `/hr/candidates/${assignInterviewCandidate.id_submission}/assign-interview`);
                    console.log("📤 Payload:", payload);
                    
                    const response = await api(`/hr/candidates/${assignInterviewCandidate.id_submission}/assign-interview`, {
                      method: 'PATCH',
                      data: payload
                    });
                    console.log("✅ API Response:", response);
                    
                    setCandidates(prev=>prev.map(c=>c.id_submission===assignInterviewCandidate.id_submission?{...c,interview_date:interviewDate,interview_time:interviewTime,interview_link:interviewLink,interview_notes:interviewNotes}:c));
                    setAssignInterviewCandidate(null);
                    setInterviewDate(''); setInterviewTime(''); setInterviewLink(''); setInterviewNotes('');
                    pushToast('Interview scheduled successfully!', 'success');
                  } catch(err) {
                    console.error("❌ Error caught:", err);
                    console.error("❌ Error message:", err.message);
                    console.error("❌ Full error:", JSON.stringify(err));
                    pushToast('Failed to schedule interview: ' + (err.message || JSON.stringify(err)), 'error');
                  }
                }} style={{ padding:'8px 20px',borderRadius:'8px',border:'none',background:'#3b82f6',color:'#fff',cursor:'pointer',fontSize:'13px',fontWeight:'600' }}>Save Interview</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmAction&&(
        <div style={{ position:'fixed',inset:0,background:'rgba(10,22,40,0.5)',zIndex:300,display:'flex',alignItems:'center',justifyContent:'center' }}>
          <div style={{ background:'#fff',borderRadius:'16px',padding:'28px',width:'360px' }}>
            <h3 style={{ margin:'0 0 8px',fontSize:'16px' }}>Confirm Action</h3>
            <p style={{ margin:'0 0 24px',fontSize:'13px',color:'#64748b' }}>
              {confirmAction.type==='accept'?`Accept ${confirmAction.candidate.name} as an intern?`:confirmAction.type==='reject'?`Reject ${confirmAction.candidate.name}? This cannot be undone.`:`Pass ${confirmAction.candidate.name} to the next stage?`}
            </p>
            <div style={{ display:'flex',gap:'10px',justifyContent:'flex-end' }}>
              <button onClick={()=>setConfirmAction(null)} style={{ padding:'8px 16px',borderRadius:'8px',border:'1px solid #e2e8f0',background:'#fff',cursor:'pointer' }}>Cancel</button>
              <button onClick={executeAction} style={{ padding:'8px 16px',borderRadius:'8px',border:'none',background:'#3b82f6',color:'#fff',cursor:'pointer',fontWeight:'600' }}>Confirm</button>
            </div>
          </div>
        </div>
      )}



      {rankReasonModal && (
        <div style={{ position:'fixed',inset:0,background:'rgba(10,22,40,0.5)',zIndex:300,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px' }}>
          <div style={{ background:'#fff',borderRadius:'16px',width:'100%',maxWidth:'440px',boxShadow:'0 20px 25px -5px rgba(0,0,0,0.1)',overflow:'hidden' }}>
            <div style={{ padding:'20px 24px',borderBottom:'1px solid #f1f5f9',display:'flex',alignItems:'center',justifyContent:'space-between' }}>
              <div>
                <h3 style={{ margin:0,fontSize:'16px',fontWeight:'700',color:'#0f172a' }}>AI Suitability Analysis</h3>
                <p style={{ margin:'2px 0 0',fontSize:'12.5px',color:'#94a3b8' }}>{rankReasonModal.name}</p>
              </div>
              <button onClick={()=>setRankReasonModal(null)} style={{ background:'none',border:'none',cursor:'pointer',color:'#64748b',display:'flex' }}><IC.X/></button>
            </div>
            <div style={{ padding:'24px',display:'flex',flexDirection:'column',gap:'16px' }}>
              <div style={{ display:'flex', gap:'12px', alignItems:'center' }}>
                <RankBadge rank={rankReasonModal.rank} />
                <span style={{ fontSize:'13px', fontWeight:'600', color:'#475569' }}>
                  Score: <strong style={{ color:'#4f46e5' }}>{rankReasonModal.score}/100</strong>
                </span>
              </div>
              <div>
                <label style={{ fontSize:'11.5px',fontWeight:'700',color:'#94a3b8',textTransform:'uppercase',display:'block',marginBottom:'6px' }}>AI Analysis Reason</label>
                <p style={{ margin:0, fontSize:'13.5px', color:'#334155', lineHeight:'1.65', background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:'8px', padding:'12px 14px' }}>
                  {rankReasonModal.reason}
                </p>
              </div>
              <div style={{ display:'flex',justifyContent:'flex-end',marginTop:'8px' }}>
                <button onClick={()=>setRankReasonModal(null)} style={{ padding:'8px 20px',borderRadius:'8px',border:'none',background:'#4f46e5',color:'#fff',cursor:'pointer',fontSize:'13px',fontWeight:'600',boxShadow:'0 2px 4px rgba(79,70,229,0.15)' }}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <HRToastStack toasts={toasts} onDismiss={removeToast} />

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes fadeSlide{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}
