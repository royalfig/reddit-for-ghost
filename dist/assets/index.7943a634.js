(function(){const o=document.createElement("link").relList;if(o&&o.supports&&o.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))i(e);new MutationObserver(e=>{for(const n of e)if(n.type==="childList")for(const a of n.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&i(a)}).observe(document,{childList:!0,subtree:!0});function s(e){const n={};return e.integrity&&(n.integrity=e.integrity),e.referrerpolicy&&(n.referrerPolicy=e.referrerpolicy),e.crossorigin==="use-credentials"?n.credentials="include":e.crossorigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function i(e){if(e.ep)return;e.ep=!0;const n=s(e);fetch(e.href,n)}})();const _="https://www.reddit.com/r/all/top/.json?";async function E(){const t=await fetch(_+new URLSearchParams({limit:"100"})),{data:{children:o}}=await t.json();return console.log({children:o}),o}function P(t,o,s,i,e){return`{"version":"0.3.1","atoms":[],"cards":[],"markups":[["a",["href","https://reddit.com${e}"]]],"sections":[[1,"p",[[0,[],0,"Posted by ${t} in ${o} with ${s} upvotes and an upvote ratio of ${i*100}% "],[0,[0],1,"See the original post."]]]],"ghostVersion":"4.0"}`}function L(t){return t.endsWith("jpg")||t.endsWith("png")||t.endsWith("jpeg")||t.endsWith("webp")||t.endsWith("avif")?t:null}async function j(){const t=await E();if(!t)return;let o=[];const s=t.reduce((r,c,d)=>{const{data:{author:u,url:f,over_18:m,subreddit:l,title:h,ups:g,upvote_ratio:y,permalink:w,created_utc:b}}=c;if(m)return r;o.push(l);const S=P(u,l,g,y,w),v={id:d,title:h.substring(0,191),feature_image:L(f),mobiledoc:S,tags:[l],status:"published",published_at:new Date(b*1e3).toISOString()};return r.push(v),r},[]);let i=0;const e=o.reduce((r,c)=>r.length?(r.some(u=>u.name===c)||r.push({id:i++,name:c}),r):(r.push({id:i++,name:c}),r),[]),n=s.map(r=>{const{id:c}=e.find(d=>d.name===r.tags[0]);return{tag_id:c,post_id:r.id}});return{meta:{exported_on:Date.now(),version:"5.0.0"},data:{posts:s,tags:e,posts_tags:n}}}const p=document.querySelector("#generate");p==null||p.addEventListener("click",async()=>{var n,a;(n=document.querySelector("a"))==null||n.remove();const t=document.querySelector(".container"),o=document.createElement("p");o.textContent="Gettin' those spicy posts...",t.append(o);const s=await j();if(!s)throw Error("Can't complete operation. Please try again.");const i="data:text/json;charset=utf-8,"+encodeURIComponent(JSON.stringify(s)),e=document.createElement("a");if(e.textContent="Download",!e)throw Error("Something bad happened. Call a shrink");e==null||e.setAttribute("href",i),e==null||e.setAttribute("download","export.json"),(a=document.querySelector("p"))==null||a.remove(),t.append(e)});