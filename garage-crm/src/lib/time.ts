// src/lib/time.ts
export function toDublin(date: Date, tz: string) {
  // We’ll format only; math is in UTC ms
  return new Intl.DateTimeFormat('en-IE', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: tz || 'Europe/Dublin'
  }).format(date);
}

export function ymdInTz(d: Date, tz: string) {
  const f = new Intl.DateTimeFormat('en-IE', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' });
  const parts = f.formatToParts(d);
  const year  = +parts.find(p=>p.type==='year')!.value;
  const month = +parts.find(p=>p.type==='month')!.value;
  const day   = +parts.find(p=>p.type==='day')!.value;
  return {year, month, day};
}

export function localToUtcMs(year:number, month:number, day:number, hour:number, minute:number, second:number, tz:string){
  const guess = Date.UTC(year, month-1, day, hour, minute, second);
  const f = new Intl.DateTimeFormat('en-IE', {
    timeZone: tz, hour12:false,
    year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'
  });
  const parts = f.formatToParts(new Date(guess));
  const y=+parts.find(p=>p.type==='year')!.value;
  const m=+parts.find(p=>p.type==='month')!.value;
  const d=+parts.find(p=>p.type==='day')!.value;
  const h=+parts.find(p=>p.type==='hour')!.value;
  const mi=+parts.find(p=>p.type==='minute')!.value;
  const s=+parts.find(p=>p.type==='second')!.value;
  const asUtc = Date.UTC(y,m-1,d,h,mi,s);
  const offset = asUtc - guess;
  return guess - offset;
}