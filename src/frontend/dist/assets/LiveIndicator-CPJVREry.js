import{c as h}from"./createLucideIcon-aZRrERt3.js";import{r as s,j as r}from"./index-BFirRb37.js";/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const p=[["path",{d:"M8 2v4",key:"1cmpym"}],["path",{d:"M16 2v4",key:"4m81vk"}],["rect",{width:"18",height:"18",x:"3",y:"4",rx:"2",key:"1hopcy"}],["path",{d:"M3 10h18",key:"8toen8"}]],f=h("calendar",p);function l({updatedAt:o,dataUpdatedAt:d,pollMs:u=5e3,label:n}){const e=o??d??Date.now(),[a,c]=s.useState(0),t=s.useRef(e);return e&&e!==t.current&&(t.current=e,c(0)),s.useEffect(()=>{const i=setInterval(()=>{c(Math.round((Date.now()-t.current)/1e3))},1e3);return()=>clearInterval(i)},[]),r.jsxs("div",{className:"flex items-center gap-1.5 text-[10px] text-muted-foreground/70",children:[r.jsx("span",{className:"w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0"}),r.jsxs("span",{children:[n?`${n} · `:"",a>0?`${a}s ago`:"Just now"," · ",Math.round(u/1e3),"s refresh"]})]})}export{f as C,l as L};
