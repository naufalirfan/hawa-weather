import type {Metadata, Viewport} from "next";
import "./globals.css";
export const metadata:Metadata={title:"TEMPER — weather orb",description:"Glassmorphism weather instrument — powered by Open-Meteo"};
export const viewport:Viewport={width:"device-width",initialScale:1,maximumScale:5,viewportFit:"cover"};
export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="id"><body className="min-h-screen antialiased">{children}</body></html>;
}
