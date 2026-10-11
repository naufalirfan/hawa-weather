export type GeoResult = { id:number; name:string; latitude:number; longitude:number; country:string; admin1?:string };
export const WMO: Record<number, { label:string; icon:string }> = {
  0:{label:"Cerah",icon:"○"},1:{label:"Cerah sebagian",icon:"◐"},2:{label:"Berawan",icon:"◑"},3:{label:"Mendung",icon:"●"},
 45:{label:"Berkabut",icon:"◎"},48:{label:"Kabut es",icon:"◎"},51:{label:"Gerimis ringan",icon:"◐"},53:{label:"Gerimis",icon:"◐"},55:{label:"Gerimis lebat",icon:"●"},
 56:{label:"Gerimis beku",icon:"●"},57:{label:"Gerimis beku lebat",icon:"●"},61:{label:"Hujan ringan",icon:"◑"},63:{label:"Hujan",icon:"●"},65:{label:"Hujan lebat",icon:"●"},
 66:{label:"Hujan beku",icon:"●"},67:{label:"Hujan beku lebat",icon:"●"},71:{label:"Salju ringan",icon:"○"},73:{label:"Salju",icon:"◐"},75:{label:"Salju lebat",icon:"●"},
 77:{label:"Butiran salju",icon:"●"},80:{label:"Hujan rintik",icon:"◑"},81:{label:"Hujan sedang",icon:"●"},82:{label:"Hujan deras",icon:"●"},
 85:{label:"Salju rintik",icon:"○"},86:{label:"Salju deras",icon:"●"},95:{label:"Petir",icon:"⚡"},96:{label:"Petir + hujan es",icon:"⚡"},99:{label:"Petir + es lebat",icon:"⚡"},
};
export function wmo(code:number){ return WMO[code] ?? {label:"Cuaca "+code, icon:"◐"}; }
export function orbStyle(code:number, isDay:number){
  // return orb gradient + glow based on weather
  if([95,96,99].includes(code)) return { bg:"radial-gradient(circle at 35% 30%, #fef9c3 0%, #f59e0b 22%, #1e1b4b 62%, transparent 72%)", glow:"rgba(245,158,11,.5)" };
  if([65,67,82,81,80,63,61].includes(code)) return { bg:"radial-gradient(circle at 35% 30%, #dbeafe 0%, #60a5fa 18%, #1e3a5a 55%, transparent 72%)", glow:"rgba(96,165,250,.4)" };
  if([3,2].includes(code)) return { bg:"radial-gradient(circle at 35% 30%, #e2e8f0 0%, #94a3b8 20%, #334155 58%, transparent 72%)", glow:"rgba(148,163,184,.3)" };
  if(code===0 && isDay===1) return { bg:"radial-gradient(circle at 35% 30%, #fffbeb 0%, #fde68a 12%, #f59e0b 30%, #1e3a5a 68%, transparent 72%)", glow:"rgba(253,230,138,.55)" };
  if(code===0 && isDay===0) return { bg:"radial-gradient(circle at 35% 30%, #e0e7ff 0%, #a5b4fc 18%, #1e1b4b 62%, transparent 72%)", glow:"rgba(165,180,252,.35)" };
  return { bg:"radial-gradient(circle at 35% 30%, #e6f4ff 0%, #9FD8FF 18%, #5ba8e6 42%, #1e3a5a 68%, transparent 72%)", glow:"rgba(159,216,255,.35)" };
}
